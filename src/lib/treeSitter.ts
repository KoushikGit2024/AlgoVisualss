import { Parser, Language } from "web-tree-sitter";
import { IRBuilder } from "../interpreter/ir/IRBuilder";
import { ExecutionEngine } from "../interpreter/engine/ExecutionEngine";

async function getFlowData(sourceCode: string) {
  
  await Parser.init({
    locateFile(scriptName: string) {
      // This ensures the core tree-sitter.wasm is fetched from localhost:5173/tree-sitter.wasm
      return '/' + scriptName; 
    },
  });
  
  const parser = new Parser();
  
  
  const Lang = await Language.load('/tree-sitter-cpp.wasm');
  parser.setLanguage(Lang);

  // 2. Parse source into Tree-sitter AST
  const tree = parser.parse(sourceCode);
  if (!tree) return [];
  
  // 3. Convert AST to decoupled IR
  const builder = new IRBuilder();
  const irProgram = builder.build(tree.rootNode as any);
  // 4. Load and Execute
  const engine = new ExecutionEngine();
  engine.loadProgram(irProgram);
  
  // 5. Extract the Flow Data (Snapshots)
  const snapshots = engine.run("main");
  
  return snapshots;
}

export default getFlowData;