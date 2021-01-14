import { File } from "./import.handler";
import { FileLoaderVisitor } from "./file-loader.visitor";

export interface NjsFileLoader {
  verify(ext: string): boolean;

  load(visitor: FileLoaderVisitor, file: File): Promise<string>;
}
