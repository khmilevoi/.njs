import "./foo.njs";

class A {
    a: number;
}

CONSTANT: number = 10;

main(): number { // comment with "string"
    // "string" with second comment
    a = new A();
    a.a = CONSTANT;

    b: number = 2.5;

    c = a.a + CONSTANT / 2;

    str: string = "123" + "456";

    return 0;
}
