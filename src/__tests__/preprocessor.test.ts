import { Preprocessor } from "preprocessor";
import { loadFile } from "./utils/loadFile";

describe("Preprocessor", () => {
  let source: string = "";

  beforeAll(async () => {
    source = await loadFile("./resources/concept.njs");
  });

  it("should have a test", () => {
    expect(1).toBe(1);
  });
});
