declare var WEB_ROOT: string;

export class TestClass
{
    private username: string = "kof_readie";

    constructor()
    {
        //console.log(this.DecodeMessage("@badge-info=;badges=;client-nonce=b97c690d42e084d1da6460ab0faf57f9;color=;display-name=kof_readiealt;emotes=;flags=;id=8ed9289e-c934-412b-b1c6-e1b0928aab23;mod=0;room-id=434089842;subscriber=0;tmi-sent-ts=1611249940224;turbo=0;user-id=639098497;user-type= :kof_readiealt!kof_readiealt@kof_readiealt.tmi.twitch.tv PRIVMSG #kof_readie :this is a test mesage", "PRIVMSG"));
    
        jQuery.ajax(
        {
            url: `${WEB_ROOT}/assets/php/settings.php`,
            method: "POST",
            dataType: "json",
            data:
            {
                "q": JSON.stringify(
                {
                    update_twitch:
                    {
                        twitch_username: "kof_readie",
                        twitch_oauth: "oauth:"
                    },
                    unid: "",
                    pass: ""
                })
            },
            success: (response: any) =>
            {
                console.log(response);
            }
        });
    }
}