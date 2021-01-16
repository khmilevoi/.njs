import { NjsError } from "logger/types";

export class PreprocessorError extends NjsError {
  constructor(message: string) {
    super("preprocessor", message);
  }
}
