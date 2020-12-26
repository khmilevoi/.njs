import { sum } from "../index";

describe("test", function () {
  it("should test", function () {
    expect(sum(5)(5)(2)()).toBe(12);
    expect(sum(5)(5)(5)()).toBe(15);
  });
});
