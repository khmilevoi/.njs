import { Njs } from "./language/njs";
import { IdentifierHandler } from "./lexer/handlers/identifier.handler";
import { NumberHandler } from "./lexer/handlers/number.handler";
import { ServiceSymbolsHandler } from "./lexer/handlers/service-symbols.handler";
import { StringHandler } from "./lexer/handlers/string.handler";
import { Lexer } from "./lexer/lexer";
import { Logger } from "./logger/logger";

export const njs = new Njs(
  new Logger(),
  new Lexer(
    new StringHandler(),
    new IdentifierHandler(),
    new ServiceSymbolsHandler(),
    new NumberHandler()
  )
);
