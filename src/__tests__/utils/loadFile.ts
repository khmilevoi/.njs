import * as fs from "fs/promises";
import * as path from "path";

export const loadFile = async (pathToFile: string) => {
  const buffer = await fs.readFile(path.join(__dirname, "../", pathToFile));

  return buffer.toString();
};
