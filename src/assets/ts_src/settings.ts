import { Main } from "./main";
import { EventDispatcher } from "./eventDispatcher";

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
    private awsRegion?: string;
    private awsIdentityPoolID?: string;

    constructor() //Load data
    {
        this.eventDispatcher = new EventDispatcher();
        window.addEventListener("load", () => { this.WindowLoadEvent(); });
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
            tts: ["ttsEnabled", "ttsOptionsContainer", "updateAWSCredentials"],
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
        this.tabs.tts.elements.ttsEnabled.addEventListener("click", () => { this.ToggleTTS(); })
        this.tabs.tts.elements.updateAWSCredentials.addEventListener("click", () => { this.UpdateAWSCredentials(); })

        this.LoadUserSettings();
    }

    private ToggleTTS()
    {
        var input: HTMLInputElement = this.tabs.tts.elements.ttsEnabled.querySelector("input")!;
        var ttsMode: number; //As a number for the future
        input.checked = !input.checked;
        /*if (input.checked) { this.tabs.tts.elements.optionsContainer.classList.remove("disabled"); }
        else { this.tabs.tts.elements.optionsContainer.classList.add("disabled"); }*/
        if (input.checked)
        {
            this.tabs.tts.elements.ttsOptionsContainer.style.display = "block";
            ttsMode = 1;
        }
        else
        {
            this.tabs.tts.elements.ttsOptionsContainer.style.display = "none";
            ttsMode = 0;
        }
        this.eventDispatcher.dispatch("toggleTTS", input.checked);

        jQuery.ajax(
        {
            url: `${Main.WEB_ROOT}/assets/php/settings.php`,
            method: "POST",
            dataType: "json",
            data:
            {
                "q": JSON.stringify(
                {
                    ttsMode: ttsMode,
                    unid: Main.RetreiveCache("READIE-UI"),
                    pass: Main.RetreiveCache("READIE-UP")
                })
            },
            error: Main.ThrowAJAXJsonError,
            success: (response: { result: any }) =>
            {
                if (response.result == "Invalid Account Details") { this.eventDispatcher.dispatch("showLoginMenu"); }
            }
        });
    }

    private UpdateAWSCredentials() //Look into what checks should be placed here
    {
        var valid: boolean = false;
        var _region: string = (<HTMLInputElement>this.tabs.tts.elements.awsRegion).value;
        var _identityPoolID: string = (<HTMLInputElement>this.tabs.tts.elements.awsIdentityPoolID).value;
        var alertMessage = this.tabs.tts.elements.credentialsAlert;

        if (_region != "") { alertMessage.innerText = "Invalid Region."; }
        else if (!_identityPoolID.startsWith(_region)) //From my testing the IdentityPoolID always starts with the region
        { alertMessage.innerText = "Invalid Identity Pool ID"; }
        else { valid = true; }

        if (valid)
        {
            this.awsRegion = _region;
            this.awsIdentityPoolID = _identityPoolID;

            this.eventDispatcher.dispatch("awsCredentialsUpdated", { awsRegion: _region, awsIdentityPoolID: _identityPoolID });

            jQuery.ajax(
            {
                url: `${Main.WEB_ROOT}/assets/php/settings.php`,
                method: "POST",
                dataType: "json",
                data:
                {
                    "q": JSON.stringify(
                    {
                        update_aws:
                        {
                            awsRegion: _region,
                            awsIdentityPoolID: _identityPoolID
                        },
                        unid: Main.RetreiveCache("READIE-UI"),
                        pass: Main.RetreiveCache("READIE-UP")
                    })
                },
                error: Main.ThrowAJAXJsonError,
                success: (response: { result: any }) =>
                {
                    if (response.result == "Invalid Account Details") { this.eventDispatcher.dispatch("showLoginMenu"); }
                }
            });
        }
        else { setTimeout(() => { alertMessage.innerText = ""; }, 5000); }
    }

    private UpdateCredentials()
    {
        //this.saveCredentials = true;
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
            this.eventDispatcher.dispatch("twitchCredentialsUpdated", { username: _username, oAuth: _oAuth });
        }
        else { setTimeout(() => { alertMessage.innerText = ""; }, 5000); }
    }

    private ShowTab(name: string)
    {
        Object.keys(this.tabs).forEach(key => { this.tabs[key].tab.style.display = "none"; });
        this.tabs[name].tab.style.display = "table-cell";
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
                    if (response.result == "Invalid Account Details") { this.eventDispatcher.dispatch("showLoginMenu"); }
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

                    this.eventDispatcher.dispatch("twitchCredentialsUpdated",
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