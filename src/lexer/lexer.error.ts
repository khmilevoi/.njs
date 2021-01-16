import { NjsError } from "logger/types";

export class LexerError extends NjsError {
  constructor(message: string, line: number) {
    super("lexer", message, line);
  }
}
