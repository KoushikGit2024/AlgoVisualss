import { ExecutionEngine } from './src/interpreter/engine/ExecutionEngine';
import ts from 'tree-sitter';
import Cpp from 'tree-sitter-cpp';
import { IRBuilder } from './src/interpreter/ir/IRBuilder';

const code = `
#include <iostream>
#include <vector>
using namespace std;

vector<int> countBits(int n) {
    vector<int> bits(n + 1);
    bits[0] = 0;
    for (int curr = 1; curr <= n; curr++)
        bits[curr] = bits[curr >> 1] + (curr & 1);
    return bits;
}

int main() {
    int n = 8;
    vector<int> bits = countBits(n);
    for (int curr = 0; curr < bits.size(); curr++)
        cout << bits[curr] << " ";
    cout << endl;
    return 0;
}
`;

const parser = new ts();
parser.setLanguage(Cpp);
const tree = parser.parse(code);
const builder = new IRBuilder();
const program = builder.build(tree.rootNode);
const engine = new ExecutionEngine(program);
engine.loadProgram(program);
engine.run();
const snapshots = engine.getSnapshots();

let found2 = false;
for (let i = 0; i < snapshots.length; i++) {
  const s = snapshots[i];
  const b = s.state.variables['bits']?.value?.data;
  if (b && b[3] === 2) {
    found2 = true;
    console.log("Snapshot", i, s.event.type, s.event.payload);
  }
}
