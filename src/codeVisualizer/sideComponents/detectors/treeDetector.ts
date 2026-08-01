import { type CanvasState, type VarMap, deepUnwrap, matchesPrefix } from "./coreUtils";
import { collectNodePointers } from "./pointerCollector";

export const TREE_PREFIXES = ["tree", "bst", "root", "heap", "forest", "leaves", "nodes"];
export const TRIE_PREFIXES = ["trie", "prefix_tree", "ptree", "dictionary_tree", "suffix_tree"];

function looksLikeTrieNode(obj: any): boolean {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  const isMapLike = (v: any) =>
    v instanceof Map || (v && typeof v === "object" && v.__type === "map");
  return (
    Array.isArray(obj.children) ||
    Array.isArray(obj.links) ||
    Array.isArray(obj.edges) ||
    Array.isArray(obj.next) ||
    isMapLike(obj.children) ||
    isMapLike(obj.links) ||
    isMapLike(obj.next) ||
    "isEndOfWord" in obj ||
    "isEnd" in obj ||
    "endOfWord" in obj ||
    "terminal" in obj ||
    "isWord" in obj
  );
}

function unrollPointerTrie(rootNode: any): any[] {
  if (!rootNode || typeof rootNode !== "object" || Array.isArray(rootNode)) {
    return [];
  }

  const nodes: any[] = [];
  let idCounter = 0;
  const seen = new Set<any>();

  function getChildEntries(node: any): [string, any][] {
    const entries: [string, any][] = [];

    const isSerializedMap = (v: any) =>
      v && typeof v === "object" && v.__type === "map" && Array.isArray(v.entries);
    const isSerializedContainer = (v: any) =>
      v && typeof v === "object" && Array.isArray(v.data) && v.__type !== "map";

    // ── Map-backed children (children[char] via map/unordered_map) ──
    const mapField =
      node.children instanceof Map
        ? node.children
        : node.links instanceof Map
          ? node.links
          : node.next instanceof Map
            ? node.next
            : isSerializedMap(node.children)
              ? new Map(node.children.entries)
              : isSerializedMap(node.links)
                ? new Map(node.links.entries)
                : isSerializedMap(node.next)
                  ? new Map(node.next.entries)
                  : null;

    if (mapField) {
      mapField.forEach((child: any, key: any) => {
        if (child) entries.push([String(key), child]);
      });
      return entries;
    }

    // ── Array-backed children (bare JS array OR cloned mock container) ──
    const arrField: any[] | null = Array.isArray(node.children)
      ? node.children
      : Array.isArray(node.links)
        ? node.links
        : Array.isArray(node.edges)
          ? node.edges
          : Array.isArray(node.next)
            ? node.next
            : isSerializedContainer(node.children)
              ? node.children.data
              : isSerializedContainer(node.links)
                ? node.links.data
                : isSerializedContainer(node.next)
                  ? node.next.data
                  : null;

    if (arrField) {
      arrField.forEach((child, i) => {
        if (child !== null && child !== undefined && typeof child === "object") {
          const char = i >= 0 && i < 26 ? String.fromCharCode(97 + i) : String(i);
          entries.push([char, child]);
        }
      });
      return entries;
    }

    // Generic object fallback — only for genuinely plain objects, never wrappers
    if (
      node.children &&
      typeof node.children === "object" &&
      !isSerializedMap(node.children) &&
      !isSerializedContainer(node.children)
    ) {
      Object.entries(node.children).forEach(([k, v]) => {
        if (v && typeof v === "object") entries.push([k, v]);
      });
      return entries;
    }

    if (
      node.next &&
      typeof node.next === "object" &&
      !isSerializedMap(node.next) &&
      !isSerializedContainer(node.next) &&
      !Array.isArray(node.next) &&
      !("val" in node.next) &&
      !("value" in node.next && "next" in (node.next.next ?? {}))
    ) {
      entries.push(["→", node.next]);
    }

    return entries;
  }

  function resolveIsEnd(node: any): boolean {
    return !!(
      node.isEndOfWord ||
      node.isEnd ||
      node.endOfWord ||
      node.end ||
      node.terminal ||
      node.isWord ||
      node.word
    );
  }

  function traverse(rawNode: any, charKey?: string): string | null {
    if (!rawNode) return null;
    const node = deepUnwrap(rawNode);
    if (!node || typeof node !== "object" || Array.isArray(node)) return null;
    if (seen.has(node)) return null;
    seen.add(node);

    const currentId = String(idCounter++);
    const childEntries = getChildEntries(node);
    const childIds: string[] = [];

    for (const [char, child] of childEntries) {
      const childId = traverse(child, char);
      if (childId !== null) childIds.push(childId);
    }

    const isEnd = resolveIsEnd(node);
    const label = charKey !== undefined ? charKey : "root";

    nodes.push({
      id: currentId,
      value: label,
      children: childIds,
      isEnd,
      __raw: node,
    });

    return currentId;
  }

  traverse(rootNode);
  return nodes;
}

function unrollPointerTree(rootNode: any): any[] {
  if (!rootNode || typeof rootNode !== "object" || Array.isArray(rootNode)) return [];
  if (!("value" in rootNode) && !("val" in rootNode)) return [];

  const nodes: any[] = [];
  let idCounter = 0;
  const seen = new Set<any>();

  function traverse(rawNode: any): string | null {
    if (!rawNode) return null;
    const node = deepUnwrap(rawNode);
    if (!node || typeof node !== "object") return null;
    if (seen.has(node)) return null;
    seen.add(node);

    const currentId = String(idCounter++);
    const leftId = traverse(node.left);
    const rightId = traverse(node.right);

    nodes.push({
      id: currentId,
      value: node.value !== undefined ? node.value : node.val,
      left: leftId,
      right: rightId,
      __raw: node,
    });
    return currentId;
  }

  traverse(rootNode);
  return nodes;
}

