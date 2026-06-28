import fs from "fs";
import Parser from "tree-sitter";
import CPP from "tree-sitter-cpp";
import { IRBuilder } from "./src/interpreter/ir/IRBuilder";
import { ExecutionEngine } from "./src/interpreter/engine/ExecutionEngine";

const parser = new Parser();
parser.setLanguage(CPP);

const code = fs.readFileSync("test.cpp", "utf8");
const tree = parser.parse(code);

const builder = new IRBuilder();
const program = builder.build(tree.rootNode as any);

const engine = new ExecutionEngine();
engine.loadProgram(program);

try {
  engine.run();
  console.log("Execution successful!");
} catch (e: any) {
  console.error(e.message);
}
