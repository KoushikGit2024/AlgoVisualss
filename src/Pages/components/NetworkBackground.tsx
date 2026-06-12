import { useEffect, useRef } from "react";

export default function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Crisp canvas sizing ──
    const resize = () => {
      const d = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * d;
      canvas.height = canvas.offsetHeight * d;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const ctx = canvas.getContext('2d');
    
    // Expanded C++ / SDE specific word pool
    // Multilingual & Algorithmic word pool
    const words = [
      // ── Algorithmic & Big O ──
      "O(1)", "O(n)", "O(log n)", "O(n²)", "O(n log n)", "DFS", "BFS", "A*", 
      "Dijkstra", "memoize", "sort()", "hash_map", "tree", "graph", "heap", "trie",
      
      // ── C++ / Systems ──
      "std::vector", "std::cout", "nullptr", "constexpr", "virtual", 
      "template", "struct", "pointer", "size_t", "alloc",
      
      // ── JavaScript / TypeScript / Web ──
      "=>", "async", "await", "Promise", "useEffect", "console.log", 
      "undefined", "NaN", "export const", "interface", "type", "=== ",
      
      // ── Python / Data ──
      "def", "lambda", "import", "__init__", "yield", "self", "dict",
      "pandas", "DataFrame", "None", "True", "False",
      
      // ── Backend / Database ──
      "SELECT", "JOIN", "Schema", "NoSQL", "req", "res", "socket.emit", "Redis",
      
      // ── Generic Syntax & Symbols ──
      "{", "}", "[", "]", "++", "--", "||", "&&", "!==", "0", "1", "0xFA"
    ];

    let raf;
    let d = window.devicePixelRatio || 1;

    // Grid calculations
    const COLUMN_SPACING = 90; 
    const ROW_SPACING = 30;    
    let columns = Math.floor(canvas.width / (COLUMN_SPACING * d));

    // State arrays for each independent column
    let drops = [];
    let speeds = [];
    let ticks = [];
    let lastWords = [];

    const initColumn = (x) => {
      drops[x] = Math.floor(Math.random() * -40); // Start 0 to 40 rows off-screen
      speeds[x] = Math.floor(Math.random() * 3) + 1; // Speed: 1 to 3 ticks per step
      ticks[x] = 0;
      lastWords[x] = "";
    };

    for (let x = 0; x < columns; x++) {
      initColumn(x);
    }

    let lastTime = 0;
    const FPS = 30; // Slightly higher base FPS to support multi-speed columns
    const INTERVAL = 1000 / FPS;

    const loop = (time) => {
      raf = requestAnimationFrame(loop);
      const deltaTime = time - lastTime;

      if (deltaTime > INTERVAL) {
        lastTime = time - (deltaTime % INTERVAL);

        d = window.devicePixelRatio || 1;
        const W = canvas.width;
        const H = canvas.height;

        // Dynamically adjust columns on window resize
        const currentCols = Math.floor(W / (COLUMN_SPACING * d));
        if (currentCols !== drops.length) {
          const oldDrops = drops;
          drops = []; speeds = []; ticks = []; lastWords = [];
          for (let x = 0; x < currentCols; x++) {
            if (x < oldDrops.length) {
              drops[x] = oldDrops[x];
              speeds[x] = Math.floor(Math.random() * 3) + 1;
              ticks[x] = 0;
              lastWords[x] = "";
            } else {
              initColumn(x);
            }
          }
        }

        // Live CSS theme variables
        const cs = getComputedStyle(document.documentElement);
        const cMain = cs.getPropertyValue('--accent').trim() || '#6366F1';
        const cHighlight = cs.getPropertyValue('--accent-3').trim() || '#EC4899';

        // Fade the old trails
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = `rgba(0, 0, 0, 0.12)`; // Lower alpha = longer trails
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';

        ctx.font = `bold ${14 * d}px "Geist Mono", ui-monospace, monospace`;
        ctx.textAlign = "center";

        for (let i = 0; i < drops.length; i++) {
          ticks[i]++;
          
          // Only drop this column if it has hit its speed threshold
          if (ticks[i] >= speeds[i]) {
            ticks[i] = 0; // Reset tick
            
            const newWord = words[Math.floor(Math.random() * words.length)];
            const x = i * (COLUMN_SPACING * d) + ((COLUMN_SPACING * d) / 2);
            const currentY = drops[i] * (ROW_SPACING * d);
            const prevY = (drops[i] - 1) * (ROW_SPACING * d);

            // 1. Overwrite the *previous* head with the standard theme color 
            // This turns the bright head into a standard dim trail instantly
            if (lastWords[i]) {
              ctx.fillStyle = cMain;
              ctx.shadowBlur = 0; 
              ctx.globalAlpha = 0.7;
              ctx.fillText(lastWords[i], x, prevY);
            }

            // 2. Draw the *new* head in stark white with a neon glow
            ctx.fillStyle = '#ffffff'; 
            ctx.shadowBlur = 12 * d;
            ctx.shadowColor = cHighlight;
            ctx.globalAlpha = 1.0;
            ctx.fillText(newWord, x, currentY);
            
            // 3. Overlay the highlight color slightly to tint the white head
            ctx.fillStyle = cHighlight;
            ctx.globalAlpha = 0.6;
            ctx.fillText(newWord, x, currentY);

            lastWords[i] = newWord;

            // Randomly reset the drop to the top after it falls off-screen
            if (currentY > H && Math.random() > 0.95) {
              drops[i] = 0;
              lastWords[i] = "";
              speeds[i] = Math.floor(Math.random() * 3) + 1; // Re-roll a new speed for the next drop
            }

            drops[i]++;
          }
        }
        
        // Reset canvas context states for the next frame
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-[0.25] sm:opacity-[0.35]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[var(--bg)] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_18%,color-mix(in_srgb,var(--accent)_6%,transparent),transparent)]" />
    </div>
  );
}