import { useMemo } from "react";
import { deepUnwrap } from "../detectVisualizer";

export function useVariableParser(currentSnapshot: any) {
  const rawVars = currentSnapshot?.state?.variables || {};
  const currentEvent = currentSnapshot?.event || { type: "IDLE", payload: {} };
  const activeFunction =
    currentSnapshot?.state?.callStack?.[currentSnapshot.state.callStack.length - 1] || "global";

  const vars = useMemo(() => {
    const clean: Record<string, any> = {};
    for (const [key, variable] of Object.entries(rawVars)) {
      clean[key] = { ...(variable as any), value: deepUnwrap((variable as any).value) };
    }
    return clean;
  }, [rawVars]);

  const overviewVars = useMemo(() => {
    const result: any[] = [];
    Object.entries(vars).forEach(([name, data]: [string, any]) => {
      const val = data.value;
      const isTarget = currentEvent.payload?.variable === name;
      let opStyle = "text-text";

      if (isTarget) {
        if (currentEvent.type === "WRITE")
          opStyle = "bg-success/20 text-success border-success/30 font-bold";
        else if (currentEvent.type === "READ")
          opStyle = "bg-accent/20 text-accent border-accent/30 font-bold";
      }

      const formatVariableValue = (v: any): string => {
        if (v === null) return "null";
        if (v === undefined) return "undefined";
        if (typeof v === "string") return v;
        if (Array.isArray(v)) {
          return "[" + v.map((item) => formatVariableValue(item)).join(", ") + "]";
        }
        if (typeof v === "object") {
          if (v.__type === "container" && Array.isArray(v.data)) {
            return "[" + v.data.map((item: any) => formatVariableValue(item)).join(", ") + "]";
          }
          let typeName = v.__type || "";
          let props: string[] = [];
          for (let [k, propVal] of Object.entries(v)) {
            if (k.startsWith("__")) continue;
            if (typeof propVal === "string" && propVal.startsWith("&")) continue;
            if (propVal === null && (k === "left" || k === "right" || k === "next")) continue;
            props.push(k + ": " + formatVariableValue(propVal));
          }
          let content = props.length > 0 ? "{ " + props.join(", ") + " }" : "{}";
          return typeName ? typeName + " " + content : content;
        }
        return String(v);
      };

      let displayValue = formatVariableValue(val);

      result.push({
        id: name,
        type: data.type,
        name,
        value: displayValue,
        opStyle,
        func: activeFunction,
      });
    });
    return result;
  }, [vars, currentEvent, activeFunction]);

  return { vars, overviewVars, currentEvent, activeFunction };
}
