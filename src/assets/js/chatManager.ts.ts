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
        this.twitchWS.eventDispatcher.addListener("join", (data: any) => { this.eventDispatcher.dispatch("join", data); });
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

        this.messageInput.addEventListener("keypress", (data: KeyboardEvent) => { this.MessageInputOnKeypress(data); });
    }

    public UpdateCredentials(data: { oAuth: string, username: string }): void
    {
        this.twitchWS.Connect(data.oAuth, data.username);
    }

    public OnMessage(data: PRIVMSG): void
    {
        this.UpdateChatTable(data.display_name, data.message);
    }

    private UpdateChatTable(username: string, message: string)
    {
        var rowSpacerElement = document.createElement("tr");
        var trElement = document.createElement("tr");
        var timeElement = document.createElement("td");
        var usernameElement = document.createElement("td");
        var messageElement = document.createElement("td");

        rowSpacerElement.className = "rowSpacer";
        var date = new Date();
        timeElement.className = "time";
        timeElement.innerHTML = `${date.getHours()}:${date.getMinutes() > 10 ? date.getMinutes() : '0' + date.getMinutes()}`;
        usernameElement.className = "username";
        usernameElement.innerHTML = username;
        messageElement.className = "message";
        messageElement.innerHTML = message;

        trElement.appendChild(timeElement);
        trElement.appendChild(usernameElement);
        trElement.appendChild(messageElement);
        this.chatTable.tBodies[0].appendChild(trElement);
        this.chatTable.tBodies[0].appendChild(rowSpacerElement);
    }

    private MessageInputOnKeypress(data: KeyboardEvent)
    {
        data.preventDefault();
        if (data.key == "Enter")
        {
            this.twitchWS.eventDispatcher.dispatch("sendMessage", this.messageInput.value);
            this.UpdateChatTable(this.twitchWS.GetUsername(), this.messageInput.value);
            this.messageInput.value = "";
        }
        else
        {
            this.messageInput.value += data.key;
        }
    }
}