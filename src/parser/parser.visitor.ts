import { NjsToken } from "lexer/types";
import { NjsTarget, NjsVisitor } from "shared/visitor.shared";

export interface ParserTarget extends NjsTarget<NjsToken<any>> {
  save(): void;
  discard(): void;
}

export class ParserVisitor extends NjsVisitor<NjsToken<any>> {
  constructor(private readonly parserInstance: ParserTarget) {
    super(parserInstance);
  }

  save() {
    this.parserInstance.save();
  }

  discard() {
    this.parserInstance.discard();
  }
}
