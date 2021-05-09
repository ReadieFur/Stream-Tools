import { EventDispatcher } from "./eventDispatcher.js";
import { Main } from "./main.js";
import AWS from "aws-sdk";
import { PRIVMSG } from "./twitchWS.js";

declare var webkitSpeechRecognition: { new(): SpeechRecognition; } //Speech recognition name for Chrome

//In the future I will impliment other TTS methods e.g. Web Speech API (this should be added in the next update I hope). For now I will be using AWS Polly.
//When I implement the Web Speeck API, I will add voice commands to the settings menu.
export class SpeechManager
{
    public eventDispatcher: EventDispatcher;
    
    private ttsEnabled: boolean;
    private ttsPlayer!: HTMLAudioElement;
    private volumePercent!: HTMLParagraphElement;
    private volumeSlider!: HTMLInputElement;
    private toggleMute: boolean;
    private polly: AWS.Polly;
    private speechParams: SpeechParams;
    private messagesToRead: string[];
    private vcSupportNotice!: HTMLElement;
    private inputRelay!: HTMLInputElement;
    private vcContainer!: HTMLElement;
    private vcEnabled: boolean;
    private vcAbort: boolean;
    private speechRecognizerSupported: "SpeechRecognition" | "webkitSpeechRecognition" | null;
    private speechRecognizer?: SpeechRecognition;
    private filterMode: 0 | 1 | 2;
    private filterWords: string[];

    constructor()
    {
        this.eventDispatcher = new EventDispatcher();
        this.ttsEnabled = false;
        this.toggleMute = false;
        this.polly = new AWS.Polly({ apiVersion: "2016-06-10" });
        this.speechParams =
        {
            Engine: "standard",
            OutputFormat: "mp3",
            SampleRate: "22050",
            Text: "",
            TextType: "text",
            VoiceId: "Brian"
        };
        this.messagesToRead = [];

        this.vcEnabled = false;
        this.vcAbort = false;
        this.speechRecognizerSupported = null;
        if ("obsstudio" in window) { /*Currently not supported in OBS*, this API is supported but there is an issue with microphone access. I have written more about this in settings.ts -> GetInputDevice(...).*/}
        else if ("SpeechRecognition" in window) { this.speechRecognizerSupported = "SpeechRecognition"; }
        else if ("webkitSpeechRecognition" in window) { this.speechRecognizerSupported = "webkitSpeechRecognition"; }

        this.filterMode = 0;
        this.filterWords = [];

        window.addEventListener("load", () => { this.WindowLoadEvent(); })
    }

    //Use this for settings.ts in the future
    public SpeechRecognizerSupported(): "SpeechRecognition" | "webkitSpeechRecognition" | null { return this.speechRecognizerSupported; }

    private WindowLoadEvent(): void
    {
        this.ttsPlayer = Main.ThrowIfNullOrUndefined(document.querySelector("#ttsPlayer"));
        this.volumePercent = Main.ThrowIfNullOrUndefined(document.querySelector("#volumePercent"));
        this.volumeSlider = Main.ThrowIfNullOrUndefined(document.querySelector("#volumeSlider"));
        this.vcSupportNotice = Main.ThrowIfNullOrUndefined(document.querySelector("#vcSupportNotice"));
        this.vcContainer = Main.ThrowIfNullOrUndefined(document.querySelector("#vcContainer"));
        this.inputRelay = Main.ThrowIfNullOrUndefined(document.querySelector("#inputRelay"));

        this.ttsPlayer.volume = 0.5;
        if (this.speechRecognizerSupported === null) { this.vcSupportNotice.style.display = "block"; }
        else { this.vcContainer.style.display = "block"; }

        this.ttsPlayer.addEventListener("ended", () => { this.PlayNextMessage(); });
        this.volumeSlider.addEventListener("input", () => { this.VolumeChangeEvent(); });
        this.volumePercent.addEventListener("click", () => { this.ToggleMute(); });
    }

    private ToggleMute(mute?: boolean): void
    {
        this.toggleMute = mute != undefined ? mute : !this.toggleMute;
        var volume: number = this.toggleMute ? 0 : this.ttsPlayer.volume * 100;
        this.volumeSlider.value = volume.toString();
        this.volumePercent.innerHTML = `${volume}%`;
    }

