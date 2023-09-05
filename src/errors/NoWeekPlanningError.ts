import { CustomError } from "./CustomError";

export class NoWeekPlanningError extends CustomError {
    constructor(weekIndex: number) {
        super(`Impossible de trouver le planning de la semaine ${weekIndex}.`);
    }
}
