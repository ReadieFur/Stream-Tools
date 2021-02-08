import { EventDispatcher } from "./eventDispatcher";
import { Main } from "./main";
import AWS from "aws-sdk";
import { PRIVMSG } from "./twitchWS";

//In the future I will impliment other TTS methods e.g. Web Speech API. For now I will be using AWS Polly.
//When I implement the Web Speeck API, I will add voice commands to the settings menu.
export class SpeechManager
{
    public eventDispatcher: EventDispatcher;
    
    private ttsEnabled: boolean;
    private ttsPlayer!: HTMLAudioElement;
    private volumePercent!: HTMLParagraphElement;
    private volumeSlider!: HTMLInputElement;
    private toggleMute: boolean = false;
    private polly: AWS.Polly;
    private speechParams: SpeechParams;
    private messagesToRead: string[];

    constructor()
    {
        this.eventDispatcher = new EventDispatcher();
        this.ttsEnabled = false;
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

        window.addEventListener("load", () => { this.WindowLoadEvent(); })
    }

    private WindowLoadEvent(): void
    {
        this.ttsPlayer = Main.ThrowIfNullOrUndefined(document.querySelector("#ttsPlayer"));
        this.volumePercent = Main.ThrowIfNullOrUndefined(document.querySelector("#volumePercent"));
        this.volumeSlider = Main.ThrowIfNullOrUndefined(document.querySelector("#volumeSlider"));

        this.ttsPlayer.volume = 0.5;

        this.ttsPlayer.addEventListener("ended", () => { this.PlayNextMessage(); });
        this.volumeSlider.addEventListener("input", (e) => { this.VolumeChangeEvent(e); });
        this.volumePercent.addEventListener("click", () =>
        {
            this.toggleMute = !this.toggleMute;
            var volume: number = this.toggleMute ? 0 : this.ttsPlayer.volume * 100;
            this.volumeSlider.value = volume.toString();
            this.volumePercent.innerHTML = `${volume}%`;
        });
    }

    private VolumeChangeEvent(e: Event)
    {
        this.toggleMute = false;
        var volume: number = Math.round(parseInt(this.volumeSlider.value));
        this.ttsPlayer.volume = volume / 100;
        this.volumePercent.innerHTML = `${volume}%`;
    }

    public ToggleTTS(data: boolean): void
    {
        this.ttsEnabled = data;
        var displayMode: string = this.ttsEnabled ? 'inline-block' : 'none';
        this.volumePercent.style.display = displayMode;
        this.volumeSlider.style.display = displayMode;
    }

    public AWSCredentialsUpdated(data: { awsRegion: string, awsIdentityPoolID: string }): void
    {
        AWS.config.region = data.awsRegion;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: data.awsIdentityPoolID });
    }

    public OnMessage(message: PRIVMSG): void
    {
        var text: string = message.message;
        if (!this.ttsEnabled) { return; }
        else if (text == "") { return; }
        else if (text.startsWith("!")) { return; }
        else
        {
            this.messagesToRead.push(text);
            if (this.messagesToRead.length <= 1) { this.SynthesizeSpeech(); }
        }
    }

    //Add multi voice requests
    private SynthesizeSpeech(): void
    {
        //I need to fix something here with the removal of messages as the list sometimes gives undefined
        //Dont read messages if the volume is 0 or toggle muted (waste of char count quota)
        if (this.messagesToRead[0] != undefined || !this.toggleMute || this.ttsPlayer.volume == 0)
        {
            var presigner: AWS.Polly.Presigner = new AWS.Polly.Presigner();
            this.speechParams.Text = this.messagesToRead[0];
            presigner.getSynthesizeSpeechUrl(this.speechParams, (error: AWS.AWSError, url: string) =>
            {
                if (error != null) { console.log(`%c${error}`, "color: red"); } //Yoinked from old project (will be changed)
                else
                {
                    this.ttsPlayer.src = url;
                    this.ttsPlayer.load();
                    this.ttsPlayer.play();
                }
            });
        }
    }

    private PlayNextMessage(): void
    {
        if (this.ttsEnabled && this.messagesToRead.length >= 1)
        {
            setTimeout(() =>
            {
                this.messagesToRead.shift();
                this.SynthesizeSpeech();
            }, 500); //Add some delay between messages
        }
        else { this.messagesToRead = []; }
    }
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