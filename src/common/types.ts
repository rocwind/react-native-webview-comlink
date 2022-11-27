export interface CoreJSInterface {
    webToMobile(event: string) : Promise<any>;
    webToMobile(event: string): void;
}

export interface Event {
    eventID: string;
    eventName: string;
    data: string;
}