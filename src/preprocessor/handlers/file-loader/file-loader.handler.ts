import pathUtil from "path";
import {PreprocessorError} from "../../preprocessor.error";
import {NjsPreprocessorHandler} from "../../types";
import {FileLoaderVisitor} from "./file-loader.visitor";
import {NjsFileLoader} from "./types";

export class File {
    public readonly ext: string;
    public readonly dir: string;
    public readonly marker: string;
    private source: string = "";
    
    constructor(
        public readonly importString: string,
        public readonly path: string
    ) {
        const parsed = pathUtil.parse(path);
        this.ext = parsed.ext;
        this.dir = parsed.dir;
        this.marker = `[PREPROCESSOR]MARKER-(${path})`;
    }
    
    getSource(): string {
        return this.source;
    }
    
    load(source: string) {
        this.source = source;
    }
}

export class FileLoaderHandler implements NjsPreprocessorHandler {
    public static readonly firstPattern = /^(?:\s*import\s+"[.|\/|\w]+"\s*\;\s*)+/g;
    public static readonly secondPattern = /^\s*import\s+"(.+)"\s*\;\s*$/gm;
    public readonly files: Map<string, File> = new Map<string, File>();
    private readonly visitor = new FileLoaderVisitor(this);
    private readonly loaders: NjsFileLoader[] = [];
    
    constructor(...loaders: NjsFileLoader[]) {
        this.loaders.push(...loaders);
    }
    
    readImports(source: string, dir: string = ""): [File[], string, string] {
        const firstMatch = source.match(FileLoaderHandler.firstPattern) ?? [];
        const [imports = ""] = firstMatch;
        const [...second] = imports
            .trim()
            .matchAll(FileLoaderHandler.secondPattern);
        
        const allFiles = second.map(
            ([full, path]) => new File(full, pathUtil.join(dir, path),)
        );
        
        const correctFiles: File[] = [];
        
        let importsWithMarkers = imports;
        
        allFiles.forEach(file => {
            if (this.files.has(file.path)) {
                throw new PreprocessorError(`duplicate import '${file.path}'`);
            } else {
                correctFiles.push(file);
                this.files.set(file.path, file);
                
                importsWithMarkers = importsWithMarkers.replace(file.importString, file.marker);
            }
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
                    
                    file.load(result);
                    transformed = transformed.replace(file.marker, file.getSource());
                    
                    break;
                }
            }
            
            transformed = transformed.replace(file.marker, "");
        }
        
        let result = source;
        
        if (files.length) {
            result = source.replace(imports, transformed);
        }
        
        return result;
    }
}
