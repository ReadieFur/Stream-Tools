import { timeStamp } from "console";
import { start } from "repl";
import { EventDispatcher } from "./eventDispatcher";
import { Main } from "./main";

export class TwitchWS
{
    public eventDispatcher: EventDispatcher;

    //https://api.betterttv.net/3/cached/users/twitch/<ID>
    //https://api.frankerfacez.com/v1/id/<ID>
    //Twitch emotes are send with the message
    private bttvCache!: BTTVCache;
    private client!: WebSocket; //Add checks to see if the client is connected
    private username!: string;
    private userID?: number;

    constructor()
    {
        this.eventDispatcher = new EventDispatcher();
        this.eventDispatcher.addListener("sendMessage", (message: string) => { this.SendMessage(message); });
    }

    public GetUsername(): string
    {
        return this.username;
    }

    public Connect(_oAuth: string, _username: string): void
    {
        if (this.client instanceof WebSocket) { this.client.close(1000, "CLOSE_NORMAL"); }
        this.client = new WebSocket("wss://irc-ws.chat.twitch.tv");
        this.client.onopen = (data: any) => { this.OnOpenEvent(_oAuth, _username, data); };
        this.client.onclose = (data: any) => {};
        this.client.onmessage = (data: any) => { this.OnMessageEvent(data); };
        this.username = _username;
    }

    private OnOpenEvent(_oAuth: string, _username: string, _data: any): void
    {
        this.client.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
        this.client.send(`PASS ${_oAuth}`);
        this.client.send(`NICK ${_username}`);
        this.client.send(`JOIN #${_username}`);
    }

    //Try to make this cleaner and able to respond to more message types
    private OnMessageEvent(_data: any): void
    {
        var data: string = String(_data.data);
        if (data.startsWith("PING :tmi.twitch.tv")) { this.client.send("PONG :tmi.twitch.tv"); }
        else if (data.startsWith(`:tmi.twitch.tv 001 ${this.username} :Welcome, GLHF!`))
        {
            this.userID = parseInt(data.substring(data.search("user-id=") + 8).split(";")[0]);
            jQuery.ajax(
            {
                url: `https://api.betterttv.net/3/cached/users/twitch/${this.userID}`,
                method: "GET",
                dataType: "json",
                error: Main.ThrowAJAXJsonError,
                success: (result) => { this.bttvCache = result; }
            });
            this.eventDispatcher.dispatch("connect");
        }
        else if (data.startsWith(`:${this.username}!${this.username}@${this.username}.tmi.twitch.tv JOIN #${this.username}`))
        {
            this.eventDispatcher.dispatch("join",
            {
                username: this.username
            });
        }
        else if (data.includes("PRIVMSG")) //Need to check if a user sent the word 'PRIVMSG' to prevent this from breaking
        {
            this.eventDispatcher.dispatch("message", new PRIVMSG(data, this.username));
            console.log(new PRIVMSG(data, this.username));
        }
    }

    private SendMessage(message: string)
    {
        this.client.send(`PRIVMSG #${this.username} :${message}`);
    }
}

export class PRIVMSG
{
    public badge_info: string | null = null;
    public badges: string | null = null;
    public client_nonce: string = "";
    public color: string | null = null;
    public display_name: string = "";
    public emote_only: number = 0;
    public emotes:
    {
        id: number,
        positions:
        {
            start: number,
            end: number
        }[]
    }[] = [];
    public flags: string | null = null;
    public id: string = "";
    public message: string = "";
    public mod: number = NaN;
    public room_id: number = NaN;
    public subscriber: number = NaN;
    public tmi_sent_ts: number = NaN;
    public turbo: number = NaN;
    public user_id: number = NaN;
    public user_type: string = "";

    constructor(_data: string, _username: string)
    {
        var keyValueJoined: string[] = _data.replace(/=;/g, "=null;").split(";");
        for (let i = 0; i < keyValueJoined.length; i++)
        {
            var keyValuePair: string[] = keyValueJoined[i].split("=");
            keyValuePair[0] = keyValuePair[0].replace(/@/g, "").replace(/-/g, "_");

            if (i == keyValueJoined.length - 1) { keyValuePair[0] = "message"; }

            switch (keyValuePair[0])
            {
                case "badge_info":
                    this.badge_info = keyValuePair[1];
                    break;
                case "badges":
                    this.badges = keyValuePair[1];
                    break;
                case "client_nonce":
                    this.client_nonce = keyValuePair[1];
                    break;
                case "color":
                    this.color = keyValuePair[1];
                    break;
                case "display_name":
                    this.display_name = keyValuePair[1];
                    break;
                case "emote_only":
                    this.emote_only = parseInt(keyValuePair[1]);
                    break;
                case "emotes":
                    //Refrence value: '30:0-8,24-32,34-42/28:10-22'
                    if (keyValuePair[1] != "null")
                    {
                        keyValuePair[1].split("/").forEach(emoteSet =>
                        {
                            var idPositions = emoteSet.split(":");
                            var positionsArray = idPositions[1].split(",");
                            var _positions: { start: number, end: number }[] = [];
                            positionsArray.forEach(positionString =>
                            {
                                var startEnd = positionString.split("-");
                                var startEndObject =
                                {
                                    start: parseInt(startEnd[0]),
                                    end: parseInt(startEnd[1])
                                };
                                _positions.push(startEndObject);
                            });
    
                            var emoteObject =
                            {
                                id: parseInt(idPositions[0]),
                                positions: _positions
                            };
                            this.emotes.push(emoteObject);
                        });
                    }
                    break;
                case "flags":
                    this.flags = keyValuePair[1];
                    break;
                case "id":
                    this.id = keyValuePair[1];
                    break;
                case "message":
                    this.message = keyValuePair[1].split(`PRIVMSG #${_username} :`)[1]; //Data lost here: '${tag} #${this.username} :'
                    break;
                case "mod":
                    this.mod = parseInt(keyValuePair[1]);
                    break;
                case "room_id":
                    this.room_id = parseInt(keyValuePair[1]);
                    break;
                case "subscriber":
                    this.subscriber = parseInt(keyValuePair[1]);
                break;
                case "tmi_sent_ts":
                    this.tmi_sent_ts = parseInt(keyValuePair[1]);
                    break;
                case "turbo":
                    this.turbo = parseInt(keyValuePair[1]);
                    break;
                case "user_id":
                    this.user_id = parseInt(keyValuePair[1]);
                    break;
                case "user_type":
                    this.user_type = keyValuePair[1];
                    break;
                default:
                    console.log(`Unknown key: ${keyValuePair[0]}`);
                    break;
            }
        }
    }
}

type BTTVCache = 
{
    message?: string,
    id?: string,
    bots?: string[],
    channelEmotes?: string[],
    sharedEmotes?:
    {
        id: string,
        code: string,
        imageType: string,
        user:
        {
            id: string,
            name: string,
            displayName: string,
            providerId: number
        }
    }[]
}