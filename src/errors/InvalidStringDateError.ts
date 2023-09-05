import { CustomError } from "./CustomError";

export class InvalidStringDateError extends CustomError {
    constructor(date: string) {
        super(`La date "${date}" est invalide, merci de la saisir au format DD/MM/YYYY ( ex: 19/11/2021 ).`);
    }
}
