import fs from "fs";
import path from "path";
import Parser from "web-tree-sitter";
import { ExecutionEngine } from "../../src/interpreter/engine/ExecutionEngine";
import { ProgramLoader } from "../../src/interpreter/engine/modules/ProgramLoader";
import { TypeDeclarationBuilder } from "../../src/interpreter/ir/modules/TypeDeclarationBuilder";

async function main() {
  await Parser.init();
  const parser = new Parser();
  const Lang = await Parser.Language.load(path.join(__dirname, "../../public/tree-sitter-cpp.wasm"));
  parser.setLanguage(Lang);

  const code = `
    #include <iostream>
    #include <string>
    using namespace std;

    class Employee {
    public:
        int id;
        string name;
        double salary;

        Employee(int i, string n, double s) {
            id = i;
            name = n;
            salary = s;
        }

        virtual void display() const {
            cout << "ID: " << id << endl;
        }
    };

    class Developer : public Employee {
    public:
        string language;

        Developer(int i, string n, double s, string lang) : Employee(i, n, s) {
            language = lang;
        }

        void display() const override {
            Employee::display();
            cout << "Language: " << language << endl;
        }
    };

    int main() {
        Developer dev(101, "Alice", 75000, "C++");
        dev.display();
        return 0;
    }
  `;

  const tree = parser.parse(code);
  const builder = new TypeDeclarationBuilder();
  const program = builder.build(tree.rootNode);

  const engine = new ExecutionEngine({
    breakpoints: [],
    provideInput: async () => "",
  });

  engine.loadProgram(program);
  console.log("Blueprints:", engine["classBlueprints"].get("Developer")?.fields.map(f => f.name));

  try {
    const result = await engine.runProgram();
    console.log("Run Output:", engine.getAccumulatedOutput());
  } catch (e) {
    console.error("CRASH:", e);
  }
}

main().catch(console.error);
