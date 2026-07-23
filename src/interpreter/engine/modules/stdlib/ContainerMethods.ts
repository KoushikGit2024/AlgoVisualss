import { cloneRuntimeValue } from "../../../utils/helpers";

export function handleSetMethod(method: string, args: any[], s: Set<any>): { handled: boolean; result?: any } {
  let result: any = undefined;
  switch (method) {
    case "insert":
      s.add(args[0]);
      result = args[0];
      break;
    case "erase":
    case "remove":
      result = s.delete(args[0]);
      break;
    case "count":
    case "contains":
      result = s.has(args[0]) ? 1 : 0;
      break;
    case "find":
      result = s.has(args[0]) ? args[0] : null;
      break;
    case "size":
    case "length":
      result = s.size;
      break;
    case "empty":
      result = s.size === 0;
      break;
    case "clear":
      s.clear();
      break;
    case "begin":
      result = 0;
      break;
    case "end":
      result = null;
      break;
    default:
      return { handled: false };
  }
  return { handled: true, result };
}

export function handleMapMethod(method: string, args: any[], m: Map<any, any>): { handled: boolean; result?: any } {
  let result: any = undefined;
  switch (method) {
    case "insert":
      if (Array.isArray(args[0])) m.set(args[0][0], args[0][1]);
      else if (args.length >= 2) m.set(args[0], args[1]);
      break;
    case "emplace":
      m.set(args[0], args[1]);
      break;
    case "erase":
    case "remove":
      result = m.delete(args[0]);
      break;
    case "count":
    case "contains":
      result = m.has(args[0]) ? 1 : 0;
      break;
    case "find":
      result = m.has(args[0]) ? { first: args[0], second: m.get(args[0]) } : null;
      break;
    case "at":
      result = m.get(args[0]);
      break;
    case "size":
    case "length":
      result = m.size;
      break;
    case "empty":
      result = m.size === 0;
      break;
    case "clear":
      m.clear();
      break;
    case "begin":
      result = 0;
      break;
    case "end":
      result = null;
      break;
    default:
      return { handled: false };
  }
  return { handled: true, result };
}

export function handleArrayMethod(
  method: string,
  args: any[],
  targetArr: any[],
  objInstance: any,
  isArr: boolean,
): { handled: boolean; result?: any } {
  let result: any = undefined;
  switch (method) {
    case "size":
    case "length":
      result = targetArr.length;
      break;
    case "empty":
      result = targetArr.length === 0;
      break;
    case "push_back":
    case "push":
      targetArr.push(cloneRuntimeValue(args[0]));
      result = args[0];
      break;
    case "push_front":
      targetArr.unshift(cloneRuntimeValue(args[0]));
      result = args[0];
      break;
    case "pop_back":
    case "pop":
      result = targetArr.pop();
      break;
    case "pop_front":
      result = targetArr.shift();
      break;
    case "front":
      result = targetArr[0];
      break;
    case "back":
    case "top":
      result = targetArr[targetArr.length - 1];
      break;
    case "at":
      result = targetArr[args[0] as number];
      break;
    case "find":
    case "search":
      result = targetArr.indexOf(args[0]);
      break;
    case "contains":
      result = targetArr.includes(args[0]);
      break;
    case "begin":
      result = {
        __isListIter: true,
        __iterValue: targetArr[0],
        valueOf() {
          return 0;
        },
        toString() {
          return String(this.__iterValue);
        },
      };
      break;
    case "end":
      result = {
        __isListIter: true,
        __iterValue: undefined,
        valueOf() {
          return targetArr.length;
        },
        toString() {
          return "undefined";
        },
      };
      break;
    case "insert":
      if (args.length === 1) targetArr.push(cloneRuntimeValue(args[0]));
      else if (
        typeof args[0] === "number" ||
        (args[0] && typeof args[0] === "object" && (args[0] as any).__isListIter)
      ) {
        const pos = Number(args[0]);
        targetArr.splice(pos, 0, cloneRuntimeValue(args[1]));
      }
      break;
    case "erase": {
      if (args[0] && typeof args[0] === "object" && (args[0] as any).__isListIter) {
        const idx = targetArr.indexOf((args[0] as any).__iterValue);
        if (idx !== -1) {
          targetArr.splice(idx, 1);
          result = true;
          break;
        }
      }
      const num = Number(args[0]);
      if (!isNaN(num) && num >= 0 && num < targetArr.length) {
        targetArr.splice(num, 1);
        result = true;
      } else {
        const ri = targetArr.indexOf(args[0]);
        if (ri !== -1) {
          targetArr.splice(ri, 1);
          result = true;
        } else result = false;
      }
      break;
    }
    case "remove": {
      const ri = targetArr.indexOf(args[0]);
      if (ri !== -1) {
        targetArr.splice(ri, 1);
        result = true;
      } else result = false;
      break;
    }
    case "clear":
      if (isArr) (objInstance as any[]).length = 0;
      else (objInstance as any).data = [];
      break;
    case "resize": {
      const newSize = args[0] as number;
      const fill = args[1] ?? 0;
      while (targetArr.length < newSize) targetArr.push(fill);
      while (targetArr.length > newSize) targetArr.pop();
      break;
    }
    case "assign":
      targetArr.fill(args[1], 0, args[0] as number);
      break;
    case "swap": {
      const other = Array.isArray(args[0]) ? args[0] : (args[0] as any)?.data;
      if (other) {
        const tmp = [...targetArr];
        targetArr.splice(0, targetArr.length, ...other);
        other.splice(0, other.length, ...tmp);
      }
      break;
    }
    case "print":
      result = `[${targetArr.join(" -> ")}]`;
      break;
    default:
      return { handled: false };
  }
  return { handled: true, result };
}
