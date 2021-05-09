import { Main } from "./main";
import { EventDispatcher } from "./eventDispatcher";
import { SpeechManagerOptions } from "./speechManager";

//I should probably move my AJAX update POSTS to one function to save having to type the same thing over and over and instead passing over the data I want to send
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
            credentials:
            [
                "username",
                "oAuthToken",
                "updateCredentials",
                "credentialsAlert"
            ],
            tts:
            [
                "ttsEnabled",
                "ttsOptionsContainer",
                "awsRegion",
                "awsIdentityPoolID",
                "awsAlert",
                "updateAWSCredentials",
                "filtersEnabled",
                "filterOptions",
                "filterRemoveMessage",
                "filterSkipMessage",
                "filterWords"
            ],
            vc:
            [
                "vcSupportNotice",
                "vcEnabled",
                "vcOptionsContainer",
                "inputDevices",
                "saveVCSettings"/*,
                "inputPreview"*/
            ],
            other: [] //Dark theme handled by main.ts
        };
        this.tabs = {}; //Couldn't be bothered to keep re-writing the same lines again and again so I put it into this object
        Object.keys(_tabs).forEach((key: string) =>
        {
            this.tabs[key] =
            {
                button: Main.ThrowIfNullOrUndefined(document.querySelector(`#${key}Radio`)),
                tab: Main.ThrowIfNullOrUndefined(document.querySelector(`#${key}Tab`)),
                elements: {}
            };

            _tabs[key].forEach((value: string) =>
            {
                this.tabs[key].elements[value] = Main.ThrowIfNullOrUndefined(this.tabs[key].tab.querySelector(`#${value}`));
                //this.tabs[key].elements[value] = Main.ThrowIfNullOrUndefined(value.startsWith("#") ? this.tabs[key].tab.querySelector(value) : this.tabs[key].tab.querySelectorAll(value)); //Switch to this in the future for class selection
            });
        });

        //Add content to tabs
        this.IndexInputDevices();

        //Subscribe to events
        this.settingsButton.addEventListener("click", () => { Main.ToggleMenu(this.settingsButton, this.settingsContainer); });
        this.background.addEventListener("click", () => { Main.ToggleMenu(this.settingsButton, this.settingsContainer); });
        Object.keys(this.tabs).forEach(key => { this.tabs[key].button.addEventListener("click", () => { this.ShowTab(key); }); });
        this.ShowTab("credentials");

        this.tabs.credentials.elements.updateCredentials.addEventListener("click", () => { this.UpdateCredentials(); });
        this.tabs.tts.elements.ttsEnabled.addEventListener("click", () => { this.ToggleTTS(true); })
        this.tabs.tts.elements.updateAWSCredentials.addEventListener("click", () => { this.UpdateTTSOptions(); })
        this.tabs.tts.elements.filtersEnabled.addEventListener("click", () => { this.ToggleTTSFilters(true); });
        this.tabs.vc.elements.vcEnabled.addEventListener("click", () => { this.ToggleVC(true); }); //False while testing
        this.tabs.vc.elements.saveVCSettings.addEventListener("click", () => { this.UpdateVCOptions(); });
        //this.tabs.vc.elements.saveVCSettings.add

        this.LoadUserSettings();
    }

    private UpdateVCOptions()
    {
        var inputDevice: string = (<HTMLSelectElement>this.tabs.vc.elements.inputDevices).value;

        this.GetInputDevice(inputDevice);
        //navigator.mediaDevices.getUserMedia({ audio: { deviceId: inputDevice } });

        /*jQuery.ajax(
        {
            url: `${Main.WEB_ROOT}/assets/php/settings.php`,
            method: "POST",
            dataType: "json",
            data:
            {
                "q": JSON.stringify(
                {
                    vcInputDevice: inputDevice
                })
            },
            error: Main.ThrowAJAXJsonError,
            success: (response: { result: any }) =>
            {
                if (response.result == "Invalid Account Details") { this.eventDispatcher.dispatch("showLoginMenu"); }
            }
        });*/
    }

    private IndexInputDevices()
    {
        navigator.mediaDevices.enumerateDevices().then((devices: MediaDeviceInfo[]) =>
        {
            devices = devices.filter((d: MediaDeviceInfo) => d.kind === "audioinput"); //Filter the list to only input devices
            var defaultDevice: MediaDeviceInfo | null = null;
            for (let i = 0; i < devices.length; i++) { if (devices[i].deviceId == "default") { defaultDevice = devices[i]; break; } } //Find default device
            for (let i = 0; i < devices.length; i++) { if (devices[i].deviceId == "communications") { devices.splice(i, 1); break; } } //Remove communications device
            if (defaultDevice !== null) //Remove the device that default is if the default device exists
            {
                var defaultDeviceName: string = defaultDevice.label.substr(10);
                for (let i = 0; i < devices.length; i++)
                {
                    if (devices[i].label == defaultDeviceName)
                    {
                        devices.splice(i, 1); //I could also remove the default device and add the 'Deafult -' the the device label, in case the default device changes
                        break;
                    }
                }
            }

            //Add a function to remove duplicate devices

            this.tabs.vc.elements.inputDevices.innerHTML = ""; //Remove existing elements
            //Add devices to the UI list
            devices.forEach((device: MediaDeviceInfo) =>
            {
                var option: HTMLOptionElement = document.createElement("option");
                option.value = device.deviceId;
                //The device names do not show up in some browsers such as the OBS browser, if this happens, display the deviceId.
                //In OBS's case you can add '--use-fake-ui-for-media-stream' to the launch parameters to fix this.
                option.innerHTML = device.label != "" ? device.label : device.deviceId;
                this.tabs.vc.elements.inputDevices.appendChild(option);
                if (defaultDevice !== null && device.deviceId === defaultDevice.deviceId) { (<HTMLSelectElement>this.tabs.vc.elements.inputDevices).value = device.deviceId; }
            });
        });
    }

    private ToggleVC(save: boolean)
    {
        var input: HTMLInputElement = this.tabs.vc.elements.vcEnabled.querySelector("input")!;
        input.checked = !input.checked;
        if (input.checked)
        {
            this.tabs.vc.elements.vcOptionsContainer.style.display = "block";
            this.GetInputDevice((<HTMLSelectElement>this.tabs.vc.elements.inputDevices).value);
        }
        else
        {
            this.tabs.vc.elements.vcOptionsContainer.style.display = "none";
        }

        this.eventDispatcher.dispatch("toggleVC", input.checked);

        if (save)
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
                        stt_enabled: input.checked ? 1 : 0
                    })
                },
                error: Main.ThrowAJAXJsonError,
                success: (response: { result: any }) =>
                {
                    if (response.result == "Invalid Account Details") { this.eventDispatcher.dispatch("showLoginMenu"); }
                }
            });
        }
    }

    private async GetInputDevice(_deviceId: string)
    {
        //There is a problem with OBS browser here where the page does not have access to the microphone but I AM able to stream its media to an audio element which is odd.
        //This means that the SpeechRecogniser cannot work on OBS even though it has support for it.
        //I have not found a way to allow access to the devices yet through CEF launch paramaters and since OBS has no user dialog to say allow/deny access I will, for now, have to disable the SpeechRecogniser function on OBS browser.

        //When adding an audio preview the device can be changed from the browser search bar, when the device is changed in the webapp the one listed on the URL does not change so does the SpeechRecogniser still use the old device?
        //Because of this, for now I will leave the audio preview disabled.
        navigator.mediaDevices.getUserMedia({ audio: { deviceId: _deviceId } }).catch((err: any) =>
        {
            //This is currently checked by the speechRecognizer, I would like to check it here because in the future I many need to use other services that require the microphone.
            //if (err == "NotAllowedError: Permission denied") { Main.Alert("Please give this page microphone access."); }
        });

        /*var microphonePermission: PermissionStatus = await navigator.permissions.query({name: 'microphone'});*/

        /*var audioStream: MediaStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: _deviceId } });
        (<HTMLAudioElement>this.tabs.vc.elements.inputPreview).srcObject = audioStream;*/
    }

    private ToggleTTS(save: boolean) //Getting messy again, need to tidy up
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

        if (save)
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
                        ttsMode: ttsMode
                    })
                },
                error: Main.ThrowAJAXJsonError,
                success: (response: { result: any }) =>
                {
                    if (response.result == "Invalid Account Details") { this.eventDispatcher.dispatch("showLoginMenu"); }
                }
            });
        }
    }

    private ToggleTTSFilters(save: boolean)
    {
        var input: HTMLInputElement = this.tabs.tts.elements.filtersEnabled.querySelector("input")!;
        input.checked = !input.checked;
        if (input.checked)
        {
            this.tabs.tts.elements.filterOptions.style.display = "block";
        }
        else
        {
            this.tabs.tts.elements.filterOptions.style.display = "none";
        }

        if (save) { this.UpdateTTSOptions(); }
    }

    private UpdateTTSOptions() //Look into what checks should be placed here
    {
        this.saveCredentials = true;
        var valid: boolean = false;
        var _region: string = (<HTMLInputElement>this.tabs.tts.elements.awsRegion).value;
        var _identityPoolID: string = (<HTMLInputElement>this.tabs.tts.elements.awsIdentityPoolID).value;
        var alertMessage = this.tabs.tts.elements.awsAlert;

        if (_region == "") { alertMessage.innerText = "Invalid Region."; }
        else if (!_identityPoolID.startsWith(_region)) //From my testing the IdentityPoolID always starts with the region
        { alertMessage.innerText = "Invalid Identity Pool ID."; }
        else { valid = true; }

        if (valid)
        {
            var _filterMode: SpeechManagerOptions["filterMode"];
            var filtersEnabled:HTMLInputElement = this.tabs.tts.elements.filtersEnabled.querySelector("input")!;
            if (filtersEnabled.checked && (<HTMLInputElement>this.tabs.tts.elements.filterRemoveMessage).checked) { _filterMode = 1; }
            else if (filtersEnabled.checked && (<HTMLInputElement>this.tabs.tts.elements.filterSkipMessage).checked) { _filterMode = 2; }
            else { _filterMode = 0; }

            var options: SpeechManagerOptions =
            {
                awsRegion: _region,
                awsIdentityPoolID: _identityPoolID,
                filterMode: _filterMode,
                filterWords: (<HTMLInputElement>this.tabs.tts.elements.filterWords).value //This could be a problem if the user has set filters and then the input becomes empty
            };

            this.eventDispatcher.dispatch("updateTTSOptions", options);

            jQuery.ajax(
            {
                url: `${Main.WEB_ROOT}/assets/php/settings.php`,
                method: "POST",
                dataType: "json",
                data:
                {
                    "q": JSON.stringify(
                    {
                        update_tts: options
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
                        }
                    })
                },
                error: Main.ThrowAJAXJsonError,
                success: (response: { result: any }) => //I don't need to check for the data type here as jQuery will try to steralise the JSON, if it fails then the error function will run
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
                    get_all: ""
                })
            },
            error: Main.ThrowAJAXJsonError,
            success: (response: { result: any }) =>
            {
                var data: StreamChatDB;
                if ((response.result as StreamChatDB) != null)
                {
                    data = response.result;
                    if (data.twitch_username != null && data.twitch_oauth != null)
                    {
                        (<HTMLInputElement>this.tabs.credentials.elements.username).value = data.twitch_username;
                        (<HTMLInputElement>this.tabs.credentials.elements.oAuthToken).value = data.twitch_oauth;
                        this.eventDispatcher.dispatch("twitchCredentialsUpdated", { username: data.twitch_username, oAuth: data.twitch_oauth } );
                    }

                    if (data.tts_mode == 1) { this.ToggleTTS(false); }

                    if (data.aws_region != null && data.aws_identity_pool != null) //Change this for WebSpeechAPI
                    {
                        (<HTMLInputElement>this.tabs.tts.elements.awsRegion).value = data.aws_region;
                        (<HTMLInputElement>this.tabs.tts.elements.awsIdentityPoolID).value = data.aws_identity_pool;

                        this.eventDispatcher.dispatch("updateTTSOptions",
                        {
                            awsRegion: data.aws_region,
                            awsIdentityPoolID: data.aws_identity_pool,
                            filterMode: data.tts_filter_mode,
                            filterWords: data.tts_filters
                        });
                    }

                    if (data.tts_filter_mode != 0)
                    {
                        this.ToggleTTSFilters(false);
                        switch(data.tts_filter_mode) //Made as a switch-case for if I add more options in the future
                        {
                            case 1:
                                (<HTMLInputElement>this.tabs.tts.elements.filterRemoveMessage).checked = true;
                                break;
                            case 2:
                                (<HTMLInputElement>this.tabs.tts.elements.filterSkipMessage).checked = true;
                                break;
                        }
                    }
                    (<HTMLInputElement>this.tabs.tts.elements.filterWords).value = data.tts_filters;

                    if (data.stt_enabled == 1)
                    {
                        //Use the value from speechManager.ts in the future. This is a quick fix temporary for this.
                        if (!("obsstudio" in window) && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) { this.ToggleVC(false); }
                    }
                }
                else { console.log("No user data found"); }
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
    tts_mode: 0 | 1 | 2, //Off, AWS, WebSpeechAPI
    tts_voice: string | null,
    tts_filter_mode: 0 | 1 | 2, //Off, Remove, Skip
    tts_filters: string,
    aws_region: string | null,
    aws_identity_pool: string,
    stt_enabled: 0 | 1,
    stt_listeners: string | null
}