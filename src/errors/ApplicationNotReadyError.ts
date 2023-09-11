import { CustomError } from "./CustomError";

export class ApplicationNotReadyError extends CustomError {
    constructor() {
        super("L'application n'est pas prête à l'utilisation. Veuillez réessayer plus tard...");
    }
}
