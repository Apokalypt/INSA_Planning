import { Dayjs } from "dayjs";
import { Lesson } from "@models/Lesson";
import { MessageEmbed } from "discord.js";
import { Utils } from "@models/Utils";
import { Constants } from "@constants";
import webdriver, { By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import 'chromedriver';
import type { BotClient } from "@models/BotClient";

export class DailyPlanning {
    lessons: Lesson[];
    date: Dayjs;


    constructor(lessons: Lesson[], date: Dayjs) {
        this.lessons = lessons;
        this.date = date;
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
        const lessonsCode: Lesson[] = await Promise.all(
            (await trDay.findElements(By.xpath('td[contains(@id,\'slot-\')]')))
                .map(lessonCode => Lesson.createFromHTMLCode(date, lessonCode))
        );

        // We close the browser to avoid RAM increasing and memory leaks
        await driver.quit();

        // We return a daily planning object based on previous data
        return new DailyPlanning(lessonsCode, date);
    }


    generateEmbed(): MessageEmbed {
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
                .setURL(Constants.PLANNING_URL);

            this.lessons.forEach( (lesson, index) => {
                embed.setDescription(
                    (embed.description ?? "\u200b\n") +
                    lesson.toStringEmbed() +
                    (index === this.lessons.length - 1 ? '' : '\n\n')
                );
            });

            return embed;
        }
    }


    /**
     * Publish the daily planning on the dedicated channel
     *
     * @param client
     */
    async publish(client: BotClient): Promise<void> {
        return client.channels.fetch(process.env.INSA_PLANNING_CHANNEL_ID ?? "")
            .then(async channel => {
                if (channel?.isText()) await channel.send({embeds: [this.generateEmbed()]});
            })
    }

    /**
     * Plan the reminder for each lesson
     *
     * @param client
     */
    planSWSReminders(client: BotClient) {
        this.lessons.forEach( lesson => lesson.planSWSReminder(client) );
    }
}
