import { LexerVisitor } from "lexer/lexer.visitor";
import { NjsBaseHandler, NjsLexerHandlerLexemeDescriptor } from "../types";

export class SpaceHandler extends NjsBaseHandler<never> {
  public static readonly pattern = / /;

  read(visitor: LexerVisitor): NjsLexerHandlerLexemeDescriptor<never> {
    visitor.popWhileAccept(SpaceHandler.pattern);

    return {};
  }
}
