// src/lib/engine.worker.ts
import { Parser, Language } from "web-tree-sitter";
import { IRBuilder } from "../interpreter/ir/IRBuilder";
import { ExecutionEngine } from "../interpreter/engine/ExecutionEngine";

self.onmessage = async (e) => {
  const { sourceCode } = e.data;

  try {
    // 1. Initialize Tree-sitter
    await Parser.init({
      locateFile(scriptName: string) {
        return '/' + scriptName;
      },
    });

    const parser = new Parser();
    const Lang = await Language.load('/tree-sitter-cpp.wasm');
    parser.setLanguage(Lang);

    // 2. Parse source into Tree-sitter AST
    const tree = parser.parse(sourceCode);
    if (!tree) throw new Error("Failed to parse AST. Please check syntax.");

    // 3. Convert AST to IR
    const builder = new IRBuilder();
    const irProgram = builder.build(tree.rootNode as any);

    // 4. Load and Execute
    const engine = new ExecutionEngine();
    engine.loadProgram(irProgram);
    const snapshots = engine.run("main");

    // 5. Send snapshot count as a sanity check, then post
    // NOTE: Do NOT console.log(snapshots) here — logging thousands of deeply
    // nested objects in a Worker thread causes the browser to OOM before
    // postMessage can fire.
    console.log(`[Worker] Done: ${snapshots.length} snapshots`);

    self.postMessage({ success: true, snapshots });

  } catch (error: any) {
    const msg = typeof error?.message === "string"
      ? error.message
      : String(error);
    self.postMessage({ success: false, error: msg });
  }
};