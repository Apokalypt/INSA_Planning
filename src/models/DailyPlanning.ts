import dayjs, { Dayjs } from "dayjs";
import { Lesson } from "@models/Lesson";
import { MessageActionRow, MessageButton, MessageEmbed, WebhookEditMessageOptions } from "discord.js";
import { Utils } from "@models/Utils";
import { Constants } from "@constants";
import webdriver, { By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import 'chromedriver';
import type { BotClient } from "@models/BotClient";
import type { SWSSupervisor } from "@models/SWSSupervisor";

export class DailyPlanning {
    lessons: Lesson[];
    date: Dayjs;
    swsSupervisor?: SWSSupervisor;


    constructor(lessons: Lesson[], date: Dayjs, swsSupervisor?: SWSSupervisor) {
        this.lessons = lessons;
        this.date = date;
        this.swsSupervisor = swsSupervisor;
    }

    /**
     * We construct a daily planning based on the planning found on the website
     * @param date
     */
    static async fetchDailyPlanning(date: Dayjs): Promise<DailyPlanning> {
        let options = new chrome.Options();
        options.setChromeBinaryPath(require('puppeteer').executablePath());
        options.addArguments('--headless');
        options.addArguments('--disable-gpu');
        options.addArguments('--window-size=1280,960');

        const driver = await new webdriver.Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        // Load planning URL
        await driver.get(Constants.PLANNING_URL);

        // Check if we need to login to access planning
        if ((await driver.getCurrentUrl()).includes('/login')) {
            const usernameInput = await driver.findElement(By.id('username'));
            await usernameInput.sendKeys(Constants.LOGIN);
            const passwordInput = await driver.findElement(By.id('password'));
            await passwordInput.sendKeys(Constants.PASSWORD);

            await driver.findElement(By.name('submit')).click();

            // If after the login we are still on the login page, we throw an error
            if (await driver.getCurrentUrl() !== Constants.PLANNING_URL) {
                throw Error('Login failed');
            }
        }

        // We search a <th> with the date of the planning we want
        const thDay = await driver.findElement(By.xpath(`//*[text()[contains(.,'${date.format('DD/MM/YYYY')}')]]`));
        // If found, we search the <tr> parent to have all information about the daily planning
        const trDay = await thDay.findElement(By.xpath('..'));
        // We convert all <td> into lesson objects
        const lessons: Lesson[] = await Promise.all(
            (await trDay.findElements(By.xpath('td[contains(@id,\'slot-\')]')))
                .map(lessonCode => Lesson.createFromHTMLCode(date, lessonCode))
        );

        // We close the browser to avoid RAM increasing and memory leaks
        await driver.quit();

        const supervisors: SWSSupervisor[] = require('../data/SWSSupervisors.json');
        const supervisor = supervisors.find( s => date.isSameOrAfter(dayjs(s.begin, "DD/MM/YYYY"), "days") && date.isSameOrBefore(dayjs(s.end, "DD/MM/YYYY"), "days") );

        // We return a daily planning object based on previous data
        return new DailyPlanning(lessons, date, supervisor);
    }


    /**
     * Generate webhook edit options from the current daily planning
     */
    toWebhookEditMessageOptions(): WebhookEditMessageOptions {
        return {
            embeds: [this._toEmbed()],
            components: [
                new MessageActionRow()
                    .setComponents(
                        new MessageButton()
                            .setCustomId(this.date.add(this.date.day() === 5 ? 3 : 1, 'day').format('DD/MM/YYYY'))
                            .setLabel("Voir le planning du jour suivant")
                            .setStyle("PRIMARY")
                            .setEmoji("🗓️")
                    )
            ]
        };
    }


    /**
     * Publish the daily planning on the dedicated channel
     *
     * @param client
     */
    async publish(client: BotClient): Promise<void> {
        return client.channels.fetch(process.env.INSA_PLANNING_CHANNEL_ID ?? "")
            .then(async channel => {
                if (channel?.isText()) await channel.send(this.toWebhookEditMessageOptions());
            })
    }

    /**
     * Plan the reminder for each lesson
     *
     * @param client
     */
    planSWSReminders(client: BotClient) {
        this.lessons.forEach( lesson => lesson.planSWSReminder(client, this.swsSupervisor) );
    }

    /**
     * Generate an embed message based on the daily planning
     */
    private _toEmbed(): MessageEmbed {
        const title = Utils.bold(":calendar:  Emploi du temps du <t:" + this.date.hour(0).minute(0).unix() + ":D> :");

        if (this.lessons.length === 0) {
            return new MessageEmbed()
                .setTitle(title)
                .setColor("GREEN")
                .setDescription("Vous n'avez pas de cours programmé pour aujourd'hui. Reposez-vous bien :thumbsup:")
                .setURL(Constants.PLANNING_URL);
        } else {
            const embed = new MessageEmbed()
                .setTitle(title)
                .setColor("YELLOW")
                .setDescription(
                    "\u200b\n" +
                    (this.swsSupervisor ? `<@${this.swsSupervisor.id}> est chargé de SWS pour aujourd'hui!` : "*Impossible de déterminer la personne chargée de SWS pour aujourd'hui...*") +
                    "\n\n"
                )
                .setURL(Constants.PLANNING_URL);

            let lastLesson: Lesson;
            this.lessons.forEach( lesson => {
                embed.setDescription(
                    embed.description +
                    `${!lastLesson || lastLesson.endDate.isSame(lesson.startDate) ? "\n" : "\n-----\n\n"}` +
                    lesson.toStringEmbed()
                );
                lastLesson = lesson;
            });

            return embed;
        }
    }
}
