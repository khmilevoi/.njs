import {NjsError} from "../logger/types";

export class LexerError extends NjsError{
    constructor(message: string) {
        super("lexer", message);
    }
}
