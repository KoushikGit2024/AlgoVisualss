import type { CppType, EvalResult } from "../../types";

export class TypeConversion {
  /**
   * Converts a given EvalResult into the specified target type.
   * This is used for assignment, explicit casts, and argument passing.
   */
  public static convert(res: EvalResult, targetType: CppType): EvalResult {
    const rawValue = res.value;

    if (targetType === "char") {
      let charCode = 0;
      if (typeof rawValue === "number") {
        charCode = Math.trunc(rawValue);
      } else if (typeof rawValue === "string" && rawValue.length > 0) {
        charCode = rawValue.charCodeAt(0);
      } else if (typeof rawValue === "boolean") {
        charCode = rawValue ? 1 : 0;
      }
      return { type: "char", value: charCode };
    }

    if (targetType === "string" || targetType === "std::string") {
      if (res.type === "char" && typeof rawValue === "number") {
        return { type: "string", value: String.fromCharCode(rawValue) };
      }
      return { type: "string", value: String(rawValue ?? "") };
    }

    if (this.isIntegral(targetType)) {
      let intVal = 0;
      if (typeof rawValue === "number") intVal = Math.trunc(rawValue);
      else if (typeof rawValue === "boolean") intVal = rawValue ? 1 : 0;
      else if (typeof rawValue === "string" && rawValue.length === 1)
        intVal = rawValue.charCodeAt(0);
      else if (typeof rawValue === "string") intVal = parseInt(rawValue, 10) || 0;
      return { type: targetType, value: intVal };
    }

    if (targetType === "float" || targetType === "double") {
      let numVal = 0;
      if (typeof rawValue === "number") numVal = rawValue;
      else if (typeof rawValue === "boolean") numVal = rawValue ? 1 : 0;
      else if (typeof rawValue === "string" && rawValue.length === 1)
        numVal = rawValue.charCodeAt(0);
      else if (typeof rawValue === "string") numVal = parseFloat(rawValue) || 0;
      return { type: targetType, value: numVal };
    }

    if (targetType === "bool") {
      return { type: "bool", value: Boolean(rawValue) };
    }

    // Default fallback
    return { type: targetType, value: rawValue };
  }

  /**
   * Performs standard C++ arithmetic promotion on two EvalResults.
   * Promotes chars/shorts to int, and returns the result type and primitive numbers.
   */
  public static promote(
    left: EvalResult,
    right: EvalResult,
  ): { resultType: CppType; leftVal: number; rightVal: number } {
    let resultType: CppType = "int";

    const leftIsFloat = left.type === "float" || left.type === "double";
    const rightIsFloat = right.type === "float" || right.type === "double";

    if (leftIsFloat || rightIsFloat) {
      resultType = "double";
    }

    const lVal = this.getNumericValue(left);
    const rVal = this.getNumericValue(right);

    return { resultType, leftVal: lVal, rightVal: rVal };
  }

  public static getNumericValue(res: EvalResult): number {
    if (typeof res.value === "number") return res.value;
    if (typeof res.value === "boolean") return res.value ? 1 : 0;
    if (res.type === "char" && typeof res.value === "string") return res.value.charCodeAt(0);
    return Number(res.value) || 0;
  }

  public static isNumeric(type: CppType): boolean {
    return this.isIntegral(type) || type === "float" || type === "double";
  }

  public static isIntegral(type: CppType): boolean {
    return [
      "int",
      "short",
      "long",
      "long long",
      "unsigned int",
      "unsigned short",
      "unsigned long",
      "unsigned long long",
      "char",
      "bool",
    ].includes(type);
  }

  public static isCharacter(type: CppType): boolean {
    return type === "char";
  }
}
