import { TestClass } from "./testClass";
import { HeaderSlide } from "./headerSlide";
import { Settings } from "./settings";
import { ChatManager } from "./chatManager";

declare var WEB_ROOT: string;

//For OBS browser support I couldn't do 'object?' so I had to do '!==null/undefined'
export class Main
{
    public static WEB_ROOT: string;

    private settings: Settings;
    private chatManager: ChatManager;

    private accountButton!: HTMLLinkElement;
    private accountContainer!: HTMLIFrameElement;

    constructor()
    {
        //new TestClass(); /*REMEMBER TO COMMENT THIS OUT WHEN MAKING A RELEASE*/

        Main.WEB_ROOT = WEB_ROOT;
        new HeaderSlide();
        this.chatManager = new ChatManager();
        this.settings = new Settings(); //Settings should load last

        window.addEventListener("load", this.WindowLoadEvent);
        window.addEventListener("DOMContentLoaded", this.DOMContentLoadedEvent);

        //I need to find a better way of passing this data accross, though it is still fully OOB
        this.chatManager.eventDispatcher.addListener("join", (data: any) => { this.settings.OnJoin(data); });
        this.settings.eventDispatcher.addListener("showLoginMenu", () => { Main.ToggleMenu(this.accountButton, this.accountContainer); });
        this.settings.eventDispatcher.addListener("twitchCredentialsUpdated", (data: any) => { this.chatManager.UpdateTwitchCredentials(data); });
        this.settings.eventDispatcher.addListener("toggleTTS", (data: boolean) => { this.chatManager.ToggleTTS(data); });
        this.settings.eventDispatcher.addListener("updateTTSOptions", (data: any) => { this.chatManager.UpdateOptions(data); });
        this.settings.eventDispatcher.addListener("toggleVC", (data: any) => { this.chatManager.ToggleVC(data); });
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
            var data: {AccountWindowClose: boolean, LoginSuccessful?: boolean} = event.data; //Reload page
            if (data.AccountWindowClose)
            {
                //if (data.LoginSuccessful) { this.settings = new Settings(); } //This will discard any settings made before the login but it will load the users cloud settings without reloading the page (or at least it should).
                if (data.LoginSuccessful) { window.location.reload(); }
                Main.ToggleMenu(this.accountButton, this.accountContainer);
            }
        });
    }

    private DOMContentLoadedEvent(): void //Update this
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
        var darkButton: HTMLInputElement | null = document.querySelector("#darkMode > input");
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

    public static Alert(message: string)
    {
        //Alert box popup
        //TMP
        window.alert(message);
    }
}
new Main();