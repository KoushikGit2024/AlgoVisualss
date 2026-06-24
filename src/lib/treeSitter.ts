import { Parser, Language } from "web-tree-sitter";
import { IRBuilder } from "../interpreter/ir/IRBuilder";
import { ExecutionEngine } from "../interpreter/engine/ExecutionEngine";

async function getFlowData(sourceCode: string) {
  // 1. Initialize Tree-sitter and FORCE it to look at the absolute public root
  await Parser.init({
    locateFile(scriptName: string) {
      // This ensures the core tree-sitter.wasm is fetched from localhost:5173/tree-sitter.wasm
      return '/' + scriptName; 
    },
  });
  
  const parser = new Parser();
  
  // 2. Add the leading slash! This absolutely guarantees Vite won't serve index.html
  const Lang = await Language.load('/tree-sitter-cpp.wasm');
  // console.log(Lang);
  parser.setLanguage(Lang);

  // 3. Parse source into Tree-sitter AST
  const tree = parser.parse(sourceCode);
  if (!tree) return [];
  
  // 4. Convert AST to your decoupled IR
  const builder = new IRBuilder();
  const irProgram = builder.build(tree.rootNode as any); 
  console.log(irProgram)
  // 5. Load and Execute
  const engine = new ExecutionEngine();
  engine.loadProgram(irProgram);
  
  // 6. Extract the Flow Data (Snapshots)
  const snapshots = engine.run("main");
  console.log(snapshots.length);
  
  return snapshots;
}

export default getFlowData;