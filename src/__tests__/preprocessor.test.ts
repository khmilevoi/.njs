import {FileLoaderHandler} from "../preprocessor/handlers/file-loader/file-loader.handler";
import {NjsLoader} from "../preprocessor/handlers/file-loader/loaders/njs.loader";
import {Preprocessor} from "../preprocessor/preprocessor";
import {PreprocessorError} from "../preprocessor/preprocessor.error";
import {rootPath} from "../rootPath";
import {loadFile} from "./utils/loadFile";

describe("Preprocessor", () => {
    let source: string = "";
    
    beforeAll(async () => {
        source = await loadFile("./resources/preprocessor/index.njs");
    });
    
    it("should read imports", async function () {
        const stress = await loadFile("/resources/preprocessor/stress.njs");
        
        const fileLoaderHandler = new FileLoaderHandler();
        
        const [result] = fileLoaderHandler.readImports(stress);
        
        expect(result).toHaveLength(6);
        expect(result.every((item, index) => item.path.includes(`/foo${index}.njs`)));
    });
    
    it("should catch exception duplicate imports", async function () {
        const stress = await loadFile("/resources/preprocessor/stress.njs");
        
        const fileLoaderHandler = new FileLoaderHandler();
        
        let error: PreprocessorError | null = null;
        
        try {
            fileLoaderHandler.readImports("import \"./foo4.njs\";" + stress);
        } catch (e) {
            error = e;
        }
        
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(PreprocessorError);
    });
    
    it("should handle njs imports", async function () {
        const preprocessor = new Preprocessor(new FileLoaderHandler(new NjsLoader()));
        
        const result = await preprocessor.run(source, `${rootPath}/__tests__/resources/preprocessor/`);
        
        for (let foo = 0; foo < 7; ++foo) {
            expect(result.includes(`string foo${foo || ""} = "foo${foo || ""}"`)).toBeTruthy();
        }
    });
    
    it("should catch loop exception", async function () {
        const source = await loadFile("/resources/preprocessor/loop.njs");
        
        const preprocessor = new Preprocessor(new FileLoaderHandler(new NjsLoader()));
        
        let error: PreprocessorError | null = null;
        
        try {
            
            await preprocessor.run(source, `${rootPath}/__tests__/resources/preprocessor/`);
        } catch (e) {
            error = e;
        }
        
        expect(error).not.toBeNull();
        
        debugger
    });
});
