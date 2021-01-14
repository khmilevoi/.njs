import { Njs } from "./language/njs";
import { IdentifierHandler } from "./lexer/handlers/identifier.handler";
import { NumberHandler } from "./lexer/handlers/number.handler";
import { ServiceSymbolsHandler } from "./lexer/handlers/service-symbols.handler";
import { StringHandler } from "./lexer/handlers/string.handler";
import { Lexer } from "./lexer/lexer";
import { Logger } from "./logger/logger";
import { ImportHandler } from "./preprocessor/handlers/file-loader/import.handler";
import { NjsLoader } from "./preprocessor/handlers/file-loader/loaders/njs.loader";
import { Preprocessor } from "./preprocessor/preprocessor";
import { rootPath } from "./rootPath";

export const njs = new Njs(
  new Logger(),
  new Preprocessor(new ImportHandler(new NjsLoader())),
  new Lexer(
    new StringHandler(),
    new IdentifierHandler(),
    new ServiceSymbolsHandler(),
    new NumberHandler()
  )
);

njs.run(`${rootPath}/__tests__/resources/preprocessor/index.njs`);
