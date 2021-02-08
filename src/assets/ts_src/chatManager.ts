import { EventDispatcher } from "./eventDispatcher";
import { Main } from "./main"
import { TwitchWS, PRIVMSG } from "./twitchWS";
import { SpeechManager } from "./speechManager";

//I will be implementing filters and spam detection as settings that can be configured by the user at some point.
//This will also help cut down on the AWS Polly character quota if the user has this option enabled.
export class ChatManager
{
    public eventDispatcher: EventDispatcher;

    private speechManager: SpeechManager;
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
        this.speechManager = new SpeechManager();

        window.addEventListener("load", () => { this.WindowLoadEvent(); });
        this.twitchWS.eventDispatcher.addListener("join", (data: any) => { this.eventDispatcher.dispatch("join", data); });
        this.twitchWS.eventDispatcher.addListener("message", (data: PRIVMSG) =>
        {
            this.eventDispatcher.dispatch("message", data);
            this.OnMessage(data);
            this.speechManager.OnMessage(data);
        });
        //this.eventDispatcher.addListener("message", (data: PRIVMSG) => {}); //This event listner was being really weird so I moved the functions into the event listner above.
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

    //I need a better way of doing this, probably contain everything in main and callback to there.
    public UpdateTwitchCredentials(data: { oAuth: string, username: string }): void
    { this.twitchWS.Connect(data.oAuth, data.username); }

    public ToggleTTS(data: boolean) { this.speechManager.ToggleTTS(data); }

    public AWSCredentialsUpdated(data: any) { this.speechManager.AWSCredentialsUpdated(data); }

    private UpdateChatTable(username: string, messageElement: HTMLTableDataCellElement) //Add emote support
    {
        var rowSpacerElement = document.createElement("tr");
        var trElement = document.createElement("tr");
        var timeElement = document.createElement("td");
        var usernameElement = document.createElement("td");

        rowSpacerElement.className = "rowSpacer";
        var date = new Date();
        timeElement.className = "time";
        timeElement.innerHTML = `${date.getHours()}:${date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()}`;
        usernameElement.className = "username";
        usernameElement.innerHTML = username;
        messageElement.className = "message";

        trElement.appendChild(timeElement);
        trElement.appendChild(usernameElement);
        trElement.appendChild(messageElement);
        this.chatTable.tBodies[0].appendChild(trElement);
        this.chatTable.tBodies[0].appendChild(rowSpacerElement);
    }

    private OnMessage(data: PRIVMSG)
    {
        var messageContainer = document.createElement("td");

        //#region Twitch emote parsing
        var messageSplit: { message: string, src?: string }[] = [];
        for (var i = 0, e = data.message.split(" "); i < e.length; i++) { messageSplit[i] = { message: e[i] }; }

        data.emotes.forEach(emoteSet =>
        {
            emoteSet.positions.forEach(position =>
            {
                var arrayIndex = data.message.substring(0, position.start).split(" ").length - 1; //-1 because of the included "" field at the end
                messageSplit[arrayIndex] =
                {
                    message: messageSplit[arrayIndex].message, //Cheap fix
                    src: `https://static-cdn.jtvnw.net/emoticons/v1/${emoteSet.id}/1.0`
                };
            });
        });

        for (var i = 0, messageBuffer = ""; i < messageSplit.length; i++) //Reconstruct message
        {
            if (messageSplit[i].src == undefined) { messageBuffer += `${messageSplit[i].message} `; }
            else
            {
                var span: HTMLSpanElement = document.createElement("span");
                span.innerHTML = messageBuffer;
                messageContainer.appendChild(span);

                var img = document.createElement("img");
                img.alt = messageSplit[i].message;
                img.src = messageSplit[i].src!;
                messageContainer.appendChild(img);

                messageBuffer = " ";
            }

            if (i == messageSplit.length - 1 && messageSplit[i].src == undefined)
            {
                var span: HTMLSpanElement = document.createElement("span");
                span.innerHTML = messageBuffer;
                messageContainer.appendChild(span);
            }
        }
        //#endregion

        console.log(messageContainer);

        this.UpdateChatTable(data.display_name, messageContainer);
    }

    private MessageInputOnKeypress(data: KeyboardEvent)
    {
        data.preventDefault();
        if (data.key == "Enter")
        {
            this.twitchWS.eventDispatcher.dispatch("sendMessage", this.messageInput.value);

            var messageElement = document.createElement("td");
            var message = document.createElement("span");
            message.innerHTML = this.messageInput.value;
            messageElement.appendChild(message);
            this.UpdateChatTable(this.twitchWS.GetUsername(), messageElement); //Fix for emote parsing

            this.messageInput.value = "";
        }
        else
        {
            this.messageInput.value += data.key;
        }
    }
}