declare var WEB_ROOT: string;

export class TestClass
{
    private username: string = "kof_readie";
    //private speechRecogniser!: SpeechRecognition;
    //private speechGrammarList!: SpeechGrammarList;

    constructor()
    {
        //console.log(this.DecodeMessage("@badge-info=;badges=;client-nonce=b97c690d42e084d1da6460ab0faf57f9;color=;display-name=kof_readiealt;emotes=;flags=;id=8ed9289e-c934-412b-b1c6-e1b0928aab23;mod=0;room-id=434089842;subscriber=0;tmi-sent-ts=1611249940224;turbo=0;user-id=639098497;user-type= :kof_readiealt!kof_readiealt@kof_readiealt.tmi.twitch.tv PRIVMSG #kof_readie :this is a test mesage", "PRIVMSG"));
    
        /*window.addEventListener("load", () =>
        {
            this.speechRecogniser = new SpeechRecognition();
            this.speechGrammarList = new SpeechGrammarList();
    
            this.speechRecogniser.continuous = true;
            this.speechRecogniser.lang = "en-US";
            this.speechRecogniser.interimResults = false;
            this.speechRecogniser.maxAlternatives = 1;
    
            this.speechRecogniser.start();
    
            this.speechRecogniser.onresult = (event) =>
            {
                console.log(event.results[0][0].confidence);
            }
    
            this.speechRecogniser.onnomatch = (event) =>
            {
                console.log(event);
            }
    
            this.speechRecogniser.onerror = (event) =>
            {
                console.log(event);
            }
        });*/
    }
}