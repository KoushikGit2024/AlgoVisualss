import type { EngineContext } from "../EngineContext";

export function handleStringMethod(
  method: string,
  args: any[],
  s: string,
  _ctx: EngineContext,
): { handled: boolean; result?: any; newStr?: string } {
  let result: any = undefined;
  let newStr: string | undefined = undefined;

  switch (method) {
    case "size":
    case "length":
      result = s.length;
      break;
    case "empty":
      result = s.length === 0;
      break;
    case "at":
      result = s[args[0] as number] ?? "";
      break;
    case "front":
      result = s[0] ?? "";
      break;
    case "back":
      result = s[s.length - 1] ?? "";
      break;
    case "c_str":
      result = s;
      break;
    case "substr":
      result =
        args[1] !== undefined
          ? s.substring(args[0] as number, (args[0] as number) + (args[1] as number))
          : s.substring(args[0] as number);
      break;
    case "find":
      result = s.indexOf(String(args[0] ?? ""), (args[1] as number) ?? 0);
      break;
    case "rfind":
      result = s.lastIndexOf(String(args[0] ?? ""));
      break;
    case "compare":
      result = s === String(args[0] ?? "") ? 0 : s < String(args[0] ?? "") ? -1 : 1;
      break;
    case "starts_with":
      result = s.startsWith(String(args[0] ?? ""));
      break;
    case "ends_with":
      result = s.endsWith(String(args[0] ?? ""));
      break;
    case "contains":
      result = s.includes(String(args[0] ?? ""));
      break;
    case "count":
      result = (s.match(new RegExp(String(args[0] ?? ""), "g")) || []).length;
      break;
    case "begin":
      result = 0;
      break;
    case "end":
      result = s.length;
      break;
    case "append":
    case "push_back":
      newStr = s + String(args[0] ?? "");
      break;
    case "pop_back":
      newStr = s.slice(0, -1);
      break;
    case "insert":
      newStr = s.slice(0, args[0] as number) + String(args[1] ?? "") + s.slice(args[0] as number);
      break;
    case "erase": {
      const pos = (args[0] as number) ?? 0;
      const n = (args[1] as number) ?? s.length - pos;
      newStr = s.slice(0, pos) + s.slice(pos + n);
      break;
    }
    case "replace": {
      const rp = (args[0] as number) ?? 0;
      const rn = (args[1] as number) ?? 0;
      newStr = s.slice(0, rp) + String(args[2] ?? "") + s.slice(rp + rn);
      break;
    }
    case "clear":
      newStr = "";
      break;
    case "resize":
      newStr = s.substring(0, args[0] as number).padEnd(args[0] as number, String(args[1] ?? "\0"));
      break;
    case "tolower":
    case "lower":
      newStr = s.toLowerCase();
      break;
    case "toupper":
    case "upper":
      newStr = s.toUpperCase();
      break;
    case "to_string":
      result = s;
      break;
    default:
      return { handled: false };
  }

  return { handled: true, result, newStr };
}
