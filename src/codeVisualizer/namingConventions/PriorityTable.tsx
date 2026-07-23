import { AlertCircle } from "lucide-react";

export const PriorityTable = () => {
  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-text mb-4 pb-2 border-b border-border flex items-center gap-2">
        <AlertCircle size={20} className="text-yellow-400" />
        Type Resolution Priority
      </h2>
      <p className="text-[calc(13rem/16)] text-muted mb-4 leading-relaxed">
        When a variable matches multiple types (e.g. a <code className="text-accent">vector</code>{" "}
        could be a Graph, a Tree, a Queue, a Stack, or an Array), the visualizer resolves the type
        based on the following priority:
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-surface-2 text-text">
              <th className="px-4 py-3 border-b border-r border-border font-semibold w-16">
                Priority
              </th>
              <th className="px-4 py-3 border-b border-r border-border font-semibold">Data Structure</th>
              <th className="px-4 py-3 border-b border-r border-border font-semibold">Requirement</th>
              <th className="px-4 py-3 border-b border-border font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border hover:bg-surface-2/40 transition-colors">
              <td className="px-4 py-3 border-r border-border font-mono text-center text-accent">1</td>
              <td className="px-4 py-3 border-r border-border font-semibold text-ds-string">String</td>
              <td className="px-4 py-3 border-r border-border text-muted">
                Raw <code className="text-text">string</code> or <code className="text-text">char[]</code>
              </td>
              <td className="px-4 py-3 text-muted">Bypasses prefix checking entirely</td>
            </tr>
            <tr className="border-b border-border hover:bg-surface-2/40 transition-colors">
              <td className="px-4 py-3 border-r border-border font-mono text-center text-accent">2</td>
              <td className="px-4 py-3 border-r border-border font-semibold text-ds-bitset">Bitset</td>
              <td className="px-4 py-3 border-r border-border text-muted">
                Raw <code className="text-text">number</code> or <code className="text-text">bool[]</code>
              </td>
              <td className="px-4 py-3 text-muted">Bypasses prefix checking entirely</td>
            </tr>
            <tr className="border-b border-border hover:bg-surface-2/40 transition-colors">
              <td className="px-4 py-3 border-r border-border font-mono text-center text-accent">3</td>
              <td className="px-4 py-3 border-r border-border font-semibold text-success">Tree</td>
              <td className="px-4 py-3 border-r border-border text-muted">
                Matches any Tree prefix <strong>AND</strong> has pointer shape (left/right)
              </td>
              <td className="px-4 py-3 text-muted">Highest explicit prefix priority</td>
            </tr>
            <tr className="border-b border-border hover:bg-surface-2/40 transition-colors">
              <td className="px-4 py-3 border-r border-border font-mono text-center text-accent">4</td>
              <td className="px-4 py-3 border-r border-border font-semibold text-ds-trie">Trie</td>
              <td className="px-4 py-3 border-r border-border text-muted">
                Matches Trie prefix <strong>AND</strong> has pointer shape
              </td>
              <td className="px-4 py-3 text-muted">Evaluated immediately after trees</td>
            </tr>
            <tr className="border-b border-border hover:bg-surface-2/40 transition-colors">
              <td className="px-4 py-3 border-r border-border font-mono text-center text-accent">5</td>
              <td className="px-4 py-3 border-r border-border font-semibold text-accent">Graph</td>
              <td className="px-4 py-3 border-r border-border text-muted">
                Matches Graph prefix <strong>AND</strong> is 2D Array
              </td>
              <td className="px-4 py-3 text-muted">Vectors default to graph if prefix matches</td>
            </tr>
            <tr className="border-b border-border hover:bg-surface-2/40 transition-colors">
              <td className="px-4 py-3 border-r border-border font-mono text-center text-accent">6</td>
              <td className="px-4 py-3 border-r border-border font-semibold text-accent-3">Stack</td>
              <td className="px-4 py-3 border-r border-border text-muted">
                Matches Stack prefix <strong>AND</strong> is 1D Array
              </td>
              <td className="px-4 py-3 text-muted">Evaluated before default array</td>
            </tr>
            <tr className="border-b border-border hover:bg-surface-2/40 transition-colors">
              <td className="px-4 py-3 border-r border-border font-mono text-center text-accent">7</td>
              <td className="px-4 py-3 border-r border-border font-semibold text-accent-2">Queue</td>
              <td className="px-4 py-3 border-r border-border text-muted">
                Matches Queue prefix <strong>AND</strong> is 1D Array
              </td>
              <td className="px-4 py-3 text-muted">Evaluated before default array</td>
            </tr>
            <tr className="border-b border-border hover:bg-surface-2/40 transition-colors">
              <td className="px-4 py-3 border-r border-border font-mono text-center text-accent">8</td>
              <td className="px-4 py-3 border-r border-border font-semibold text-accent">Linked List</td>
              <td className="px-4 py-3 border-r border-border text-muted">
                Fallback if it has a <code className="text-text">next</code> pointer
              </td>
              <td className="px-4 py-3 text-muted">Matches anything with LL shape</td>
            </tr>
            <tr className="border-b border-border hover:bg-surface-2/40 transition-colors">
              <td className="px-4 py-3 border-r border-border font-mono text-center text-accent">9</td>
              <td className="px-4 py-3 border-r border-border font-semibold text-accent-2">2D Array</td>
              <td className="px-4 py-3 border-r border-border text-muted">
                Fallback if it is a 2D Array
              </td>
              <td className="px-4 py-3 text-muted">Matches any un-prefixed 2D Array</td>
            </tr>
            <tr className="hover:bg-surface-2/40 transition-colors">
              <td className="px-4 py-3 border-r border-border font-mono text-center text-accent">10</td>
              <td className="px-4 py-3 border-r border-border font-semibold text-accent-3">1D Array</td>
              <td className="px-4 py-3 border-r border-border text-muted">
                Fallback if it is a 1D Array
              </td>
              <td className="px-4 py-3 text-muted">Matches any un-prefixed 1D Array</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
