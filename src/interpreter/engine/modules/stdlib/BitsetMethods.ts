export function handleBitsetMethod(
  method: string,
  args: any[],
  bitset: { __type: string; data: string },
): { handled: boolean; result?: any } {
  let result: any = undefined;
  let str = bitset.data || "";

  switch (method) {
    case "set":
      if (args.length === 1) {
        const pos = Number(args[0]);
        if (pos >= 0 && pos < str.length) {
          const revPos = str.length - 1 - pos;
          str = str.substring(0, revPos) + "1" + str.substring(revPos + 1);
        }
      } else {
        str = "1".repeat(str.length);
      }
      bitset.data = str;
      break;
    case "reset":
      if (args.length === 1) {
        const pos = Number(args[0]);
        if (pos >= 0 && pos < str.length) {
          const revPos = str.length - 1 - pos;
          str = str.substring(0, revPos) + "0" + str.substring(revPos + 1);
        }
      } else {
        str = "0".repeat(str.length);
      }
      bitset.data = str;
      break;
    case "flip":
      if (args.length === 1) {
        const pos = Number(args[0]);
        if (pos >= 0 && pos < str.length) {
          const revPos = str.length - 1 - pos;
          const toggled = str[revPos] === "1" ? "0" : "1";
          str = str.substring(0, revPos) + toggled + str.substring(revPos + 1);
        }
      } else {
        str = Array.from(str)
          .map((c) => (c === "1" ? "0" : "1"))
          .join("");
      }
      bitset.data = str;
      break;
    case "test":
      if (args.length === 1) {
        const pos = Number(args[0]);
        if (pos >= 0 && pos < str.length) {
          const revPos = str.length - 1 - pos;
          result = str[revPos] === "1";
        } else {
          result = false;
        }
      }
      break;
    case "count":
      result = Array.from(str).filter((c) => c === "1").length;
      break;
    case "size":
      result = str.length;
      break;
    case "any":
      result = str.includes("1");
      break;
    case "none":
      result = !str.includes("1");
      break;
    case "all":
      result = str.length > 0 && !str.includes("0");
      break;
    case "to_string":
      result = str;
      break;
    default:
      return { handled: false };
  }
  return { handled: true, result };
}
