import { Njs } from "./language/njs";
import { Lexer } from "./lexer/lexer";
import { OneLineCommentHandler } from "./lexer/tokens/one-line-comment.handler";
import { StringHandler } from "./lexer/tokens/string.handler";
import { Logger } from "./logger/logger";

export const njs = new Njs(
  new Logger(),
  new Lexer(new StringHandler('"'), new OneLineCommentHandler("//", "\n"))
);
