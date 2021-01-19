import { NjsError } from "logger/types";

export class ParserError extends NjsError {
  constructor(message: string, line?: number) {
    super("parser", message, line);
  }
}
