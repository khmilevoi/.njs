import * as path from "path";
import {Njs} from "../../language/njs";

export const loadFile = (pathToFile: string) => {
    return Njs.loadFile(path.join(__dirname, "../", pathToFile));
};
