import { NjsError } from "logger/types";

export class ExecutorError extends NjsError {
  constructor(message: string, line?: number) {
    super("executor", message, line);
  }
}
