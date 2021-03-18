import "./foo.njs";
import "./foo1.njs";
import "./foo2.njs";
import "./bar/foo3.njs";

class A {
    number a;
}

number CONSTANT = 10;

number main() { // comment with "string"
    // "string" with second comment
    A a = new A;
    a.a = CONSTANT;

    number b = 2.5;

    number c = a.a + CONSTANT / 2;

    string str = "123" + "456";

    return 0;
}
