type Sum = <T extends number | undefined>(
  num?: T
) => T extends undefined ? number : Sum;

export const sum = (() => {
  let total = 0;

  const f: Sum = (num): ReturnType<Sum> => {
    if (num === undefined) {
      const result = total;
      total = 0;
      debugger;
      return result;
    }

    total += num;

    return f;
  };

  return f;
})();

console.log(sum(1)(2)(3)());
