import { Lexer } from "../lexer/lexer";
import { IdentifierHandler } from "../lexer/tokens/identifier.handler";
import { NewLineHandler } from "../lexer/tokens/new-line.handler";
import { OneLineCommentHandler } from "../lexer/tokens/one-line-comment.handler";
import { SemicolonHandler } from "../lexer/tokens/semicolon.handler";
import { ServiceSymbolsHandler } from "../lexer/tokens/service-symbols.handler";
import { StringHandler } from "../lexer/tokens/string.handler";
import { loadFile } from "./utils/loadFile";

describe("Lexer", () => {
  let source: string = "";

  beforeAll(async () => {
    source = await loadFile("/resources/example.njs");
  });

  it("should tokenize string", function () {
    const lexer = new Lexer(new StringHandler('"'));

    const tokens = lexer.run(source);

    expect(tokens.length).toBe(5);
  });

  it("should tokenize one line comments", function () {
    const lexer = new Lexer(new OneLineCommentHandler("//"));

    const tokens = lexer.run(source);

    expect(tokens.length).toBe(2);
  });

  it("should tokenize string with one line comments", function () {
    const lexer = new Lexer(
      new StringHandler('"'),
      new OneLineCommentHandler("//")
    );

    const tokens = lexer.run(source);

    expect(tokens.filter((item) => item.type === "string").length).toBe(3);
    expect(
      tokens.filter((item) => item.type === "one-line-comment").length
    ).toBe(2);
  });

  it("should tokenize identifiers", function () {
    const lexer = new Lexer(
      new StringHandler('"'),
      new OneLineCommentHandler("//"),
      new IdentifierHandler()
    );

    const tokens = lexer.run(source);

    expect(tokens.filter((item) => item.type === "identifier").length).toBe(26);
  });

  it("should tokenize semicolon and new line", function () {
    const lexer = new Lexer(new SemicolonHandler(), new NewLineHandler());

    const tokens = lexer.run(source);

    expect(tokens.filter((item) => item.type === "semicolon").length).toBe(9);
    expect(tokens.filter((item) => item.type === "new-line").length).toBe(21);
  });

  it("should tokenize semicolon and new line with service symbols", function () {
    const lexer = new Lexer(
      new StringHandler('"'),
      new OneLineCommentHandler("//"),
      new IdentifierHandler(),
      new SemicolonHandler(),
      new NewLineHandler(),
      new ServiceSymbolsHandler()
    );

    const tokens = lexer.run(source);

    expect(tokens.filter((item) => item.type === "service-symbol").length).toBe(
      21
    );
  });
});
