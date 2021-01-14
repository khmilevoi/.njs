import { Njs } from "../../../language/njs";
import { File } from "./import.handler";

interface FileLoaderVisitorTarget {
  files: Map<string, File>;

  transform(source: string, dir: string): Promise<string>;
}

export class FileLoaderVisitor {
  constructor(private readonly instance: FileLoaderVisitorTarget) {}

  transform(source: string, dir: string): Promise<string> {
    return this.instance.transform(source, dir);
  }

  async loadFile(path: string) {
    return Njs.loadFile(path);
  }
}
