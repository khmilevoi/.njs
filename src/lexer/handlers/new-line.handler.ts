import { LexerVisitor } from "lexer/lexer.visitor";
import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
} from "../types";

export class NewLineToken extends NjsBaseToken<never> {
  readonly type = "new-line";
}

export class NewLineHandler extends NjsBaseHandler<never> {
  public static readonly newLine = "\n";

  read(visitor: LexerVisitor): NjsLexerHandlerLexemeDescriptor<never> {
    if (visitor.accept(NewLineHandler.newLine)) {
      visitor.pop();

      return {
        token: new NewLineToken(),
      };
    }

    return {};
  }
}
