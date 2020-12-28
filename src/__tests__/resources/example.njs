import "./foo.njs";

class A {
    int a;
}

int CONSTANT = 10;

int main() { // comment with "string"
    // "string" with second comment
    A a = new A;
    a.a = CONSTANT;

    double b = 2.5;

    int c = a.a + CONSTANT / 2;

    string str = "123" + "456";

    return 0;
}
