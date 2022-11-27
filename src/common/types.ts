// export interface CoreJSInterface {
export interface CoreJSInterface {
    webToMobile(event: string) : Promise<any>;
}

export interface Event {
    eventID: string;
    eventName: string;
    data: string;
}