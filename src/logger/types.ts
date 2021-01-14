export class NjsError extends Error {
  constructor(
    public readonly source: string,
    message: string,
    public readonly line?: number
  ) {
    super("");

    this.message = `[${source.toUpperCase()}]; ${message}`;

    if (line != null) {
      this.message += ` in ${line}`;
    }
  }
}

export interface NjsLogger {
  log(...data: any[]): void;

  time(key: string): void;

  handle(error: NjsError): void;
}
