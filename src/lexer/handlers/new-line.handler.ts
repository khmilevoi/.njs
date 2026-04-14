import { LexerVisitor } from "lexer/lexer.visitor";
import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
} from "../types";

export class NewLineToken extends NjsBaseToken<undefined> {
  readonly type = "new-line";

  constructor() {
    super(undefined);
  }
}

export class NewLineHandler extends NjsBaseHandler<undefined> {
  public static readonly newLine = "\n";

  read(visitor: LexerVisitor): NjsLexerHandlerLexemeDescriptor<undefined> {
    if (visitor.accept(NewLineHandler.newLine)) {
      visitor.pop();

      return {
        token: new NewLineToken(),
      };
    }

    return {};
  }
}
