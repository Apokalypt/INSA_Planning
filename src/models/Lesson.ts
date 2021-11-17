import { Dayjs } from "dayjs";
import { By, WebElement } from "selenium-webdriver";
import { Utils } from "@models/Utils";

export class Lesson {
    startDate: Dayjs;
    endDate: Dayjs;
    teacher: string;
    place?: string;
    title: string;
    type: string;


    constructor(startDate: Dayjs, colspan: number, teacher: string, title: string, type: string, place?: string) {
        this.startDate = startDate;
        this.endDate = this.findEndDateFromColspan(colspan);
        this.teacher = teacher;
        this.place = place;
        this.title = title;
        this.type = type;
    }

    /**
     * Find the end date of the lesson from the colspan and the start date
     *
     * @param colspan Number of columns used by the lesson on the planning website
     */
    findEndDateFromColspan(colspan: number): Dayjs {
        let end = this.startDate;

        while (colspan >= 0) {
            end = end.add(15, 'minutes');

            colspan--;
            if (end.minute() === 0) colspan--;
        }

        return end;
    }


    static async createFromHTMLCode(date: Dayjs, element: WebElement) {
        const colspan = parseInt(await element.getAttribute("colspan")); // We used that to determine the duration of the lesson
        // We should have 2 tr elements
        const trLessonData = await element.findElements(By.css("tr"));
        if (trLessonData.length !== 2) {
            throw new Error("Lesson data should have 2 tr elements");
        }

        const description = await trLessonData[0].findElement(By.css('td')).getText();
        let descriptionRegExp = /(?<name>.*) \((?<room>.*) - (?<department>.*) - (?<building>.*)\) \[(?<type>(CM|TD|TP|EV|EDT))]/;
        let descriptionData = description.match(descriptionRegExp)?.groups;
        if (descriptionData) {
            // We should have 2 td elements
            const otherData = await trLessonData[1].findElements(By.css('td'));
            if (otherData.length !== 2) {
                throw new Error("Lesson description should have 2 td elements");
            }

            const startHour = await otherData[0].getText(); // Format: HHhMM
            const teacher = await otherData[1].getText();

            return new Lesson(
                date.hour(parseInt(startHour.split("h")[0])).minute(parseInt(startHour.split("h")[1])),
                colspan,
                teacher,
                descriptionData.name,
                descriptionData.type,
                `${descriptionData.room} | ${descriptionData.department} ( ${descriptionData.building} )`
            );
        } else {
            let descriptionRegExp = /(?<name>.*) \[(?<type>(CM|TD|TP|EDT|EV))]/;
            descriptionData = description.match(descriptionRegExp)?.groups;
            if (!descriptionData) {
                throw new Error("Lesson description should have a name and a type");
            }

            // We should have 2 td elements
            const otherData = await trLessonData[1].findElements(By.css('td'));
            if (otherData.length !== 2) {
                throw new Error("Lesson description should have 2 td elements");
            }

            const startHourPlace = await otherData[0].getText(); // Format: HHhMM @ Place
            const startHourPlaceRegExp = /(?<startHour>[0-2][0-9]:[0-5][0-9]) @ (?<room>.*)/;
            let startHourPlaceData = startHourPlace.match(startHourPlaceRegExp)?.groups;
            if (!startHourPlaceData && !startHourPlace.match(/^[0-2][0-9]h[0-5][0-9]$/)) {
                throw new Error("Lesson description should have a start hour and a place");
            } else if (!startHourPlaceData) {
                return new Lesson(
                    date.hour(parseInt(startHourPlace.split("h")[0])).minute(parseInt(startHourPlace.split("h")[1])),
                    colspan,
                    await otherData[1].getText(),
                    descriptionData.name,
                    descriptionData.type
                );
            } else {
                const startHour = startHourPlaceData.startHour;

                return new Lesson(
                    date.hour(parseInt(startHour.split("h")[0])).minute(parseInt(startHour.split("h")[1])),
                    colspan,
                    await otherData[1].getText(),
                    descriptionData.name,
                    descriptionData.type,
                    `${startHourPlaceData.room} | Département INFO ( Bât. Blaise Pascal )`
                );
            }
        }
    }

    getEmojiTime(): string {
        let hour = this.startDate.hour();
        if (hour > 12) {
            hour -= 12;
        }

        const minutes = this.startDate.minute();
        if (minutes === 30) {
            return `:clock${hour}${minutes}:`
        } else {
            return `:clock${hour}:`
        }
    }

    toStringEmbed(): string {
        return `${this.getEmojiTime()}  <t:${this.startDate.unix()}:t> - <t:${this.endDate.unix()}:t>` + "\n" +
            `${Utils.getEmojiFromLessonType(this.type)}  **${this.type}**  |  ${this.title}` + "\n" +
            `:school:  ${this.place ?? ""}` + "\n" +
            `:teacher:  ${this.teacher}` + "\n";
    }
}
