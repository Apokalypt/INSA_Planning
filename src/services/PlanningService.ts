import type { Dayjs } from "dayjs";
import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer";
import dayjs from "dayjs";
import { PlanningPage } from "@models/PlanningPage";
import { DailyPlanning } from "@models/DailyPlanning";
import { LessonService } from "@services/LessonService";
import { Constants } from "@constants";
import { NoDailyPlanningError } from "@errors/NoDailyPlanningError";

export class PlanningService {
    public readonly pages: { [key: string]: PlanningPage };

    private _isReadyPromise: Promise<any> | null = null;
    private _puppeteerBrowser!: Browser;
    private readonly _pendingPages: { [key: string]: Promise<PlanningPage> };

    private static _instance?: PlanningService;

    private constructor() {
        this.pages = { };
        this._pendingPages = { };

        this._isReadyPromise = new Promise<void>((resolve, reject) => {
            puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] })
                .then( browser => {
                    this._puppeteerBrowser = browser;
                    resolve();
                    this._isReadyPromise = null;
                })
                .catch( error => {
                    console.error(error);
                    reject(error);
                });
        });

        setInterval( () => {
            for (const url in this.pages) {
                this._refreshPlanningPage(url)
                    .catch( console.error );
            }
        }, 15 * 60 * 1000);
    }


    public static getInstance(): PlanningService {
        if (!this._instance) {
            this._instance = new PlanningService();
        }

        return this._instance;
    }

    public async getDailyPlanning(url: string, date: Dayjs): Promise<DailyPlanning> {
        await this._isReady();

        const page = await this._loadPlanningPage(url);

        // We search a <th> with the date of the planning we want
        const thDay = (await page.content.$x(`//*[text()[contains(.,'${date.format('DD/MM/YYYY')}')]]`))[0];
        // If found, we search the parent tag to have all information about the daily planning. Should be a <tr>
        const trDay = await thDay?.$('xpath/..');
        if (!trDay) {
            throw new NoDailyPlanningError(date);
        }

        const lessons = await LessonService.getInstance().getLessons(trDay, date);

        return new DailyPlanning(lessons, date, page.lastUpdatedAt);
    }

    private async _isReady(): Promise<void> {
        if (this._isReadyPromise) {
            return this._isReadyPromise;
        }

        return Promise.resolve();
    }

    private async _refreshPlanningPage(url: string): Promise<PlanningPage> {
        return this._loadPlanningPage(url, true);
    }

    private async _loadPlanningPage(url: string, force?: boolean): Promise<PlanningPage> {
        if (this._pendingPages[url] != null) {
            await this._pendingPages[url];
        }

        if (this.pages[url] && !force) {
            return this.pages[url];
        }

        this._pendingPages[url] = new Promise<PlanningPage>((resolve, reject) => {
            this._puppeteerBrowser.newPage()
                .then( async page => {
                    await page.goto(url, { waitUntil: 'load' });
                    return page;
                })
                .then( async page => {
                    await this._handleAuthentication(page, url);
                    return page;
                })
                .then( page => {
                    if (this.pages[url]) {
                        this.pages[url].content.close();
                    }

                    this.pages[url] = { content: page, lastUpdatedAt: dayjs().tz('Europe/Paris') };
                    resolve(this.pages[url]);
                })
                .catch( error => {
                    console.error(error);
                    reject(error);
                })
        });

        const page = await this._pendingPages[url];
        delete this._pendingPages[url];
        return page;
    }

    private async _handleAuthentication(page: Page, url: string): Promise<Page> {
        if (page.url().startsWith('https://login')) {
            await page.type('#username', Constants.LOGIN, { delay: 100 });
            await page.type('#password', Constants.PASSWORD, { delay: 100 });

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                page.click('input[type=submit]'),
            ]);

            if (page.url() !== url) {
                throw Error('An unexpected error occurred during the authentication.');
            }
        }

        return Promise.resolve(page);
    }
}