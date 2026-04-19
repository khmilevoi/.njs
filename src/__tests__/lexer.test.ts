import { IdentifierHandler } from "lexer/handlers/identifier.handler";
import { NewLineHandler } from "lexer/handlers/new-line.handler";
import { NumberHandler } from "lexer/handlers/number.handler";
import { SemicolonHandler } from "lexer/handlers/semicolon.handler";
import { ServiceSymbolsHandler } from "lexer/handlers/service-symbols.handler";
import { StringHandler } from "lexer/handlers/string.handler";
import { Lexer } from "lexer/lexer";
import { LexerError } from "lexer/lexer.error";
import { loadFile } from "./utils/loadFile";

describe("Lexer", () => {
  let source: string = "";

  beforeAll(async () => {
    source = await loadFile("/resources/lexer/index.njs");
  });

  it("should tokenize identifiers", function () {
    const lexer = new Lexer(new IdentifierHandler());

    const tokens = lexer.run(source);

    expect(tokens.every((item) => IdentifierHandler.pattern.test(item.inner))).toBeTruthy();
  });
  it("should tokenize semicolon and new line", function () {
    const lexer = new Lexer(new SemicolonHandler(), new NewLineHandler());

    const tokens = lexer.run(source);

    const expectedLength = source.match(/;/g)?.length ?? 0;

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

    const lexer = new Lexer(new StringHandler(), new NewLineHandler());

    let error: LexerError | null = null;

    try {
      lexer.run(source);
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
    expect(error?.line).toBe(18);
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
      new NumberHandler(),
    );

    const tokens = lexer.run(source);

    const result = tokens
      .map((token) => token.toString())
      .join("")
      .replace(/\s/g, "");
    const expected = source.replace(/\/\/.*/g, "").replace(/(\\r)|(\s)/g, "");

    expect(result).toBe(expected);
  });

  it("should skip unknown characters", function () {
    const lexer = new Lexer(new IdentifierHandler(), new NumberHandler());
    const tokens = lexer.run("abc ^ 123 % def");

    expect(tokens).toHaveLength(3);
    expect(tokens[0].type).toBe("identifier");
    expect(tokens[0].inner).toBe("abc");
    expect(tokens[1].type).toBe("number");
    expect(tokens[1].inner).toBe(123);
    expect(tokens[2].type).toBe("identifier");
    expect(tokens[2].inner).toBe("def");
  });

  it("should handle invalid numbers gracefully", function () {
    const lexer = new Lexer(new NumberHandler(), new IdentifierHandler());
    const tokens = lexer.run("123.456.789");

    expect(Array.isArray(tokens)).toBeTruthy();
  });

  it("should return empty object on reverted identifier", function () {
    const handler = new IdentifierHandler();
    const lexer = new Lexer(handler);
    const tokens = lexer.run("123");

    expect(tokens).toHaveLength(0);
  });

  it("should handle mixed expressions correctly", function () {
    const lexer = new Lexer(
      new NumberHandler(),
      new IdentifierHandler(),
      new StringHandler(),
      new SemicolonHandler(),
      new ServiceSymbolsHandler(),
      new NewLineHandler(),
    );
    const tokens = lexer.run(`let a = 123;\n// a comment\n"hello"`);

    expect(tokens).toHaveLength(6);
    expect(tokens[0].type).toBe("identifier");
    expect(tokens[0].inner).toBe("let");
    expect(tokens[1].type).toBe("identifier");
    expect(tokens[1].inner).toBe("a");
    expect(tokens[2].type).toBe("service-symbol");
    expect(tokens[2].inner).toBe("=");
    expect(tokens[3].type).toBe("number");
    expect(tokens[3].inner).toBe(123);
    expect(tokens[4].type).toBe("semicolon");
    expect(tokens[5].type).toBe("string");
    expect(tokens[5].inner).toBe("hello");
  });

  it("should accurately track line numbers", function () {
    const lexer = new Lexer(new NewLineHandler(), new StringHandler());
    lexer.run(`\n\n\n`);
    expect(lexer.getLine()).toBe(4);

    const lexer2 = new Lexer(new NewLineHandler(), new StringHandler());
    let error: LexerError | null = null;
    try {
      lexer2.run(`\n\n"unclosed string`);
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
    expect(error?.line).toBe(3);
  });
});
