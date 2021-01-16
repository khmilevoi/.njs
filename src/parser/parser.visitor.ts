import { NjsToken } from "lexer/types";
import { NjsVisitor } from "shared/visitor.shared";

export class ParserVisitor extends NjsVisitor<NjsToken<any>> {}
