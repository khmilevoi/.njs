import pathUtil from "path";
import { Njs } from "language/njs";
import { PreprocessorError } from "../../preprocessor.error";
import { NjsPreprocessorHandler } from "../../types";
import {
  ImportHandlerVisitor,
  ImportHandlerVisitorTarget,
} from "./import-handler.visitor";
import { NjsFileLoader } from "./types";

export class File {
  public readonly ext: string;
  public readonly dir: string;
  public readonly marker: string;

  constructor(
    public readonly importString: string,
    public readonly path: string
  ) {
    const parsed = pathUtil.parse(path);
    this.ext = parsed.ext;
    this.dir = parsed.dir;
    this.marker = `[PREPROCESSOR-${Njs.randomKey()}]-MARKER-(${path})`;
  }
}

// todo: maybe useless, because i want modules
export class ImportHandler
  implements NjsPreprocessorHandler, ImportHandlerVisitorTarget {
  public static readonly firstPattern = /^(?:\s*import\s+".*"\s*;\s*)+/g;
  public static readonly secondPattern = /^\s*import\s+"(.*)"\s*;\s*$/gm;
  public readonly files: Map<string, File> = new Map<string, File>();
  private readonly visitor = new ImportHandlerVisitor(this);
  private readonly loaders: NjsFileLoader[] = [];

  constructor(...loaders: NjsFileLoader[]) {
    this.loaders.push(...loaders);
  }

  readImports(source: string, dir: string = ""): [File[], string, string] {
    const [imports = ""] = source.match(ImportHandler.firstPattern) ?? [];
    const [...second] = imports.trim().matchAll(ImportHandler.secondPattern);

    const correctFiles: File[] = [];

    let importsWithMarkers = imports;

    second.forEach(([full, path]) => {
      const file = new File(full, pathUtil.join(dir, path));

      if (this.files.has(file.path)) {
        throw new PreprocessorError(`duplicate import '${file.path}'`);
      } else {
        correctFiles.push(file);
        this.files.set(file.path, file);

        importsWithMarkers = importsWithMarkers.replace(
          file.importString,
          file.marker
        );
      }

      return file;
    });

    return [correctFiles, importsWithMarkers, imports];
  }

  async transform(source: string, dir: string): Promise<string> {
    const [files, importsWithMarkers, imports] = this.readImports(source, dir);

    let transformed = importsWithMarkers;

    for (const file of files) {
      for (const loader of this.loaders) {
        if (loader.verify(file.ext)) {
          const result = await loader.load(this.visitor, file);

          transformed = transformed.replace(file.marker, result);

          break;
        } else {
          throw new PreprocessorError(
            `can't handle this import (${file.importString
              .trim()
              .replace(/ {2}/g, "")})`
          );
        }
      }
    }

    return source.replace(imports, transformed);
  }
}
