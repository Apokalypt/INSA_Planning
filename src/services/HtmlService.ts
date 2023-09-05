import type { ElementHandle } from "puppeteer";

export class HtmlService {
    private static _instance?: HtmlService;

    public static getInstance(): HtmlService {
        if (!this._instance) {
            this._instance = new HtmlService();
        }

        return this._instance;
    }

    public async getText(elementOrPromise: ElementHandle | Promise<ElementHandle | null>): Promise<string> {
        return this.getPropertyValue(elementOrPromise, 'textContent');
    }

    public async getPropertyValue(elementOrPromise: ElementHandle | Promise<ElementHandle | null>, propertyName: string): Promise<string> {
        if (!elementOrPromise) {
            return '';
        }

        const element = await elementOrPromise;
        const value = await element?.evaluate( (el, prop) => el[prop], propertyName);
        return String(value  ?? '');
    }

    public async getAttributeValue(elementOrPromise: ElementHandle | Promise<ElementHandle | null>, attributeName: string): Promise<string> {
        if (!elementOrPromise) {
            return '';
        }

        const element = await elementOrPromise;
        const value = await element?.evaluate( (el, attr) => el.getAttribute(attr), attributeName);
        return String(value  ?? '');
    }
}
