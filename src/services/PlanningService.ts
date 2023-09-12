import type { Dayjs } from "dayjs";
import type { Browser, Page } from "puppeteer";
import dayjs from "dayjs";
import puppeteer from "puppeteer";
import { PlanningPage } from "@models/planning/PlanningPage";
import { Configuration } from "@models/planning/Configuration";
import { DailyPlanning } from "@models/planning/DailyPlanning";
import { WeeklyPlanning } from "@models/planning/WeeklyPlanning";
import { LessonService } from "@services/LessonService";
import { Constants } from "@constants";
import { NoWeekPlanningError } from "@errors/NoWeekPlanningError";
import { NoDailyPlanningError } from "@errors/NoDailyPlanningError";
import { ApplicationNotReadyError } from "@errors/ApplicationNotReadyError";

/*
 * A current issue with puppeteer block us from using 2 pages at the same time leading to a timeout error. Please, make
 * sure to use only one page at a time.
 *
 * See https://github.com/puppeteer/puppeteer/issues/8693 for more information.
 */

export class PlanningService<IsReady extends boolean = false> {
    public readonly cache: { [key: string]: PlanningPage };

    private _puppeteerBrowser!: IsReady extends true ? Browser : (Browser | undefined);
    private readonly _pendingPages: { [key: string]: Promise<PlanningPage> };

    private static _instance?: PlanningService;

    private constructor() {
        this.cache = { };
        this._pendingPages = { };

        setInterval( async () => {
            if (!this._isReady()) {
                return;
            }

            for (const url in this.cache) {
                await this._refreshPlanningPage(url)
                    .catch( console.error );
            }
        }, 15 * 60 * 1000);
    }

    public async getDailyPlanning(configuration: Configuration, date: Dayjs): Promise<DailyPlanning> {
        if (!this._isReady()) {
            throw new ApplicationNotReadyError();
        }

        const page = await this._getPlanningPage(configuration.planning);

        // We search a <th> with the date of the planning we want
        const thDay = (await page.content.$x(`//*[text()[contains(.,'${date.format('DD/MM/YYYY')}')]]`))[0];
        // If found, we search the parent tag to have all information about the daily planning. Should be a <tr>
        const trDay = await thDay?.$('xpath/..');
        if (!trDay) {
            throw new NoDailyPlanningError(date);
        }

        const lessons = await LessonService.getInstance().getLessons(trDay, date);

        return new DailyPlanning(configuration, lessons, date, page.lastUpdatedAt);
    }

    public async getBufferOfScreenWeeklyPlanning(configuration: Configuration, weekIndex: number): Promise<WeeklyPlanning> {
        if (!this._isReady()) {
            throw new ApplicationNotReadyError();
        }

        const page = await this._getPlanningPage(configuration.planning);

        // Scroll to h2 with id "EdT-S<currentWeekIndex>"
        const element = await page.content.$(`#EdT-S${weekIndex}`);
        if (!element) {
            throw new NoWeekPlanningError(weekIndex);
        }

        // Get next element after h2, it should be the table of the planning
        const tableElement = await element.$('xpath/following-sibling::*[1]');
        if (!tableElement) {
            throw new NoWeekPlanningError(weekIndex);
        }

        // Bring the page to the front to avoid screenshot to hang forever
        await page.content.bringToFront(); // FIXME : concurrent access to another page can lead to a timeout error
        const res = await tableElement.screenshot({ type: 'png', encoding: 'binary' });

        return new WeeklyPlanning(configuration, weekIndex, tableElement, res);
    }

