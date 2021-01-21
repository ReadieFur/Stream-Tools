export class EventDispatcher
{
    private events: Events = {};

    public addListener(event: string, callback: (data?: any) => any): boolean
    {
        if (this.events[event] !== undefined) { return false; }
        this.events[event] = { listeners: [] };
        this.events[event].listeners.push(callback);
        return true;
    }
  
    public removeListener(event: string, callback: (data?: any) => any): boolean
    {
        if (this.events[event] === undefined) { return false; }
        for (let i = 0; i < this.events[event].listeners.length; i++)
        { if (this.events[event].listeners[i] === callback) { delete this.events[event].listeners[i]; } }
        return true;
    }
  
    public dispatch(event: string, data?: any): boolean
    {
        if (this.events[event] === undefined) { return false; }
        this.events[event].listeners.forEach((listener: any) => { listener(data); });
        return true;
    }
}

type Events =
{
    [eventName: string]:
    {
        listeners: { (data?: any): any; } []
    }
}