export interface Logger {
    (msg: string): void;
}

export function createLogger(log?: boolean | Logger): Logger {
    if (!log) {
        return () => {};
    }

    const logger: Logger = typeof log === 'function' ? log : console.log;
    return (msg) => {
        logger(`[WebViewComlink] ${msg}`);
    };
}
