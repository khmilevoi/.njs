import { njs } from "index";
import { Parser } from "parser";
import { Preprocessor } from "preprocessor";
import { loadFile } from "./utils/loadFile";

describe("Preprocessor", () => {
  let source: string = "";

  beforeAll(async () => {
    source = await loadFile("./resources/preprocessor/index.njs");
  });

  it("should", async function () {
    const tokens = njs.tokenize("foo: number = 100");

    const parser = new Parser();

    const result = parser.parse(tokens);

    debugger;
  });
});
