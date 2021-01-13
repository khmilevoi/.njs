export class NjsError extends Error {
    constructor(public readonly source: string, message: string) {
        super(`[${source.toUpperCase()}] ${message}`);
    }
}

export interface NjsLogger {
    log(...data: any[]): void;
    
    handle(error: NjsError): void;
}