    private VolumeChangeEvent(_volume?: number): void
    {
        this.toggleMute = false;
        var volume: number = _volume !== undefined ? _volume : Math.round(parseInt(this.volumeSlider.value));
        this.ttsPlayer.volume = volume / 100;
        this.volumePercent.innerHTML = `${volume}%`;
        this.volumeSlider.value = volume.toString();
    }

    public ToggleVC(data: boolean): void
    {
        this.vcEnabled = data;

        if (this.speechRecognizerSupported !== null && data)
        {
            if (this.speechRecognizer !== undefined) { this.speechRecognizer.stop(); }
            this.speechRecognizer = undefined;
            //Left as else if in case any other browsers in the future use different names. Just makes it easier to manage in the future.
            if (this.speechRecognizerSupported == "SpeechRecognition") { this.speechRecognizer = new SpeechRecognition(); }
            else if (this.speechRecognizerSupported == "webkitSpeechRecognition") { this.speechRecognizer = new webkitSpeechRecognition(); }

            this.speechRecognizer!.addEventListener("start", (ev: Event) => { this.SpeechRecognizerOnStartEvent(ev); });
            this.speechRecognizer!.addEventListener("result", (speechRecognition: SpeechRecognitionEvent) => { this.SpeechRecognizerOnResultEvent(speechRecognition); });
            this.speechRecognizer!.addEventListener("end", (ev: Event) => { this.SpeechRecognizerOnEndEvent(ev); });
            this.speechRecognizer!.addEventListener("error", (err: Event) => { this.SpeechRecognizerOnErrorEvent(err); });

            this.speechRecognizer!.start();
        }
        else if (this.speechRecognizerSupported !== null && !data)
        {
            if (this.speechRecognizer !== undefined) { this.speechRecognizer.stop(); }
            this.speechRecognizer = undefined;
        }
    }

    public ToggleTTS(data: boolean): void
    {
        this.ttsEnabled = data;
        var displayMode: string = this.ttsEnabled ? 'inline-block' : 'none';
        this.volumePercent.style.display = displayMode;
        this.volumeSlider.style.display = displayMode;
    }

