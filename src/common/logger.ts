export type Logger = (msg: string) => void;

export function createLogger(log?: boolean | Logger): Logger {
    if (!log) {
        return () => {};
    }

    const logger: Logger = typeof log === 'function' ? log : (msg) => console.log(msg);
    return (msg) => {
        logger(`[WebViewComlink] ${msg}`);
    };
}
