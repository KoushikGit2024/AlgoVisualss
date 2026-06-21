import { useEffect, useState, useRef } from 'react';
import CodeEditor from './sideComponents/CodeEditor';
import VisualGround from './sideComponents/VisualGround';
import { ALGODATA } from '../Pages/algorithms/data/categories/AlgoData';

const CodeWindow = ({
codeArray = [
  [
    'C++',
    `#include <iostream>
#include <vector>
#include <map>
#include <algorithm>

using namespace std;

/* =========================
   1. Pass-By-Reference Test
   ========================= */
void testSwap() {
    int a = 10;
    int b = 99;
    swap(a, b);
    cout << "Swap Test: a=" << a << ", b=" << b << endl; 
    // Expected: a=99, b=10
}

/* =========================
   2. 1D Array Visualizer Test
   ========================= */
void testVector() {
    // 'arr_' prefix triggers <D1Array />
    vector<int> arr_nums;
    arr_nums.push_back(5);
    arr_nums.push_back(2);
    arr_nums.push_back(9);
    arr_nums.push_back(1);

    // 'i' and 'j' suffixes trigger 1D bottom pointers
    int ptr_i = 0;
    int ptr_j = 3;

    cout << "Vector Size: " << arr_nums.size() << endl;

    // Test Monkey Patched Algorithms!
    int maxVal = max_element(arr_nums.begin(), arr_nums.end());
    cout << "Max Element: " << maxVal << endl; // Expected: 9

    reverse(arr_nums.begin(), arr_nums.end());
    cout << "Front after reverse: " << arr_nums.front() << endl; // Expected: 1
    
    cout << "Vector Loop: ";
    for (int n : arr_nums) {
        cout << n << " ";
    }
    cout << endl;
}

/* =========================
   3. 2D Matrix Visualizer Test
   ========================= */
void testMatrix() {
    // 'grid_' prefix triggers <D2Array />
    vector<vector<int>> grid_board = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };

    // 'r' and 'c' prefixes trigger 2D corner pointers
    int r_curr = 1;
    int c_curr = 1;
    
    cout << "Matrix Center: " << grid_board[r_curr][c_curr] << endl; // Expected: 5
}

/* =========================
   4. Graph Visualizer Test
   ========================= */
void testGraph() {
    int n = 3;
    
    // 'adj_' prefix triggers <Graph />
    vector<vector<int>> adj_list(n);
    
    // 'edges' suffix auto-binds to draw the SVG lines
    vector<vector<int>> graph_edges;
    
    adj_list[0].push_back(1);
    graph_edges.push_back({0, 1});
    
    adj_list[0].push_back(2);
    graph_edges.push_back({0, 2});
    
    adj_list[1].push_back(2);
    graph_edges.push_back({1, 2});

    // 'visit' prefix auto-binds to highlight nodes
    vector<int> visit_tracker(n, 0);
    visit_tracker[0] = 1; // Node 0 will glow

    // 'curr' prefix auto-binds the floating graph pointer
    int curr_node = 1;

    cout << "Graph adj_list[0] Size: " << adj_list[0].size() << endl; // Expected: 2
    cout << "Edge from 0 to: " << adj_list[0][1] << endl;        // Expected: 2
}

/* =========================
   5. Maps & Subscript Mutation
   ========================= */
void testMap() {
    // Falls back to Heap memory viewer safely
    map<int, int> freq;
    freq[1] = 100;
    freq[2] = 200;
    
    // Tests deep AST UpdateExpression auto-recovery
    freq[1]++; 
    
    cout << "Map Freq[1]: " << freq[1] << endl; // Expected: 101
}

/* =========================
   Main Execution
   ========================= */
int main() {
    cout << "--- ENGINE STRESS TEST START ---" << endl;
    
    testSwap();
    testVector();
    testMatrix();
    testGraph();
    testMap();
    
    cout << "--- ALL TESTS PASSED! ---" << endl;
    return 0;
}`
  ]
]
}: {
  codeArray?: [string, string][];
}) => {
  const [lang, setLang] = useState<string>(codeArray[0][0]);
  const [code, setCode] = useState<string>(codeArray[0][1]);
  const [highlightLine, setHighlightLine] = useState<number>(1);
  
  const [splitOffset, setSplitOffset] = useState<number>(35);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ FIX 1: Only reset the code when the 'lang' tab changes!
  useEffect(() => {
    setCode(codeArray.find((item) => item[0] === lang)?.[1] || '');
  }, [lang]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isDesktop = window.innerWidth >= 1024; 
      
      let newPercentage = 50;
      if (isDesktop) {
        newPercentage = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        newPercentage = ((e.clientY - rect.top) / rect.height) * 100;
      }

      if (newPercentage < 20) newPercentage = 20;
      if (newPercentage > 80) newPercentage = 80;
      
      setSplitOffset(newPercentage);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const langArray: string[] = ['C++', 'java', 'python', 'js'];
  // console.log(ALGODATA)
  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col lg:flex-row items-stretch w-full h-full p-1 lg:p-2 bg-bg text-text overflow-hidden min-h-0"
    >
      
      {/* ─── Left Pane: Code Editor ────────────────────────────────────────── */}
      <div 
        style={{ flex: lang === 'C++' ? `${splitOffset} 1 0%` : '1 1 0%' }} 
        className="flex flex-col glass rounded-lg overflow-hidden shadow-lg border border-border min-h-0 min-w-0 max-h-screen transition-all duration-300"
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-surface-2 border-b border-border shrink-0">
          <div className="flex items-center gap-1 bg-surface rounded-full p-0.5 border border-border shadow-sm">
            {langArray.map((item, index) => (
              <button
                key={index}
                onClick={() => setLang(item)}
                className={`px-3 py-1 text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
                  lang === item
                    ? 'nav-pill-active shadow-sm'
                    : 'text-muted hover:text-text hover:bg-surface-2 rounded-full'
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Editor</span>
        </div>

        <div className="flex-1 relative bg-surface styled-scrollbar overflow-hidden min-h-0">
          <CodeEditor code={code} lang={lang} highlightLine={highlightLine} setCode={setCode}/>
        </div>
      </div>

      {/* ─── Expandable/Resizable Divider ──────────────────────────────────── */}
      {lang === 'C++' && (
        <div 
          onMouseDown={() => setIsDragging(true)}
          className="flex items-center justify-center p-1 lg:p-0 lg:w-3 shrink-0 cursor-row-resize lg:cursor-col-resize group z-10"
        >
          <div className={`
            w-12 h-1 lg:w-1 lg:h-12 rounded-full transition-colors duration-200
            ${isDragging ? 'bg-accent' : 'bg-border group-hover:bg-accent-2'}
          `} />
        </div>
      )}

      {/* ─── Right Pane: Visual Ground ─────────────────────────────────────── */}
<div
  style={
    lang === "C++"
      ? {
          flex: `${100 - splitOffset} 1 0%`,
          position: "relative",
        }
      : {
          position: "absolute",
          bottom: "0.75rem",
          right: "0.75rem",
          zIndex: 20,
        }
  }
  className={`flex flex-col overflow-hidden glass rounded-lg shadow-lg border border-border transition-all duration-300 ${
    lang === "C++"
      ? "min-h-0 min-w-0 max-h-screen"
      : "w-[calc(100vw-1rem)] sm:w-[320px] max-w-1/2 bg-surface/90 backdrop-blur-md"
  }`}
>
  <div className="px-2.5 sm:px-3 py-1.5 bg-surface-2 border-b border-border flex items-center justify-between shrink-0">
    <span className="text-[9px] sm:text-[10px] font-semibold text-muted uppercase tracking-wider font-display">
      Visualizer Output
    </span>

    <div className="flex items-center gap-2">
      <span className="text-[9px] sm:text-[10px] text-muted font-mono">
        {lang === "C++" ? "Active" : "C++ Only"}
      </span>

      <div
        className={`w-2 h-2 rounded-full aspect-square shadow-sm ${
          lang === "C++"
            ? "bg-success animate-pulse glow-accent"
            : "bg-red-400"
        }`}
      />
    </div>
  </div>

  <div className="flex-1 relative bg-surface mesh-bg overflow-hidden flex flex-col min-h-0 min-w-0 p-2">
    <VisualGround
      code={code}
      lang={lang}
      setHighlightLine={setHighlightLine}
    />
  </div>
</div> 
    </div>
  );
};

export default CodeWindow;