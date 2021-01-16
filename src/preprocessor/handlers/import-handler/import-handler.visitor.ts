import { Njs } from "language/njs";
import { File } from "./import.handler";

export interface ImportHandlerVisitorTarget {
  files: Map<string, File>;

  transform(source: string, dir: string): Promise<string>;
}

export class ImportHandlerVisitor {
  constructor(private readonly instance: ImportHandlerVisitorTarget) {}

  transform(source: string, dir: string): Promise<string> {
    return this.instance.transform(source, dir);
  }

  async loadFile(path: string) {
    return Njs.loadFile(path);
  }
}
