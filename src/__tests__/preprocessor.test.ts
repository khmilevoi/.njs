import { Preprocessor } from "preprocessor";
import { loadFile } from "./utils/loadFile";

describe("Preprocessor", () => {
  let source: string = "";

  beforeAll(async () => {
    source = await loadFile("./resources/preprocessor/index.njs");
  });
});
