import { TestClass } from "./testClass.ts.js";
import { HeaderSlide } from "./headerSlide.ts.js";
import { Settings } from "./settings.ts.js";
import { ChatManager } from "./chatManager.ts.js";
import { SpeechManager } from "./speechManager.ts.js";

declare var WEB_ROOT: string;

export class Main
{
    public static WEB_ROOT: string;

    private settings: Settings;
    private chatManager: ChatManager;
    //private speechManager: SpeechManager;

    private accountButton!: HTMLLinkElement;
    private accountContainer!: HTMLIFrameElement;

    constructor()
    {
        //new TestClass(); /*REMEMBER TO COMMENT THIS OUT FOR RELEASE*/
        
        Main.WEB_ROOT = WEB_ROOT;

        new HeaderSlide();
        this.settings = new Settings();
        this.chatManager = new ChatManager();
        //this.speechManager = new SpeechManager();

        window.addEventListener("load", this.WindowLoadEvent);
        window.addEventListener("DOMContentLoaded", this.DOMContentLoadedEvent);

        this.settings.eventDispatcher.addListener("ShowLoginMenu", () => { Main.ToggleMenu(this.accountButton, this.accountContainer); });
        this.settings.eventDispatcher.addListener("CredentialsUpdated", (data: any) => { this.chatManager.UpdateCredentials(data); });
        this.chatManager.eventDispatcher.addListener("join", (data: any) => { this.settings.OnJoin(data); });
    }

    private WindowLoadEvent(): void
    {
        var staticStyles: HTMLStyleElement = document.createElement("style");
        staticStyles.innerHTML = `* { transition: background-color ease 100ms; }`;
        document.head.appendChild(staticStyles);

        this.accountButton = Main.ThrowIfNullOrUndefined(document.querySelector("#accountButton"));
        this.accountContainer = Main.ThrowIfNullOrUndefined(document.querySelector("#account"));
        var hostSplit = window.location.host.split("."); //Just for localhost testing
        this.accountContainer.src = `//api-readie.global-gaming.${hostSplit[hostSplit.length - 1]}/account/`; //This should always be https but for localhost testing I did not have a vertificate for https testing
        this.accountButton.addEventListener("click", () => { Main.ToggleMenu(this.accountButton, this.accountContainer); });
        window.addEventListener("message", (event) => //Add more checks here once the API login page has been rebuilt
        {
            var data: {AccountWindowClose: boolean, LoginSuccessful?: boolean} = event.data;
            if (data.AccountWindowClose) { Main.ToggleMenu(this.accountButton, this.accountContainer); }
        });
    }

    private DOMContentLoadedEvent(): void
    {
        if (Main.RetreiveCache("READIE-DARK") != "false") { Main.DarkTheme(true); }
        else { Main.DarkTheme(false); }
        document.querySelector("#darkMode")!.addEventListener("click", () =>
        {
            var cachedValue = Main.RetreiveCache("READIE-DARK");
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
        var darkButton: HTMLInputElement | null = document.querySelector("#darkMode")!.querySelector("input");
        var themeColours: HTMLStyleElement | null = document.querySelector("#themeColours");
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
        var hostSplit = window.location.host.split("."); //Just for localhost testing
        var domain = `readie.global-gaming.${hostSplit[hostSplit.length - 1]}`; 
        var expDate = new Date();
        expDate.setDate(expDate.getDate() + time);
        document.cookie = `${cookie_name}=${value}; expires=${expDate.toUTCString()}; path=${path}; domain=${domain};`;
    }

    public static ThrowAJAXJsonError(data: any) { throw new TypeError(`${data} could not be steralised`); }

    public static ToggleMenu(button: HTMLLinkElement, container: HTMLElement)
    {
        if (button.classList.contains("accentText")) //Hide menu
        {
            container.classList.remove("fadeIn");
            container.classList.add("fadeOut");
            setTimeout(() =>
            {
                container.style.display = "none";
                button.classList.remove("accentText");
            }, 500);
        }
        else
        {
            container.classList.remove("fadeOut");
            container.classList.add("fadeIn");
            button.classList.add("accentText");
            container.style.display = "block";
        }
    }
}
new Main();