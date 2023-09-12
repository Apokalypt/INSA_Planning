import type { Dayjs } from "dayjs";
import type { Page } from "puppeteer";

export interface PlanningPage {
    content: Page;
    lastUpdatedAt: Dayjs;
}
