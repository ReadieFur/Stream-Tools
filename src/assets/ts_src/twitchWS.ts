import { EventDispatcher } from "./eventDispatcher";

export class TwitchWS
{
    public eventDispatcher: EventDispatcher;
    private client!: WebSocket; //Add checks to see if the client is connected
    private username!: string;

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
        else if (data.startsWith(`:tmi.twitch.tv 001 ${this.username} :Welcome, GLHF!`)) { this.eventDispatcher.dispatch("connect"); }
        else if (data.startsWith(`:${this.username}!${this.username}@${this.username}.tmi.twitch.tv JOIN #${this.username}`))
        {
            this.eventDispatcher.dispatch("join",
            {
                username: this.username
            });
        }
        else if (data.includes("PRIVMSG")) { this.eventDispatcher.dispatch("message", this.DecodeMessage(data, "PRIVMSG")); } //Create types for each of these
    }

    //Work on this more for other message types
    private DecodeMessage(_data: string, _tag: string): { [key: string]: string | number | null }
    {
        var result: { [key: string]: string | number | null } = {};
        var keyValueJoined: string[] = _data.replaceAll("=;", "=null;").split(";");
        for (let i = 0; i < keyValueJoined.length; i++)
        {
            var keyValuePair: string[] = keyValueJoined[i].split("=");
            keyValuePair[0] = keyValuePair[0].replaceAll("@", "").replaceAll("-", "_");
            var value: string | number | null;
            if (keyValuePair[1] == "null") { value = null; }
            else
            {
                var tryInt: number = parseInt(keyValuePair[1]);
                if (!isNaN(tryInt)) { value = tryInt; }
                else
                {
                    if (i == keyValueJoined.length - 1) //Work on this in case of change
                    {
                        var finalMessage: string[] = keyValuePair[1].split(`${_tag} #${this.username} :`); //Data lost here '${tag} #${this.username} :'
                        result["message"] = finalMessage[1];
                        value = finalMessage[0]; //'user-type' has been replaced with 'badges', don't use this data (left messy).
                    }
                    else { value = keyValuePair[1]; }
                }
            }

            result[keyValuePair[0]] = value;
        }
        return result;
    }

    private SendMessage(message: string)
    {
        this.client.send(`PRIVMSG #${this.username} :${message}`);
    }
}

export type PRIVMSG =
{
    badge_info: string | null,
    badges: string | null,
    client_nonce: number,
    color: string | null,
    display_name: string,
    emotes: string | null,
    flags: string | null,
    id: string,
    message: string,
    mod: number,
    room_id: number,
    subscriber: number,
    tmi_sent_ts: number,
    turbo: number,
    user_id: number,
    user_type: string
}