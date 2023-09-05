import { Dayjs } from "dayjs";
import { ElementHandle } from "puppeteer";
import { Lesson } from "@models/Lesson";
import { HtmlService } from "@services/HtmlService";
import { Constants } from "@constants";
import { InvalidHtmlElementError } from "@errors/InvalidHtmlElementError";

export class LessonService {
    private static _instance?: LessonService;
    private static readonly DURATION_MINUTES_PER_COLUMN = 15;

    public static getInstance(): LessonService {
        if (!this._instance) {
            this._instance = new LessonService();
        }

        return this._instance;
    }

    public async getLessons(element: ElementHandle, date: Dayjs): Promise<Lesson[]> {
        const lessonElements = await element.$$('xpath/td[contains(@id,\'slot-\')]');

        return Promise.all(
            lessonElements.map(async (td: ElementHandle) => {
                return this.getLessonFromHtml(td, date);
            })
        );
    }

    public async getLessonFromHtml(element: ElementHandle, date: Dayjs): Promise<Lesson> {
        // We should have 2 tr tag's
        const trLessonData = await element.$$('tr');
        if (trLessonData.length !== 2) {
            throw new InvalidHtmlElementError(`Le nombre de <tr> n'est pas valide (${trLessonData.length} au lieu de 2)`);
        }

        // We should have 2 td elements
        const otherData = await trLessonData[1].$$('td');
        if (otherData.length !== 2) {
            throw new InvalidHtmlElementError(`Le nombre de <td> n'est pas valide (${otherData.length} au lieu de 2)`);
        }

        const teacher = await HtmlService.getInstance().getText(otherData[1]);

        const description = await HtmlService.getInstance().getText(trLessonData[0].$('td'));
        let descriptionGroups = description.match(Constants.REG_LESSON_FULL_DESCRIPTION)?.groups;

        let place: string;
        let startTime: string;
        if (descriptionGroups) {
            startTime = await HtmlService.getInstance().getText(otherData[0]); // Format: HHhMM
            place = `${descriptionGroups.room} | ${descriptionGroups.department} ( ${descriptionGroups.building} )`;
        } else {
            descriptionGroups = description.match(Constants.REG_LESSON_SHORT_DESCRIPTION)?.groups;
            if (!descriptionGroups) {
                throw new InvalidHtmlElementError('aucun élément comportant le nom et le type de la leçon n\'a été trouvé');
            }

            const startHourPlace = await HtmlService.getInstance().getText(otherData[0]); // Format: HHhMM @ Place
            let startGroups = startHourPlace.match(Constants.REG_LESSON_START_TIME_WITH_PLACE)?.groups;
            if (!startGroups) {
                throw new InvalidHtmlElementError('aucun élément comportant l\'heure de début n\'a été trouvé');
            }

            startTime = startGroups.startHour;
            place = startGroups.place ?? `${startGroups.room} | Département INFO ( Bât. Blaise Pascal )`;
        }

        const [hour, minutes] = startTime.split(startTime[2]).map(Number);
        const start = date.tz(Constants.TIMEZONE).hour(hour).minute(minutes);
        return new Lesson(
            start,
            this._findEndDateFromColspan(
                start,
                Number(await HtmlService.getInstance().getAttributeValue(element, 'colspan'))
            ),
            teacher,
            descriptionGroups.name,
            descriptionGroups.type,
            place
        );
    }

    /**
     * Find the end date of the lesson from the colspan and the start date
     *
     * @param start     Start date of the lesson
     * @param colspan   Number of columns used by the lesson on the planning website
     */
    private _findEndDateFromColspan(start: Dayjs, colspan: number): Dayjs {
        let end = start;

        while (colspan > 0) {
            end = end.add(LessonService.DURATION_MINUTES_PER_COLUMN, 'minutes');
            colspan--;

            if (end.minute() === 0) {
                // Each hour is seperated by an empty column, so we have to skip it
                colspan--;
            }
        }

        return end;
    }
}
