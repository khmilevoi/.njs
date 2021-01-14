import { IdentifierHandler } from "../lexer/handlers/identifier.handler";
import { NewLineHandler } from "../lexer/handlers/new-line.handler";
import { NumberHandler } from "../lexer/handlers/number.handler";
import { SemicolonHandler } from "../lexer/handlers/semicolon.handler";
import { ServiceSymbolsHandler } from "../lexer/handlers/service-symbols.handler";
import { StringHandler } from "../lexer/handlers/string.handler";
import { Lexer } from "../lexer/lexer";
import { LexerError } from "../lexer/lexer.error";
import { loadFile } from "./utils/loadFile";

describe("Lexer", () => {
  let source: string = "";

  beforeAll(async () => {
    source = await loadFile("/resources/lexer/index.njs");
  });

  it("should tokenize identifiers", function () {
    const lexer = new Lexer(new IdentifierHandler());

    const tokens = lexer.run(source);

    expect(
      tokens.every((item) => IdentifierHandler.pattern.test(item.inner))
    ).toBeTruthy();
  });
  it("should tokenize semicolon and new line", function () {
    const lexer = new Lexer(new SemicolonHandler(), new NewLineHandler());

    const tokens = lexer.run(source);

    const expectedLength =
      (source.match(/;/g)?.length ?? 0) + (source.match(/\n/g)?.length ?? 0);

    expect(tokens).toHaveLength(expectedLength);
  });

  it("should tokenize semicolon and new line with service symbols", function () {
    const lexer = new Lexer(new ServiceSymbolsHandler());

    const tokens = lexer.run(source);

    expect(tokens).toHaveLength(36);
  });

  it("should tokenize numbers", function () {
    const lexer = new Lexer(new NumberHandler());

    const tokens = lexer.run(source);

    expect(tokens).toHaveLength(6);
  });

  it("should tokenize strings", function () {
    const lexer = new Lexer(new StringHandler());

    const tokens = lexer.run(source);

    expect(tokens).toHaveLength(3);
  });

  it("should catch string error", async function () {
    const source = await loadFile("/resources/lexer/crash.njs");

    const lexer = new Lexer(new StringHandler());

    let error: LexerError | null = null;

    try {
      lexer.run(source);
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
  });

  it("should handle empty string", async function () {
    const lexer = new Lexer(new StringHandler());

    const [result] = lexer.run('string a = ""');

    expect(result.inner).toBe("");
  });

  it("should tokenize correctly", function () {
    const lexer = new Lexer(
      new StringHandler(),
      new IdentifierHandler(),
      new ServiceSymbolsHandler(),
      new NumberHandler()
    );

    const tokens = lexer.run(source);

    const result = tokens
      .map((token) => token.toString())
      .join("")
      .replace(/\s/g, "");
    const expected = source.replace(/\/\/.*/g, "").replace(/(\\r)|(\s)/g, "");

    expect(result).toBe(expected);
  });
});
