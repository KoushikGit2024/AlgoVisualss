import { type VarMap, deepUnwrap } from "./coreUtils";

export function collectGraphPointers(
  keys: string[],
  vars: VarMap,
  targetName: string,
  pointerContext: Record<string, string[]>,
): { pointers: { name: string; nodeId: string }[]; usedKeys: string[] } {
  const pointerPatterns = ["node", "curr", "u", "v"];
  const pointers: { name: string; nodeId: string }[] = [];
  const usedKeys: string[] = [];

  for (const key of keys) {
    const lower = key.toLowerCase();

    // Explicit naming convention override (e.g., graph_u)
    const isExplicitlyBound =
      lower.startsWith(`${targetName.toLowerCase()}_`) ||
      lower.endsWith(`_${targetName.toLowerCase()}`);

    // Contextual binding (via history tracker)
    const isContextuallyBound = pointerContext[key]?.includes(targetName);

    const isMatch =
      isExplicitlyBound ||
      isContextuallyBound ||
      pointerPatterns.some(
        (p) =>
          lower === p ||
          lower.startsWith(`ptr_${p}`) ||
          lower.startsWith(`${p}_`) ||
          lower.endsWith(`_${p}`),
      );

    // If it's contextually bound to another structure, DO NOT broadcast it here.
    const isBoundElsewhere =
      pointerContext[key] &&
      !pointerContext[key].includes(targetName) &&
      pointerContext[key].length > 0;

    if (isMatch && !isBoundElsewhere) {
      const val = vars[key]?.value;
      if (typeof val === "number" || typeof val === "string") {
        pointers.push({ name: key, nodeId: String(val) });
        usedKeys.push(key);
      }
    }
  }
  return { pointers, usedKeys };
}

export function collectIndexPointers(
  keys: string[],
  vars: VarMap,
  targetName: string,
  pointerContext: Record<string, string[]>,
  patterns: string[] = [],
): { pointers: { name: string; index: number }[]; usedKeys: string[] } {
  const pointers: { name: string; index: number }[] = [];
  const usedKeys: string[] = [];

  for (const key of keys) {
    const lower = key.toLowerCase();

    const isExplicitlyBound =
      lower.startsWith(`${targetName.toLowerCase()}_`) ||
      lower.endsWith(`_${targetName.toLowerCase()}`);
    const isContextuallyBound = pointerContext[key]?.includes(targetName);

    const isMatch =
      isExplicitlyBound ||
      isContextuallyBound ||
      patterns.some(
        (p) =>
          lower === p ||
          lower.startsWith(`ptr_${p}`) ||
          lower.startsWith(`${p}_`) ||
          lower.endsWith(`_${p}`),
      );

    const isBoundElsewhere =
      pointerContext[key] &&
      !pointerContext[key].includes(targetName) &&
      pointerContext[key].length > 0;

    if (isMatch && !isBoundElsewhere) {
      const val = vars[key]?.value;
      if (typeof val === "number") {
        pointers.push({ name: key, index: val });
        usedKeys.push(key);
      }
    }
  }
  return { pointers, usedKeys };
}

export function collectNodePointers(
  keys: string[],
  vars: VarMap,
  targetName: string,
  pointerContext: Record<string, string[]>,
  patterns: string[],
  nodeArray?: any[],
): { pointers: { name: string; nodeId: string }[]; usedKeys: string[] } {
  const pointers: { name: string; nodeId: string }[] = [];
  const usedKeys: string[] = [];

  for (const key of keys) {
    const lower = key.toLowerCase();
    const isExplicitlyBound =
      lower.startsWith(`${targetName.toLowerCase()}_`) ||
      lower.endsWith(`_${targetName.toLowerCase()}`);
    const isContextuallyBound = pointerContext[key]?.includes(targetName);

    const isNameMatch =
      isExplicitlyBound ||
      isContextuallyBound ||
      patterns.length === 0 ||
      patterns.some((p) => lower === p || lower.endsWith(`_${p}`) || lower.startsWith(`ptr_${p}`));

    const isBoundElsewhere =
      pointerContext[key] &&
      !pointerContext[key].includes(targetName) &&
      pointerContext[key].length > 0;

    let val = vars[key]?.value;
    if (val !== undefined && val !== null && !isBoundElsewhere) {
      val = deepUnwrap(val);

      if (typeof val === "object" && nodeArray) {
        const targetRefId =
          val.__circular_ref !== undefined ? val.__circular_ref : val.__original_ref_id;

        let match: any;
        if (targetRefId !== undefined) {
          match = nodeArray.find((n: any) => n.__raw && n.__raw.__original_ref_id === targetRefId);
        } else {
          match = nodeArray.find((n: any) => n.__raw === val);
          if (!match) {
            const valStr = JSON.stringify(val);
            const matches = nodeArray.filter((n: any) => JSON.stringify(n.__raw) === valStr);
            if (matches.length === 1) {
              match = matches[0];
            }
          }
        }

        if (match) {
          pointers.push({ name: key, nodeId: String(match.id) });
          usedKeys.push(key);
          continue;
        }
      }

      if (isNameMatch) {
        pointers.push({ name: key, nodeId: String(val) });
        usedKeys.push(key);
      }
    }
  }
  return { pointers, usedKeys };
}
