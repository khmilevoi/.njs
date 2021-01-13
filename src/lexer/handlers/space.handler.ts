import {NjsVisitor} from "../../shared/visitor.shared";
import {NjsBaseHandler, NjsLexerHandlerLexemeDescriptor} from "../types";

export class SpaceHandler extends NjsBaseHandler<never> {
    public static readonly pattern = / /;
    
    read(visitor: NjsVisitor): NjsLexerHandlerLexemeDescriptor<never> {
        while (SpaceHandler.pattern.test(visitor.peep())) {
            visitor.pop();
        }
        
        return {};
    }
}
