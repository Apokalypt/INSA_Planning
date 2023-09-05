import type { Dayjs } from "dayjs";
import { CustomError } from "./CustomError";

export class NoDailyPlanningError extends CustomError {
    constructor(date: Dayjs) {
        super(`Impossible de trouver le planning du ${date.format('DD/MM/YYYY')}.`);
    }
}