function isBinaryNodeArray(val: any): boolean {
  if (!Array.isArray(val) || val.length === 0) return false;
  if (
    val.every(
      (v: any) =>
        typeof v === "object" &&
        v !== null &&
        !Array.isArray(v) &&
        "id" in v &&
        "value" in v &&
        !Array.isArray(v.children),
    )
  )
    return true;
  if (
    val.every(
      (v: any) =>
        Array.isArray(v) &&
        v.length >= 3 &&
        v.length <= 5 &&
        v.every((x: any) => typeof x === "number"),
    )
  )
    return true;
  return false;
}

function isTrieNodeArray(val: any): boolean {
  if (!Array.isArray(val) || val.length === 0) return false;
  return val.every(
    (v: any) =>
      typeof v === "object" &&
      v !== null &&
      !Array.isArray(v) &&
      "id" in v &&
      "value" in v &&
      Array.isArray(v.children),
  );
}

function normalizeNodeArray(val: any[]): any[] {
  if (val.length === 0) return val;
  return val.map((v: any) => {
    if (Array.isArray(v) && v.length >= 3) {
      const leftVal = v[2] !== undefined ? v[2] : -1;
      const rightVal = v[3] !== undefined ? v[3] : -1;
      return {
        id: String(v[0]),
        value: v[1],
        left: leftVal !== -1 ? String(leftVal) : null,
        right: rightVal !== -1 ? String(rightVal) : null,
      };
    }
    if (typeof v === "object" && v !== null && "id" in v) {
      return {
        ...v,
        id: String(v.id),
        left: v.left != null && v.left !== -1 && v.left !== "-1" ? String(v.left) : null,
        right: v.right != null && v.right !== -1 && v.right !== "-1" ? String(v.right) : null,
      };
    }
    return v;
  });
}

export function detectTrees(
  keys: string[],
  vars: VarMap,
  consumedKeys: Set<string>,
  pointerContext: Record<string, string[]>,
  visualizers: CanvasState[],
) {
  // ── 2. TRIE DETECTION
  keys.forEach((trieKey) => {
    if (consumedKeys.has(trieKey)) return;

    const isTrie = matchesPrefix(trieKey, TRIE_PREFIXES) || trieKey.toLowerCase().includes("trie");

    if (!isTrie) return;

    let trieData = deepUnwrap(vars[trieKey]?.value);

    if (
      trieData &&
      typeof trieData === "object" &&
      !Array.isArray(trieData) &&
      looksLikeTrieNode(trieData)
    ) {
      trieData = unrollPointerTrie(trieData);
    }

    if (isTrieNodeArray(trieData)) {
      const { pointers, usedKeys: ptrKeys } = collectNodePointers(
        keys,
        vars,
        trieKey,
        pointerContext,
        ["curr", "node", "ptr", "temp"],
        trieData,
      );
      const usedKeys = [trieKey, ...ptrKeys];
      usedKeys.forEach((k) => consumedKeys.add(k));
      visualizers.push({
        id: trieKey,
        type: "trie",
        usedKeys,
        props: { nodes: trieData, pointers },
      });
    }
  });

  // ── 3. TREE & BST DETECTION
  keys
    .filter((k) => matchesPrefix(k, TREE_PREFIXES))
    .forEach((treeKey) => {
      if (consumedKeys.has(treeKey)) return;

      let treeData = deepUnwrap(vars[treeKey]?.value);

      if (treeData && typeof treeData === "object" && !Array.isArray(treeData)) {
        if (looksLikeTrieNode(treeData) && !("left" in treeData) && !("right" in treeData)) {
          treeData = unrollPointerTrie(treeData);
          if (isTrieNodeArray(treeData)) {
            const { pointers, usedKeys: ptrKeys } = collectNodePointers(
              keys,
              vars,
              treeKey,
              pointerContext,
              ["root", "curr", "parent", "left", "right", "temp", "node"],
              treeData,
            );
            const usedKeys = [treeKey, ...ptrKeys];
            usedKeys.forEach((k) => consumedKeys.add(k));
            visualizers.push({
              id: treeKey,
              type: "trie",
              usedKeys,
              props: { nodes: treeData, pointers },
            });
            return;
          }
        }
        if ("value" in treeData || "val" in treeData) {
          if ("left" in treeData || "right" in treeData) {
            treeData = unrollPointerTree(treeData);
          }
        }
      }

      if (isBinaryNodeArray(treeData)) {
        const normalizedNodes = normalizeNodeArray(treeData);
        const { pointers, usedKeys: ptrKeys } = collectNodePointers(
          keys,
          vars,
          treeKey,
          pointerContext,
          ["root", "curr", "parent", "left", "right", "temp", "node"],
          normalizedNodes,
        );
        const usedKeys = [treeKey, ...ptrKeys];
        usedKeys.forEach((k) => consumedKeys.add(k));
        visualizers.push({
          id: treeKey,
          type: "tree",
          usedKeys,
          props: { nodes: normalizedNodes, pointers },
        });
      }
    });
}
