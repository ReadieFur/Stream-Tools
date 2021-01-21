import { EventDispatcher } from "./eventDispatcher.ts.js";
import { Main } from "./main.ts.js"
import { TwitchWS, PRIVMSG } from "./twitchWS.ts.js";

export class ChatManager
{
    public eventDispatcher: EventDispatcher;

    private volumeSlider!: HTMLInputElement;
    private volumePercent!: HTMLParagraphElement;
    private sendMessageButton!: HTMLButtonElement;
    private messageInput!: HTMLButtonElement;
    private chatTable!: HTMLTableElement;

    private twitchWS: TwitchWS;

    constructor()
    {
        this.eventDispatcher = new EventDispatcher();
        this.twitchWS = new TwitchWS();

        window.addEventListener("load", () => { this.WindowLoadEvent(); });
        this.twitchWS.eventDispatcher.addListener("message", (data: any) => { this.eventDispatcher.dispatch("message", data); });

        this.eventDispatcher.addListener("message", (data: any) => { this.OnMessage(data); });
    }

    private WindowLoadEvent(): void
    {
        this.volumeSlider = Main.ThrowIfNullOrUndefined(document.querySelector("#volumeSlider"));
        this.volumePercent = Main.ThrowIfNullOrUndefined(document.querySelector("#volumePercent"));
        this.sendMessageButton = Main.ThrowIfNullOrUndefined(document.querySelector("#sendMessageButton"));
        this.messageInput = Main.ThrowIfNullOrUndefined(document.querySelector("#messageInput"));
        this.chatTable = Main.ThrowIfNullOrUndefined(document.querySelector("#chatTable"));
    }

    public UpdateCredentials(data: { oAuth: string, username: string }): void
    { this.twitchWS.Connect(data.oAuth, data.username); }

    public OnMessage(data: PRIVMSG): void
    {
        console.log(data.message);
    }
}