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

    constructor()
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
        this.settingsButton.addEventListener("click", () => { this.ToggleSettingsMenu(); });
        this.background.addEventListener("click", () => { this.ToggleSettingsMenu(); });
        Object.keys(this.tabs).forEach(key => { this.tabs[key].button.addEventListener("click", () => { this.ShowTab(key); }); });
        this.ShowTab("credentials");

        this.tabs.credentials.elements.updateCredentials.addEventListener("click", () => { this.UpdateCredentials(); });
    }

    private UpdateCredentials()
    {
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

        if (valid) { this.eventDispatcher.dispatch("CredentialsUpdated", { username: _username, oAuth: _oAuth }); }
        else { setTimeout(() => { alertMessage.innerText = ""; }, 5000); }
    }

    private ToggleSettingsMenu()
    {
        if (this.settingsButton.classList.contains("accentText")) //Hide menu
        {
            this.settingsContainer.classList.remove("fadeIn");
            this.settingsContainer.classList.add("fadeOut");
            setTimeout(() =>
            {
                this.settingsContainer.style.display = "none";
                this.settingsButton.classList.remove("accentText");
            }, 500);
        }
        else
        {
            this.settingsContainer.classList.remove("fadeOut");
            this.settingsContainer.classList.add("fadeIn");
            this.settingsButton.classList.add("accentText");
            this.settingsContainer.style.display = "block";
        }
    }

    private ShowTab(name: string)
    {
        Object.keys(this.tabs).forEach(key => { this.tabs[key].tab.style.display = "none"; });
        this.tabs[name].tab.style.display = "table-cell";
    }
}

type RadioTab =
{
    button: HTMLInputElement,
    tab: HTMLTableCellElement,
    elements: { [name: string]: HTMLElement }
}