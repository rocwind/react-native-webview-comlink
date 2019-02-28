export interface Logger {
    (msg: string): void;
}

export function createLogger(debug?: boolean): Logger {
    return (msg) => {
        if (debug) {
            console.log(`[WebViewComlink] ${msg}`);
        }
    }
}
