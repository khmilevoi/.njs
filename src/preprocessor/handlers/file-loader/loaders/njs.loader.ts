import {File} from "../file-loader.handler";
import {FileLoaderVisitor} from "../file-loader.visitor";
import {NjsFileLoader} from "../types";

export class NjsLoader implements NjsFileLoader {
    public static extension = ".njs";
    
    async load(visitor: FileLoaderVisitor, file: File): Promise<string> {
        const source = await visitor.loadFile(file.path);
        
        return visitor.transform(source, file.dir);
    }
    
    verify(ext: string): boolean {
        return ext === NjsLoader.extension;
    }
    
}
