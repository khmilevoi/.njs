import fs from "fs/promises";
import path from "path";
import {NjsLexer} from "../lexer/types";
import {NjsLogger} from "../logger/types";
import {NjsPreprocessor} from "../preprocessor/types";

export class Njs {
    constructor(
        private readonly logger: NjsLogger,
        private readonly preprocessor: NjsPreprocessor,
        private readonly lexer: NjsLexer
    ) {
    }
    
    static async loadFile(pathToFile: string) {
        const buffer = await fs.readFile(path.join(pathToFile));
        
        return buffer.toString();
    }
    
    preprocessing(source: string) {
        // return this.preprocessor.run(source);
    }
    
    tokenize(source: string) {
        return this.lexer.run(source);
    }
    
    async run(pathToFile: string) {
        try {
            this.logger.log("start");
            
            const source = await Njs.loadFile(pathToFile);
            
            const parsedPath = path.parse(pathToFile);
            
            const tokens = this.tokenize(source);
            // const ast = this.parser.run(tokens);
            // const result = this.interpreter.run(ast);
            
            //  return result;
        } catch (error) {
            this.logger.handle(error);
        }
    }
}
