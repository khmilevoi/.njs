export interface NjsVisitorTarget {
    peep(): string;
    
    pop(): string;
    
    revert(amount?: number): void;
}

export class NjsVisitor {
    constructor(private readonly instance: NjsVisitorTarget) {
    }
    
    peep() {
        return this.instance.peep();
    }
    
    pop() {
        return this.instance.pop();
    }
    
    revert(amount?: number) {
        return this.instance.revert(amount);
    }
}
