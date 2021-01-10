import { Njs } from "./language/njs";
import { Lexer } from "./lexer/lexer";
import { IdentifierHandler } from "./lexer/handlers/identifier.handler";
import { NewLineHandler } from "./lexer/handlers/new-line.handler";
import { NumberHandler } from "./lexer/handlers/number.handler";
import { OneLineCommentHandler } from "./lexer/handlers/one-line-comment.handler";
import { SemicolonHandler } from "./lexer/handlers/semicolon.handler";
import { ServiceSymbolsHandler } from "./lexer/handlers/service-symbols.handler";
import { StringHandler } from "./lexer/handlers/string.handler";
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
