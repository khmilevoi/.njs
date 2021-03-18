import { LexerVisitor } from "lexer/lexer.visitor";
import { NjsBaseHandler, NjsLexerHandlerLexemeDescriptor } from "../types";

export class OneLineCommentHandler extends NjsBaseHandler<string> {
  public static readonly start = "//";
  public static readonly end = "\n";

  read(visitor: LexerVisitor): NjsLexerHandlerLexemeDescriptor<string> {
    if (visitor.pop().concat(visitor.peep()) === OneLineCommentHandler.start) {
      visitor.pop();

      while (visitor.notAccept(OneLineCommentHandler.end)) {
        visitor.pop();
      }
    } else {
      visitor.revert();
    }

    return {};
  }
}
