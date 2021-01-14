import { NjsError, NjsLogger } from "./types";

export class Logger implements NjsLogger {
  private readonly times: Map<string, number> = new Map<string, number>();

  handle(error: any): void {
    if (error instanceof NjsError) {
      this.log(error.message);
    } else {
      console.log(error);
    }
  }

  log(...data: any[]): void {
    console.log(`[Njs log]:(${new Date().toISOString()}): `, ...data);
  }

  time(key: string): void {
    const current = this.times.get(key);

    if (current == null) {
      this.times.set(key, Date.now());
      this.log(`started ${key}`);
    } else {
      this.times.delete(key);
      const diff = Date.now() - current;

      this.log(`ended ${key} in ${diff}`);
    }
  }
}
