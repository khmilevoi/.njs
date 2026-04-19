import { Njs } from "./src/language/njs";
import { Logger } from "./src/logger/logger";
import { Lexer } from "./src/lexer/lexer";
import { StringHandler } from "./src/lexer/handlers/string.handler";
import { IdentifierHandler } from "./src/lexer/handlers/identifier.handler";
import { ServiceSymbolsHandler } from "./src/lexer/handlers/service-symbols.handler";
import { NumberHandler } from "./src/lexer/handlers/number.handler";
import { SpaceHandler } from "./src/lexer/handlers/space.handler";
import { NewLineHandler } from "./src/lexer/handlers/new-line.handler";
import { Parser } from "./src/parser";
import { Executor } from "./src/executor";
import fs from "fs";
import { njs } from "./src/index";

// Will run tests using npx tsx directly
