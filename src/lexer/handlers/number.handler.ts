import { NjsVisitor } from "../../shared/visitor.shared";
import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
} from "../types";

export class NumberToken extends NjsBaseToken<number> {
  readonly type: string = "number";
}

export class NumberHandler extends NjsBaseHandler<number> {
  public static readonly pattern = /^\d+\.?(\d+)?$/;

  private readonly digit = /\d|\./;

  read(visitor: NjsVisitor): NjsLexerHandlerLexemeDescriptor<number> {
    if (this.digit.test(visitor.peep())) {
      let inner = visitor.pop();

      while (visitor.accept(this.digit)) {
        inner += visitor.pop();

        if (!NumberHandler.pattern.test(inner)) {
          return {};
        }
      }

      if (NumberHandler.pattern.test(inner)) {
        return {
          token: new NumberToken(Number.parseFloat(inner)),
        };
      }
    }

    return {};
  }
}
