import type { EvalResult } from "../../types";

export class StreamFormatter {
  /**
   * Formats a primitive EvalResult for output to cout.
   * Preserves standard C++ I/O formatting rules (e.g., char prints as text).
   */
  public static format(res: EvalResult): string {
    const rawValue = res.value;

    if (rawValue === null || rawValue === undefined) {
      return "";
    }

    if (res.type === "char") {
      if (typeof rawValue === "number") {
        return String.fromCharCode(rawValue);
      }
      return String(rawValue);
    }

    if (res.type === "bool") {
      return rawValue ? "1" : "0"; // Note: std::boolalpha requires "true"/"false", but default is 1/0
    }

    return String(rawValue);
  }
}
