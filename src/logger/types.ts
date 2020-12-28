export class NjsError extends Error {}

export interface NjsLogger {
  log(...data: any[]): void;

  handle(error: NjsError): void;
}
