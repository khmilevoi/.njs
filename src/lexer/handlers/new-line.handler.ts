import { NjsVisitor } from "../../shared/visitor.shared";
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

  read(visitor: NjsVisitor): NjsLexerHandlerLexemeDescriptor<never> {
    if (visitor.peep() === NewLineHandler.newLine) {
      visitor.pop();

      return {
        token: new NewLineToken(),
      };
    }

    return {};
  }
}
