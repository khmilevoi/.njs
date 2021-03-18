import { NjsToken } from "lexer/types";
import { NjsTarget, NjsVisitor } from "shared/visitor.shared";

export interface ParserTarget extends NjsTarget<NjsToken<any>> {
  save(): void;
}

export class ParserVisitor extends NjsVisitor<NjsToken<any>> {
  constructor(instance: ParserTarget) {
    super(instance);
  }
}
