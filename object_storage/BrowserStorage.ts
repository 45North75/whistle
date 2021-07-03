import * as puppeteer from 'puppeteer';
import { BrowserMode } from './enums/BrowserMode';

export default class BrowserRepo
{
    private static browserHeadless: puppeteer.Browser = null;
    private static browser: puppeteer.Browser = null;
    public static mode: BrowserMode;

    private constructor(){};

    private static async getBrowserHeadless(): Promise<puppeteer.Browser>
    {
        if (BrowserRepo.browserHeadless == null)
        {
            BrowserRepo.browserHeadless = await puppeteer.launch({ headless: true });
            return BrowserRepo.browserHeadless;
        } else {
            return BrowserRepo.browserHeadless;
        }
    }

    public static async init(mode: BrowserMode): Promise<boolean>
    {
        try {
            switch(mode)
            {
                case BrowserMode.Headless:
                    await this.getBrowserHeadless();
                    break;
                case BrowserMode.Standard:
                    await this.getBrowser();
                    break;
                default: throw new Error("No mode set");
            }
            this.mode = mode;
            return true;
        } catch(ex: any)
        {
            console.error(ex.message);
            return false;
        }

    }

    private static async getBrowser(): Promise<puppeteer.Browser>
    {
        if (BrowserRepo.browser == null)
        {
            BrowserRepo.browser = await puppeteer.launch({ headless: false });
            return BrowserRepo.browser;
        } else {
            return BrowserRepo.browser;
        }
    }

    public static async setMode(mode: BrowserMode)
    {
        this.mode = mode;
    }

    public static async get(): Promise<puppeteer.Browser>
    {
        switch (this.mode) 
        {
            case BrowserMode.Headless:
                return this.getBrowserHeadless();
            case BrowserMode.Standard:
                return this.getBrowser();
            default:
                throw new Error("No browser mode set");
        }
    }

    public static async close(): Promise<void>
    {
        var repos: Array<puppeteer.Browser> = [
            this.browserHeadless,
            this.browser
        ]
        var closeProms = repos.filter(rep => rep != null).map(rep => rep.close());
        await Promise.all(closeProms);
    }
}