    public UpdateOptions(data: SpeechManagerOptions): void
    {
        AWS.config.region = data.awsRegion; //Add checks to these in the future as they may be made null for some option updates
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: data.awsIdentityPoolID });
        this.filterMode = data.filterMode;
        this.filterWords = data.filterWords.split(",");
    }

    public OnMessage(privmsg: PRIVMSG): void
    {
        var message: string = privmsg.message;
        var skipMessage: boolean = false;

        if (this.filterMode != 0) //Clean up the filter method
        {
            var messageFilterResults: FilterMessage = this.FilterMessage(message, this.filterMode == 1 ? "remove" : "check");
            if (messageFilterResults.error !== undefined) { throw new Error(messageFilterResults.error); }
            if (this.filterMode == 1) { message = messageFilterResults.message; }
            else { skipMessage = messageFilterResults.containsFilterWord; } //Method 2
        }

        if (message != "" || !message.startsWith("!") || !skipMessage)
        {
            this.messagesToRead.push(message);
            if (this.messagesToRead.length <= 1) { this.SynthesizeSpeech(); }
        }
    }

    private SpeechRecognizerOnStartEvent(ev: Event)
    {
        this.vcAbort = false;
    }
    
    private SpeechRecognizerOnResultEvent(speechRecognition: SpeechRecognitionEvent): void
    {
        var initiators: string[] = ["stream tools", "st"];

        var result: SpeechRecognitionAlternative = speechRecognition.results[0][0];
        var transcriptLC: string = result.transcript.toLowerCase(); //This wont have the initiator on the start of it if one is found.
        var initiator: string | null = null;

        this.inputRelay.value = result.transcript;

        for (let i = 0; i < initiators.length; i++)
        {
            if (transcriptLC.startsWith(initiators[i]))
            {
                transcriptLC = transcriptLC.substr(initiators[i].length + 1); //Plus 1 for the space
                initiator = initiators[i];
                break;
            }
        }

        //I could pickup on this mid sentence but that may not be good if the phrase is sponek and not required
        if (initiator !== null)
        {
            var transcriptLCSplit: string[] = transcriptLC.split(" ");
            transcriptLCSplit = transcriptLCSplit.filter((value: string) => value !== "");

            if (transcriptLCSplit.length >= 1)
            {
                switch (transcriptLCSplit[0])
                {
                    case "mute":
                        this.ToggleMute(true);
                        break;
                    case "unmute":
                        this.ToggleMute(false);
                        break;
                    case "volume":
                        if (transcriptLCSplit[1] !== undefined) { this.VolumeChangeEvent(this.WordToNumber_ZeroToOneHundred(transcriptLCSplit[1])); }
                        break;
                    case "vol": //Had to add this because the recogniser likes to use vol instead of volume sometimes.
                        if (transcriptLCSplit[1] !== undefined) { this.VolumeChangeEvent(this.WordToNumber_ZeroToOneHundred(transcriptLCSplit[1])); }
                        break;
                    case "send": //Add more filters here, e.g. to user, display this on the chat table
                        this.eventDispatcher.dispatch("send", result.transcript.substr(initiator.length + 6)); //+6 for the two spaces and send ' send '.
                        break;
                    case "skip":
                        this.ttsPlayer.pause();
                        this.PlayNextMessage();
                        break;
                    case "repeat":
                        //Get the number index and read that from the chat table.
                        break;
                    //Twitch commands need to be looked into before I can add timeout, ban and other twitch commands.
                }
            }
        }
    }

    private SpeechRecognizerOnEndEvent(ev: Event): void
    {
        if (!this.vcAbort && this.vcEnabled && this.speechRecognizer !== undefined)
        {
            this.speechRecognizer.start();
        }
    }

    private SpeechRecognizerOnErrorEvent(err: any): void //TS compiler could not find SpeechRecognitionErrorEvent
    {
        if (err.error == "not-allowed") { Main.Alert("Please give this page microphone access."); } 

        if (err.error != "no-speech")
        {
            console.log(err);
            if (this.speechRecognizer !== undefined) { this.vcAbort = true; this.speechRecognizer.abort(); }
        }
    }

    //Add multi voice requests, use lexicons to do this if I am not wrong
    private SynthesizeSpeech(): void
    {
        //I need to fix something here with the removal of messages as the list sometimes gives undefined
        //Dont read messages if the volume is 0 or toggle muted (waste of char count quota)
        if (this.messagesToRead[0] !== undefined && this.ttsPlayer.volume !== 0 && !this.toggleMute)
        {
            var presigner: AWS.Polly.Presigner = new AWS.Polly.Presigner();
            this.speechParams.Text = this.messagesToRead[0];

            presigner.getSynthesizeSpeechUrl(this.speechParams, (error: AWS.AWSError, url: string) =>
            {
                if (error != null) { console.log(`%c${error}`, "color: red"); } //Yoinked from old project (will likley changed)
                else
                {
                    this.ttsPlayer.src = url;
                    this.ttsPlayer.load();
                    this.ttsPlayer.play();
                }
            });
        }
        else { this.PlayNextMessage(); } //Skip message
    }

    private PlayNextMessage(): void
    {
        if (this.messagesToRead.length >= 1)
        {
            setTimeout(() =>
            {
                this.messagesToRead.shift();
                this.SynthesizeSpeech();
            }, 500); //Add some delay between messages
        }
        else { this.messagesToRead = []; }
    }

    //Because this is only working with small numbers it is easy to convert, I am working on a large number converter.
    //It does not check if it is a small number so it could return unexpected results.
    private WordToNumber_ZeroToOneHundred(wordNumber: string): number
    {
        var testInt: number = parseInt(wordNumber);
        if (!isNaN(testInt)) { return testInt; }

        var words: string[] = wordNumber.replace(/and/g, "-").replace(/ /g, "-").split("-");
        words = words.filter((value: string) => value !== "");
        var digits: string[] = [];
        for (let i = 0; i < words.length; i++)
        {
            if (words[i] === "hundred") { digits.push("00"); }
            else
            {
                var num: SmallNumbers = (<any>SmallNumbers)[words[i]];
                if (num === undefined || isNaN(num)) { throw new RangeError(`'${words[i]}' was not in the range of the 'numbers' enum`); }
                else { digits.push(num.toString()); }
            }
        }

        var result: string;
        if (digits.length == 2 && digits[1] == "00") { result = digits[0] + digits[1]; }
        else if (digits.length == 2 && digits[1] != "0") { result = digits[0][0] + digits[1]; }
        else { result = digits[0]; }

        return parseInt(result);
    }

    //Consider adding an error return (if one occurs).
    //Consider passing the words to filter instead, this would mean that the function could be used elsewhere.
    private FilterMessage(_message: string, _method: "check" | "censor" | "remove" /*| "replace"*/): FilterMessage
    {
        var result: FilterMessage = { containsFilterWord: false, message: _message };
        var characters: string = _message.replace(/\s/g, "");

        for (let i = 0; i < this.filterWords.length; i++)
        {
            if (characters.includes(this.filterWords[i]))
            {
                result.containsFilterWord = true;
                break;
            }
        }

        if (_method == "check") { return result; }
        else if (_method == "censor" || _method == "remove")
        {
            //Use an array of uncommon characters
            var placeholders: string[] = ["×", "~", "±", "¬", "‰", "¶", "Œ", "§", "¦"];
            var pi: number = 0; //pi = PlaceholderIndex
            for (let i = 0; i < placeholders.length; i++)
            {
                if (!_message.includes(placeholders[i])) { pi = i; break; }
                else if (i == placeholders.length - 1) { throw new Error(`Message contains all placeholders that could be used. Unable to filter. Message: ${_message}`); }
            }

            var whitespacePositions: { index: number, length: number }[] = [];
            var whitespaceRegex: RegExp = /[\s]+/g;
            var whitespaceMatch: RegExpExecArray | null;
            while ((whitespaceMatch = whitespaceRegex.exec(_message)) !== null) { whitespacePositions.push({ index: whitespaceMatch.index, length: whitespaceMatch[0].length }); }

            this.filterWords.forEach((filterWord: string) =>
            {
                var censor: string = "";
                for (let i = 0; i < filterWord.length; i++) { censor += placeholders[pi]; }
                var regex: RegExp = new RegExp(filterWord, "g");
                characters = characters.replace(regex, censor);
            });

            var newMessage: string = characters;
            whitespacePositions.forEach(position =>
            {
                var whitespace: string = "";
                for (let i = 0; i < position.length; i++) { whitespace += " "; } //Fix this adding a space onto the end of the message.
                newMessage = newMessage.substr(0, position.index) + whitespace + newMessage.substr(position.index);
            });
            if (_method == "censor")
            {
                //Change the placeholder to an asterisk (just a prefered symbol).
                //If i were to use it as a regex placeholder, I would need to check if it needed to be escaped, Id rather only do that once and here.
                if (!newMessage.includes("*")) { newMessage = newMessage.replace(new RegExp(placeholders[pi], "g"), "*"); }
            }
            else if (_method == "remove")
            {
                newMessage = newMessage.replace(new RegExp(placeholders[pi], "g"), ""); //Remove the filter placeholder.
            }
            newMessage = newMessage.replace(/[\s]+/g, " "); //Replace whitespace 'groups' (its not grouped but eh, didnt know what else to say) with a single space.

            result.message = newMessage;
            return result;
        }
        else
        {
            result.error = "INVALID_METHOD";
            return result;
        }
    }
}

export type SpeechManagerOptions =
{
    awsRegion: string,
    awsIdentityPoolID: string,
    filterMode: 0 | 1 | 2,  //Off, Remove, Skip
    //filterMode: FilterMode, //Use an enum for this in the future
    filterWords: string
}

type FilterMessage =
{
    containsFilterWord: boolean,
    message: string,
    error?: string
}

enum SmallNumbers
{
    zero = 0,
    one = 1,
    two = 2,
    three = 3,
    four = 4,
    five = 5,
    six = 6,
    seven = 7,
    eight = 8,
    nine = 9,
    ten = 10,
    eleven = 11,
    twelve = 12,
    thirteen = 13,
    fourteen = 14,
    fifteen = 15,
    sixteen = 16,
    seventeen = 17,
    eighteen = 18,
    nineteen = 19,
    twenty = 20,
    thirty = 30,
    forty = 40,
    fifty = 50,
    sixty = 60,
    seventy = 70,
    eighty = 80,
    ninety = 90
}

type SpeechParams =
{
    Engine: string,
    OutputFormat: string,
    SampleRate: string,
    Text: string,
    TextType: string,
    VoiceId: string
}