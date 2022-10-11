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
    
    public static accountContainer: HTMLIFrameElement;
    private static alertBoxContainer: HTMLDivElement;
    private static alertBoxText: HTMLParagraphElement;
    private static alertBoxTextBox: HTMLInputElement;

    constructor()
    {
        //new TestClass(); /*REMEMBER TO COMMENT THIS OUT WHEN MAKING A RELEASE*/

        Main.WEB_ROOT = WEB_ROOT;
        new HeaderSlide();
        this.chatManager = new ChatManager();
        this.settings = new Settings(); //Settings should load last

        window.addEventListener("load", () => { this.WindowLoadEvent(); });
        window.addEventListener("DOMContentLoaded", () => { this.DOMContentLoadedEvent(); });
        window.addEventListener("message", (ev) => { this.WindowMessageEvent(ev); });

        //I need to find a better way of passing this data accross, though it is still fully OOB
        this.chatManager.eventDispatcher.addListener("join", (data: any) => { this.settings.OnJoin(data); });
        this.settings.eventDispatcher.addListener("showLoginMenu", () => { Main.AccountMenuToggle(true); });
        this.settings.eventDispatcher.addListener("twitchCredentialsUpdated", (data: any) => { this.chatManager.UpdateTwitchCredentials(data); });
        this.settings.eventDispatcher.addListener("toggleTTS", (data: boolean) => { this.chatManager.ToggleTTS(data); });
        this.settings.eventDispatcher.addListener("updateTTSOptions", (data: any) => { this.chatManager.UpdateOptions(data); });
        this.settings.eventDispatcher.addListener("toggleVC", (data: any) => { this.chatManager.ToggleVC(data); });
    }

    private WindowMessageEvent(ev: MessageEvent<any>): void
    {
        var host = window.location.host.split('.');
        if (ev.origin.split('/')[2] == `api.readiefur.${host[host.length - 1]}`)
        {
            if (Main.TypeOfReturnData(ev.data))
            {
                /*if (ev.data.error)
                {
                    console.error(ev);
                    Main.AccountMenuToggle(false);
                }
                else if (typeof(ev.data.data) === "string")
                {
                    switch (ev.data.data)
                    {
                        case "BACKGROUND_CLICK":
                            Main.AccountMenuToggle(false);
                            break;
                        case "LOGGED_IN":
                            Main.AccountMenuToggle(false);
                            break;
                        case "LOGGED_OUT":
                            window.location.reload();
                            break;
                        case "ACCOUNT_DELETED":
                            window.location.reload();
                            break;
                        default:
                            //Not implemented.
                            break;
                    }
                }
                else
                {
                    //Alert unknown error/response.
                    console.log("Unknown response: ", ev);
                    Main.AccountMenuToggle(false);
                }*/

                switch (ev.data.data)
                {
                    case "BACKGROUND_CLICK":
                        Main.AccountMenuToggle(false);
                        break;
                    case "LOGGED_IN":
                        //Main.AccountMenuToggle(false);
                        window.location.reload();
                        break;
                    case "LOGGED_OUT":
                        window.location.reload();
                        break;
                    case "ACCOUNT_DELETED":
                        window.location.reload();
                        break;
                    default:
                        //Not implemented.
                        break;
                }
            }
            else
            {
                //Alert unknown error/response.
                console.log("Unknown response: ", ev);
                Main.AccountMenuToggle(false);
            }
        }
    }

    public static AccountMenuToggle(show: boolean)
    {
        if (show) { if (Main.accountContainer.contentWindow != null) { Main.accountContainer.contentWindow.postMessage("UPDATE_THEME", "*"); } Main.accountContainer.style.display = "block"; }
        Main.accountContainer.classList.remove(show ? "fadeOut" : "fadeIn");
        Main.accountContainer.classList.add(show ? "fadeIn" : "fadeOut");
        if (!show) { setTimeout(() => { Main.accountContainer.style.display = "none"; }, 399); }
    }

    public static TypeOfReturnData(data: any): data is ReturnData
    {
        return (data as ReturnData).error !== undefined && (data as ReturnData).data !== undefined;
    }

    private WindowLoadEvent(): void
    {
        var staticStyles: HTMLStyleElement = document.createElement("style");
        staticStyles.innerHTML = `* { transition: background-color ease 100ms; }`;
        document.head.appendChild(staticStyles);

        Main.accountContainer = Main.ThrowIfNullOrUndefined(document.querySelector("#accountContainer"));
        Main.alertBoxContainer = Main.ThrowIfNullOrUndefined(document.querySelector("#alertBoxContainer"));
        Main.alertBoxText = Main.ThrowIfNullOrUndefined(document.querySelector("#alerBoxText"));
        Main.alertBoxTextBox = Main.ThrowIfNullOrUndefined(document.querySelector("#alertBoxTextBox"));
        Main.alertBoxContainer.addEventListener("click", () => { Main.alertBoxContainer.style.display = "none"; });

        this.accountButton = Main.ThrowIfNullOrUndefined(document.querySelector("#accountButton"));
        var hostSplit = window.location.host.split("."); //Just for localhost testing
        this.accountButton.addEventListener("click", () => { Main.AccountMenuToggle(true); });
        window.addEventListener("message", (event) => //Add more checks here once the API login page has been rebuilt
        {
            var data: {AccountWindowClose: boolean, LoginSuccessful?: boolean} = event.data; //Reload page
            if (data.AccountWindowClose)
            {
                //if (data.LoginSuccessful) { this.settings = new Settings(); } //This will discard any settings made before the login but it will load the users cloud settings without reloading the page (or at least it should).
                if (data.LoginSuccessful) { window.location.reload(); }
                Main.AccountMenuToggle(true);
            }
        });
    }

    private DOMContentLoadedEvent(): void //Update this
    {
        if (Main.RetreiveCache("READIE_DARK") != "false") { Main.DarkTheme(true); }
        else { Main.DarkTheme(false); }
        Main.ThrowIfNullOrUndefined(document.querySelector("#darkMode")).addEventListener("click", () =>
        {
            var cachedValue = Main.RetreiveCache("READIE_DARK");
            Main.DarkTheme(cachedValue == "false" ? true : false);
            //CBA to do the dynamic url thing I normally do, nothing sensitive is being sent over anyway.
            if (Main.accountContainer.contentWindow != null)
            { Main.accountContainer.contentWindow.postMessage("UPDATE_THEME", "*" /*Main.accountContainer.contentWindow?.location.href*/ /*Main.accountContainer.src*/); }
        });
    }

    public static ThrowIfNullOrUndefined(variable: any): any
    {
        if (variable === null || variable === undefined) { throw new TypeError(`${variable} is null or undefined`); }
        return variable;
    }

    public static DarkTheme(dark: boolean): void
    {
        Main.SetCache("READIE_DARK", dark ? "true" : "false", 365);
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

    public static SetCache(cookie_name: string, value: string, hours: number, path: string = '/'): void
    {
        var hostSplit = window.location.host.split(".");
        var domain = `.${hostSplit[hostSplit.length - 2]}.${hostSplit[hostSplit.length - 1]}`;
        var expDate = new Date();
        expDate.setTime(expDate.getTime() + (hours*60*60*1000));
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

    //This is asyncronous as I will check if the user has dismissed the alert box in the future.
    public static async Alert(message: string): Promise<void>
    {
        if (Main.alertBoxTextBox != null && Main.alertBoxText != null && Main.alertBoxContainer != null)
        {
            console.log("Alert:", message);
            Main.alertBoxTextBox.focus();
            Main.alertBoxText.innerHTML = message;
            Main.alertBoxContainer.style.display = "block";
        }
    }

    public static Sleep(milliseconds: number): Promise<unknown>
    {
        return new Promise(r => setTimeout(r, milliseconds));
    }

    public static GetPHPErrorMessage(error: any): string
    {
        switch (error)
        {
            case "NO_QUERY_FOUND":
                return "No query found.";
            case "NO_METHOD_FOUND":
                return "No method found.";
            case "NO_DATA_FOUND":
                return "No data found.";
            case "INVALID_METHOD":
                return "Invalid method.";
            case "INVALID_DATA":
                return "Invalid data.";
            case "ACCOUNT_NOT_FOUND":
                return "Account not found.";
            case "ACCOUNT_NOT_VERIFIED":
                return "Account not verified.";
            case "ACCOUNT_ALREADY_EXISTS":
                return "Account already exists.";
            case "ENCRYPTION_ERROR":
                return "Encryption error.";
            case "SET_COOKIE_ERROR":
                return "Set cookie error.";
            case "GET_COOKIE_ERROR":
                return "Get cookie error.";
            case "COOKIE_NOT_FOUND":
                return "Cookie not found.";
            case "SESSION_INVALID":
                return "Session invalid.";
            case "INVALID_CREDENTIALS":
                return "Invalid credentials.";
            case "INVALID_UID":
                return "Invalid user ID.";
            case "INVALID_EMAIL":
                return "Invalid email.";
            case "INVALID_USERNAME":
                return "Invalid username.";
            case "INVALID_PASSWORD":
                return "Invalid password.";
            case "INVALID_OTP":
                return "Invalid OTP.";
            case "VERIFICATION_FAILED":
                return "Verification failed.";
            case "MAIL_ERROR":
                return "Mail error."
            case "NO_RESULTS":
                return "No results found.";
            case "NOT_LOGGED_IN":
                return "Not logged in.";
            default:
                return `Unknown error.<br><small>${String(error)}</small>`;
        }
    }
}
new Main();

export interface ReturnData
{
error: boolean,
data: any
}