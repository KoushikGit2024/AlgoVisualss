// src/lib/engine.worker.ts
import { Parser, Language } from "web-tree-sitter";
import { IRBuilder } from "../interpreter/ir/IRBuilder"; // Update path if needed
import { ExecutionEngine } from "../interpreter/engine/ExecutionEngine"; // Update path if needed

self.onmessage = async (e) => {
  const { sourceCode } = e.data;

  try {
    // 1. Initialize Tree-sitter and locate WASM
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

    // 4. Load and Execute headlessly
    const engine = new ExecutionEngine();
    engine.loadProgram(irProgram);
    const snapshots = engine.run("main");
    // console.log(snapshots)
    // 5. Send the massive snapshot array back to React
    self.postMessage({ success: true, snapshots });

  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};