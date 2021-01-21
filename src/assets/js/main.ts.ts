import { TestClass } from "./testClass.ts.js";
import { HeaderSlide } from "./headerSlide.ts.js";
import { Settings } from "./settings.ts.js";
import { ChatManager } from "./chatManager.ts.js";
import { SpeechManager } from "./speechManager.ts.js";

export class Main
{
    private settings: Settings;
    private chatManager: ChatManager;
    private speechManager: SpeechManager;

    constructor()
    {
        //new TestClass(); /*REMEMBER TO COMMENT THIS OUT FOR RELEASE*/

        new HeaderSlide();
        this.settings = new Settings();
        this.chatManager = new ChatManager();
        this.speechManager = new SpeechManager();

        window.addEventListener("load", this.WindowLoadEvent);
        window.addEventListener("DOMContentLoaded", this.DOMContentLoadedEvent);

        this.settings.eventDispatcher.addListener("CredentialsUpdated", (data: any) => { this.chatManager.UpdateCredentials(data); });
    }

    private WindowLoadEvent(): void
    {
        let staticStyles: HTMLStyleElement = document.createElement("style");
        staticStyles.innerHTML = `* { transition: background-color ease 100ms; }`;
        document.head.appendChild(staticStyles);
    }

    private DOMContentLoadedEvent(): void
    {
        if (Main.RetreiveCache("READIE-DARK") != "false") { Main.DarkTheme(true); }
        else { Main.DarkTheme(false); }
        document.querySelector("#darkMode")!.addEventListener("click", () =>
        {
            let cachedValue = Main.RetreiveCache("READIE-DARK");
            if (cachedValue == undefined || cachedValue == "false") { Main.DarkTheme(true); }
            else { Main.DarkTheme(false); }
        });
    }

    public static ThrowIfNullOrUndefined(variable: any): any
    {
        if (variable === null || variable === undefined) { throw new TypeError(`${variable} is null or undefined`); }
        return variable;
    }

    public static DarkTheme(dark: boolean): void
    {
        Main.SetCache("READIE-DARK", dark ? "true" : "false", 365);
        let darkButton: HTMLInputElement | null = document.querySelector("#darkMode")!.querySelector("input");
        let themeColours: HTMLStyleElement | null = document.querySelector("#themeColours");
        if (dark) { darkButton!.checked = true; }
        else { darkButton!.checked = false; }
        themeColours!.innerHTML = `
            :root
            {
                --foreground: ${dark ? "255, 255, 255" : "0, 0, 0"};
                --background: ${dark ? "13, 17, 23" : "255, 255, 255"};
                --backgroundAlt: ${dark ? "22, 27, 34" : "225, 225, 225"};
            }
        `;
    }

    public static RetreiveCache(cookie_name: string): string
    {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++)
        {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == cookie_name) { return unescape(y); }
        }
        return "";
    }

    public static SetCache(cookie_name: string, value: string, time: number, path: string = '/'): void
    {
        let hostSplit = window.location.host.split("."); //Just for localhost testing
        let domain = `readie.global-gaming.${hostSplit[hostSplit.length - 1]}`; 
        var expDate = new Date();
        expDate.setDate(expDate.getDate() + time);
        document.cookie = `${cookie_name}=${value}; expires=${expDate.toUTCString()}; path=${path}; domain=${domain};`;
    }
}
new Main();