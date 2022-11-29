// export interface CoreJSInterface {
export interface CoreJSInterface {
    webToMobile(event: string) : Promise<any>;
    setMobileInterface(mobileToWebInterface: MobileToWebInterface) : Promise<any>;
}

export interface Event {
    eventID: string;
    eventName: string;
    data: string;
}

// TODO
export interface MobileToWebInterface {
    mobileToWeb(event: string) : Promise<any>
}