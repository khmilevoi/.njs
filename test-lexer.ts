import fs from "fs";
import { Lexer } from "./src/lexer/lexer";
import { StringHandler } from "./src/lexer/handlers/string.handler";
import { IdentifierHandler } from "./src/lexer/handlers/identifier.handler";
import { ServiceSymbolsHandler } from "./src/lexer/handlers/service-symbols.handler";
import { NumberHandler } from "./src/lexer/handlers/number.handler";

const lexer = new Lexer(
  new StringHandler(),
  new IdentifierHandler(),
  new ServiceSymbolsHandler(),
  new NumberHandler(),
);

const tokens = lexer.run(fs.readFileSync("src/__tests__/resources/factorial-loop.njs", "utf-8"));
console.log(tokens);