    /**
     * Try to initialize the browser. If it fails, it will retry after 5 seconds and increment the retry count.
     * This function should be called as soon as possible to avoid any delay.
     *
     * @param callback      Function to call when the browser is ready
     * @param retryCount    Number of retry already done
     */
    public initialize(callback: Function, retryCount = 0): void {
        puppeteer.launch(Constants.PUPPETEER_OPTIONS)
            .then( async browser => {
                this._puppeteerBrowser = browser;

                if (!this._isReady()) {
                    // Should never occur but use that to avoid TS error
                    return;
                }

                // Try to save all planning pages in cache, don't use Promise.all() to avoid using multiple pages at the
                //  same time (look at the top of the file for more information)
                for (const configuration of Constants.CONFIGURATIONS) {
                    try {
                        await this._getPlanningPage(configuration.planning);
                    } catch (error) {
                        console.error(`An error occurred during the initialization of the planning page ${configuration.planning}`, error);
                    }

                    // Delay interactions with the browser to avoid timeout error, just in case...
                    await new Promise(resolve => setTimeout(resolve, 1_000));
                }

                callback();
            })
            .catch( error => {
                console.error(`An error occurred during the initialization of the browser. Retrying in 5 seconds... (${retryCount} retries)`, error);

                setTimeout( () => {
                    this.initialize(callback, retryCount + 1);
                }, 5_000);
            });
    }

    public static getInstance(): PlanningService {
        if (!this._instance) {
            this._instance = new PlanningService();
        }

        return this._instance;
    }


    private _isReady(): this is PlanningService<true> {
        return this._puppeteerBrowser != null;
    }

    private async _refreshPlanningPage(this: PlanningService<true>, url: string): Promise<PlanningPage> {
        if (this._pendingPages[url] != null) {
            await this._pendingPages[url];
        }

        const cache = this._getPageFromCache(url);
        if (!cache) {
            return this._getPlanningPage(url);
        }

        await this._loadPlanningPage(cache.content, url, true);
        cache.lastUpdatedAt = dayjs().tz(Constants.TIMEZONE);

        return cache;
    }

    private async _getPlanningPage(this: PlanningService<true>, url: string): Promise<PlanningPage> {
        if (this._pendingPages[url] != null) {
            await this._pendingPages[url];
        }

        const cache = this._getPageFromCache(url);
        if (cache) {
            return cache;
        }

        // FIXME : concurrent access to another page can lead to a timeout error (multiple pages at the same time)
        this._pendingPages[url] = new Promise<PlanningPage>((resolve, reject) => {
            this._puppeteerBrowser.newPage()
                .then( page => {
                    return this._loadPlanningPage(page, url, false);
                })
                .then( async page => {
                    // Only useful if we want to make screenshot of the page
                    await page.setViewport({ width: 1920, height: 1080 });

                    const cache = this._getPageFromCache(url);
                    if (cache && cache.content != page) {
                        this._removePageFromCache(url);
                    }

                    this._setPageInCache(url, page);

                    resolve(this.cache[url]);
                })
                .catch( error => {
                    console.error(error);
                    reject(error);
                })
        });

        return this._pendingPages[url]
            .finally( () => {
                delete this._pendingPages[url];
            });
    }

    private async _loadPlanningPage(page: Page, url: string, shouldRefresh: boolean): Promise<Page> {
        if (page.url() !== url) {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
        } else if (shouldRefresh) {
            await page.reload({ waitUntil: 'domcontentloaded' });
        }

        // Check if the server redirect us to the login page
        if (page.url().startsWith('https://login')) {
            await page.type('#username', Constants.LOGIN);
            await page.type('#password', Constants.PASSWORD);

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                page.click('input[type=submit]'),
            ]);

            if (page.url() !== url) {
                throw Error('An unexpected error occurred during the authentication. Url after authentication: ' + page.url());
            }
        }

        return page;
    }

    private _getPageFromCache(url: string): PlanningPage | undefined {
        return this.cache[url];
    }
    private _removePageFromCache(url: string): void {
        const cache = this._getPageFromCache(url);
        if (cache) {
            cache.content.close();
            delete this.cache[url];
        }
    }
    private _setPageInCache(url: string, page: Page): void {
        const cache = this._getPageFromCache(url);
        if (cache) {
            cache.lastUpdatedAt = dayjs().tz(Constants.TIMEZONE);
        } else {
            this.cache[url] = { content: page, lastUpdatedAt: dayjs().tz(Constants.TIMEZONE) };
        }
    }
}
