import { Main } from "./main.ts.js";
import { EventDispatcher } from "./eventDispatcher.ts.js";

export class Settings
{
    public eventDispatcher: EventDispatcher;

    private settingsButton!: HTMLLinkElement;
    private settingsContainer!: HTMLDivElement;
    private background!: HTMLDivElement;
    private menu!: HTMLDivElement;
    private tabs!: { [name: string]: RadioTab };

    private saveCredentials: boolean = false; //Cheap way to not update the databse on load, could also be used for local saves only
    private username?: string;
    private oAuth?: string;

    constructor() //Load data
    {
        this.eventDispatcher = new EventDispatcher();
        window.addEventListener("load", () => { this.WindowLoadEvent(); });
        this.LoadUserSettings();
    }

    private WindowLoadEvent()
    {
        //Declare variables
        this.settingsButton = Main.ThrowIfNullOrUndefined(document.querySelector("#settingsButton"));
        this.settingsContainer = Main.ThrowIfNullOrUndefined(document.querySelector("#settingsContainer"));
        this.background = Main.ThrowIfNullOrUndefined(document.querySelector("#settingsBackground"));
        this.menu = Main.ThrowIfNullOrUndefined(document.querySelector("#settingsMenu"));

        var _tabs: { [name: string]: string[] } =
        {
            credentials: ["username", "oAuthToken", "updateCredentials", "credentialsAlert"],
            tts: ["ttsEnabled", "useAWS"],
            //"vc": [],
            other: []
        };
        this.tabs = {}; //Couldn't be bothered to keep re-writing the same lines again and again so I put it into this object
        Object.keys(_tabs).forEach(key =>
        {
            this.tabs[key] =
            {
                button: Main.ThrowIfNullOrUndefined(document.querySelector(`#${key}Radio`)),
                tab: Main.ThrowIfNullOrUndefined(document.querySelector(`#${key}Tab`)),
                elements: {}
            };

            _tabs[key].forEach(value =>
            {
                this.tabs[key].elements[value] = Main.ThrowIfNullOrUndefined(this.tabs[key].tab.querySelector(`#${value}`));
                //this.tabs[key].elements[value] = Main.ThrowIfNullOrUndefined(value.startsWith("#") ? this.tabs[key].tab.querySelector(value) : this.tabs[key].tab.querySelectorAll(value)); //Switch to this in the furure for class selection
            });
        });

        //Subscribe to events
        this.settingsButton.addEventListener("click", () => { Main.ToggleMenu(this.settingsButton, this.settingsContainer); });
        this.background.addEventListener("click", () => { Main.ToggleMenu(this.settingsButton, this.settingsContainer); });
        Object.keys(this.tabs).forEach(key => { this.tabs[key].button.addEventListener("click", () => { this.ShowTab(key); }); });
        this.ShowTab("credentials");

        this.tabs.credentials.elements.updateCredentials.addEventListener("click", () => { this.UpdateCredentials(); });
    }

    private UpdateCredentials()
    {
        this.saveCredentials = true;
        var valid: boolean = false;
        var _username: string = (<HTMLInputElement>this.tabs.credentials.elements.username).value;
        var _oAuth: string = (<HTMLInputElement>this.tabs.credentials.elements.oAuthToken).value;
        var alertMessage = this.tabs.credentials.elements.credentialsAlert;

        if (!_oAuth.startsWith("oauth:") && _oAuth.length == 30) { _oAuth = `oauth:${_oAuth}`; }

        if (_username.length < 4 || _username.length > 25)
        { alertMessage.innerText = "Username must be between 4 and 25 characters."; }
        else if (!_oAuth.startsWith("oauth:") && _oAuth.length != 36)
        { alertMessage.innerText = "oAuth key must be 36 characters long with 'oauth:' at the start."; }
        else
        {
            alertMessage.innerText = "Connecting...";
            valid = true;
        }

        if (valid)
        {
            this.username = _username;
            this.oAuth = _oAuth;
            this.eventDispatcher.dispatch("CredentialsUpdated", { username: _username, oAuth: _oAuth });
        }
        else { setTimeout(() => { alertMessage.innerText = ""; }, 5000); }
    }

    private ShowTab(name: string)
    {
        Object.keys(this.tabs).forEach(key => { this.tabs[key].tab.style.display = "none"; });
        this.tabs[name].tab.style.display = "table-cell";
    }

    private Alert(message: string)
    {
        //Alert box popup
        if (message == "Account details invalid") { this.eventDispatcher.dispatch("ShowLoginMenu"); }
    }

    public OnJoin(data: any): void
    {
        this.tabs.credentials.elements.credentialsAlert.innerText = "Connected!";
        setTimeout(() => { this.tabs.credentials.elements.credentialsAlert.innerText = ""; }, 2500);
        if (this.saveCredentials)
        {
            jQuery.ajax(
            {
                url: `${Main.WEB_ROOT}/assets/php/settings.php`,
                method: "POST",
                dataType: "json",
                data:
                {
                    "q": JSON.stringify(
                    {
                        update_twitch:
                        {
                            twitch_username: this.username,
                            twitch_oauth: this.oAuth
                        },
                        unid: Main.RetreiveCache("READIE-UI"),
                        pass: Main.RetreiveCache("READIE-UP")
                    })
                },
                error: Main.ThrowAJAXJsonError,
                success: (response: { result: any }) => //I do not need to check for the data type here as jQuery will try to steralise the JSON, if it fails then the error function will run
                {
                    this.Alert(response.result);
                }
            });
        }
    }

    private LoadUserSettings()
    {
        jQuery.ajax(
        {
            url: `${Main.WEB_ROOT}/assets/php/settings.php`,
            method: "POST",
            dataType: "json",
            data:
            {
                "q": JSON.stringify(
                {
                    get_all: "",
                    unid: Main.RetreiveCache("READIE-UI"),
                    pass: Main.RetreiveCache("READIE-UP")
                })
            },
            error: Main.ThrowAJAXJsonError,
            success: (response: { result: any }) =>
            {
                var data: StreamChatDB;
                if ((response.result as StreamChatDB).unid != undefined) { data = response.result; }
                else { throw new TypeError(`Response is not a type of StreamChatDB: ${response}`); }
                
                if (data.twitch_username != null && data.twitch_oauth != null)
                {
                    (<HTMLInputElement>this.tabs.credentials.elements.username).value = data.twitch_username;
                    (<HTMLInputElement>this.tabs.credentials.elements.oAuthToken).value = data.twitch_oauth;

                    this.eventDispatcher.dispatch("CredentialsUpdated",
                    {
                        username: (<HTMLInputElement>this.tabs.credentials.elements.username).value,
                        oAuth: (<HTMLInputElement>this.tabs.credentials.elements.oAuthToken).value
                    });
                }
            }
        });
    }
}

type RadioTab =
{
    button: HTMLInputElement,
    tab: HTMLTableCellElement,
    elements: { [name: string]: HTMLElement }
}

type StreamChatDB =
{
    unid: string,
    twitch_username: string | null,
    twitch_oauth: string | null,
    tts_mode: number,
    tts_voice: string | null,
    tts_filters_enabled: boolean,
    tts_filters: string[] | null,
    aws_region: string | null,
    aws_identity_pool: boolean,
    stt_enabled: boolean,
    stt_listeners: string | null
}