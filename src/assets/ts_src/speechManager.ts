import { EventDispatcher } from "./eventDispatcher";
import { Main } from "./main";
import AWS from "aws-sdk";
import { PRIVMSG } from "./twitchWS";

//In the future I will impliment other TTS methods e.g. Web Speech API. For now I will be using AWS Polly.
//When I implement the Web Speeck API, I will add voice commands to the settings menu.
export class SpeechManager
{
    public eventDispatcher: EventDispatcher;
    public ttsEnabled: boolean;

    private ttsPlayer!: HTMLAudioElement;
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

        this.ttsPlayer.addEventListener("ended", () => { this.PlayNextMessage(); });
    }

    public ToggleTTS(data: boolean): void
    {
        this.ttsEnabled = data;
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
        else if (text = "") { return; }
        else if (text.startsWith("!")) { return; }
        else { this.messagesToRead.push(text); }
    }

    private SynthesizeSpeech(text: string): void
    {
        var presigner: AWS.Polly.Presigner = new AWS.Polly.Presigner();
        this.speechParams.Text = text;
        presigner.getSynthesizeSpeechUrl(this.speechParams, (error: AWS.AWSError, url: string) =>
        {
            if (error.code != undefined) { console.log(`%c${error}`, "color: red"); } //Yoinked from old project (will be changed)
            else
            {
                this.ttsPlayer.src = url;
                this.ttsPlayer.load();
                this.ttsPlayer.play();
            }
        });
    }

    private PlayNextMessage(): void
    {
        if (this.ttsEnabled && this.messagesToRead.length >= 1)
        {
            this.SynthesizeSpeech(this.messagesToRead[0]);
            this.messagesToRead.shift();
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