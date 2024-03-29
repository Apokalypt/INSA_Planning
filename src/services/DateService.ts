import dayjs, { Dayjs } from "dayjs";
import { Constants } from "@constants";
import { InvalidStringDateError } from "@errors/InvalidStringDateError";

export class DateService {
    private static _instance?: DateService;

    public static getInstance(): DateService {
        if (!this._instance) {
            this._instance = new DateService();
        }

        return this._instance;
    }

    public parse(dateString: string): Dayjs {
        const formats = ["D-M-YYYY", "DD-M-YYYY", "DD-MM-YYYY", "D-MM-YYYY", "D/M/YYYY", "DD/M/YYYY", "D/MM/YYYY", "DD/MM/YYYY"];
        const date = dayjs(dateString, formats, true);
        if (!date?.isValid()) {
            throw new InvalidStringDateError(dateString);
        }

        return date;
    }

    public isWorkDay(date: Dayjs): boolean {
        return date.day() !== 0 && date.day() !== 6;
    }

    public generateListDaysWorked(count: number): Dayjs[] {
        let date = dayjs().tz(Constants.TIMEZONE);

        const daysWorked: Dayjs[] = [];
        while (daysWorked.length < count) {
            if (this.isWorkDay(date)) {
                daysWorked.push(date);
            }

            date = date.add(1, "day");
        }

        return daysWorked;
    }

    public formatToLocaleFr(date: Dayjs): string {
        return date.toDate().toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }

    public getPreviousWeekIndex(referenceWeekIndex?: number): number {
        const date = dayjs().tz(Constants.TIMEZONE);
        if (referenceWeekIndex === undefined) {
            return date.subtract(1, 'week').week()
        } else {
            return date.week(referenceWeekIndex).subtract(1, 'week').week()
        }
    }
    public getCurrentWeekIndex(): number {
        return dayjs().tz(Constants.TIMEZONE).week()
    }
    public getNextWeekIndex(referenceWeekIndex?: number): number {
        const date = dayjs().tz(Constants.TIMEZONE);
        if (referenceWeekIndex === undefined) {
            return date.add(1, 'week').week()
        } else {
            return date.week(referenceWeekIndex).add(1, 'week').week()
        }
    }
}

