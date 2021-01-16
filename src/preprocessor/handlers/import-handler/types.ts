import { File } from "./import.handler";
import { ImportHandlerVisitor } from "./import-handler.visitor";

export interface NjsFileLoader {
  verify(ext: string): boolean;

  load(visitor: ImportHandlerVisitor, file: File): Promise<string>;
}
