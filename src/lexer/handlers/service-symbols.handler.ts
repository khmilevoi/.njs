import { NjsVisitor } from "../../shared/visitor.shared";
import {
  NjsBaseHandler,
  NjsBaseToken,
  NjsLexerHandlerLexemeDescriptor,
} from "../types";

export class ServiceSymbolsToken extends NjsBaseToken<string> {
  readonly type = "service-symbol";
}

export class ServiceSymbolsHandler extends NjsBaseHandler<string> {
  public static readonly pattern = /(?=\W)(?=\S)./;

  read(visitor: NjsVisitor): NjsLexerHandlerLexemeDescriptor<string> {
    if (visitor.accept(ServiceSymbolsHandler.pattern)) {
      return {
        token: new ServiceSymbolsToken(visitor.pop()),
      };
    }

    return {};
  }
}
