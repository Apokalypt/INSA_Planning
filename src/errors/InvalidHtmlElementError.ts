import { CustomError } from "./CustomError";

export class InvalidHtmlElementError extends CustomError {
    constructor(message: string) {
        super(`Le format de l'élément HTML n'est pas valide pour effectuer un parse correct : ${message}.`);
    }
}
