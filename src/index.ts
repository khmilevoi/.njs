import { Njs } from "./language/njs";
import { Lexer } from "./lexer/lexer";
import { IdentifierHandler } from "./lexer/tokens/identifier.handler";
import { NewLineHandler } from "./lexer/tokens/new-line.handler";
import { NumberHandler } from "./lexer/tokens/number.handler";
import { OneLineCommentHandler } from "./lexer/tokens/one-line-comment.handler";
import { SemicolonHandler } from "./lexer/tokens/semicolon.handler";
import { ServiceSymbolsHandler } from "./lexer/tokens/service-symbols.handler";
import { StringHandler } from "./lexer/tokens/string.handler";
import { Logger } from "./logger/logger";

export const njs = new Njs(
  new Logger(),
  new Lexer(
    new StringHandler('"'),
    new OneLineCommentHandler("//"),
    new IdentifierHandler(),
    new SemicolonHandler(),
    new NewLineHandler(),
    new ServiceSymbolsHandler(),
    new NumberHandler()
  )
);
