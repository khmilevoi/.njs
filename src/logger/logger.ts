import {NjsError, NjsLogger} from "./types";

export class Logger implements NjsLogger {
    handle(error: any): void {
        if (error instanceof NjsError) {
        }
    }
    
    log(...data: any[]): void {
        console.log(`[Njs log]:(${new Date().toISOString()}): `, ...data);
    }
}
