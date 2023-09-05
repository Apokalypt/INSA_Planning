import type { Dayjs } from "dayjs";
import { Utils } from "@models/Utils";

export class Lesson {
    startDate: Dayjs;
    endDate: Dayjs;
    teacher: string;
    place?: string;
    title: string;
    type: string;


    constructor(startDate: Dayjs, endDate: Dayjs, teacher: string, title: string, type: string, place?: string) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.teacher = teacher;
        this.place = place;
        this.title = title;
        this.type = type;
    }

    getEmojiTime(): string {
        const hour = (this.startDate.hour() % 12) + 1;
        const minutes = this.startDate.minute();

        if (minutes === 30) {
            return `:clock${hour}${minutes}:`
        } else {
            return `:clock${hour}:`
        }
    }

    toStringEmbed(): string {
        let str = `${this.getEmojiTime()}  <t:${this.startDate.unix()}:t> - <t:${this.endDate.unix()}:t>\n` +
            `${Utils.getEmojiFromLessonType(this.type)}  **${this.type}**  |  ${this.title}`;
        if (this.place) {
            str += `\n:school:  ${this.place}`;
        }
        if (this.teacher) {
            str += `\n:teacher:  ${this.teacher}`;
        }

        return str;
    }
}
