import { Code, Terminal, Info } from "lucide-react";
import { DATA_STRUCTURES } from "./VisualizerNamingConventionsData";
import { PriorityTable } from "./PriorityTable";

const VisualizerNamingConventions = () => {
  return (
    <div className="w-full h-full overflow-y-auto styled-scrollbar bg-bg">
      <article className="max-w-[1000px] mx-auto px-6 py-8 pb-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-accent mb-4">Naming Conventions</h1>
          <p className="text-[calc(13rem/16)] text-muted max-w-2xl mx-auto leading-relaxed">
            The visualizer engine automatically determines how to render your variables by analyzing
            both their <strong>structural shape</strong> in memory and their{" "}
            <strong>variable names</strong>. Use the prefixes below to force the engine to render a
            specific UI component.
          </p>
        </header>

        {/* Global Rules Section */}
        <section className="mb-12 bg-surface border border-border rounded-lg overflow-hidden">
          <div className="bg-surface-2 px-5 py-3 border-b border-border flex items-center gap-2">
            <Terminal size={18} className="text-accent" />
            <h2 className="font-semibold text-text">How the Engine Works</h2>
          </div>
          <div className="p-5 flex flex-col gap-4 text-[calc(13rem/16)] text-muted">
            <div className="flex gap-3">
              <span className="text-accent shrink-0 mt-0.5">•</span>
              <p>
                <strong>Substring Matching:</strong> The engine checks if your variable name{" "}
                <em>contains</em> the prefix. For example, <code className="text-accent">adj</code>{" "}
                matches <code className="text-text">adj</code>,{" "}
                <code className="text-text">adj_list</code>, and{" "}
                <code className="text-text">my_adj_matrix</code>.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-accent shrink-0 mt-0.5">•</span>
              <p>
                <strong>Case Insensitive:</strong> Prefixes are case-insensitive.{" "}
                <code className="text-accent">graph</code> matches{" "}
                <code className="text-text">Graph</code> and{" "}
                <code className="text-text">GRAPH_DATA</code>.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-accent shrink-0 mt-0.5">•</span>
              <p>
                <strong>Pointers are Automatic:</strong> You rarely need to name pointers
                specifically. The engine tracks all memory addresses. If{" "}
                <code className="text-text">p</code> points to an element in an array, a badge for{" "}
                <code className="text-accent">p</code> automatically appears above it.
              </p>
            </div>
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md flex gap-3 text-blue-300">
              <Info size={18} className="shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Pro Tip:</strong> Only structural data (arrays, vectors, maps, structs) are
                rendered as large components. Primitives (int, bool, float) are stored in the engine
                but only rendered if they act as a pointer or index to a rendered structure.
              </p>
            </div>
          </div>
        </section>

        {/* Priority Resolution Table */}
        <PriorityTable />

        {/* Data Structures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DATA_STRUCTURES.map((ds, idx) => (
            <div
              key={idx}
              className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col transition-all hover:border-border-2"
            >
              {/* Header */}
              <div
                className={`px-4 py-3 border-b border-border flex items-center gap-3 ${ds.color}`}
              >
                {ds.icon}
                <h3 className={`font-bold text-[calc(13rem/16)] ${ds.textColor}`}>{ds.title}</h3>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col gap-4">
                <p className="text-[calc(13rem/16)] text-muted leading-relaxed">{ds.description}</p>

                {/* Requirement */}
                <div>
                  <h4 className="text-[calc(11rem/16)] font-semibold text-text/70 uppercase tracking-wider mb-2">
                    Shape Requirement
                  </h4>
                  <p className="text-[12.5px] text-muted bg-surface-2 p-2.5 rounded border border-border leading-relaxed">
                    {ds.shape}
                  </p>
                </div>

                {/* Prefixes */}
                <div>
                  <h4 className="text-[calc(11rem/16)] font-semibold text-text/70 uppercase tracking-wider mb-2">
                    Valid Prefixes
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {ds.prefixes.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-[12.5px] bg-surface-2/50 px-2 py-1.5 rounded"
                      >
                        <span
                          className={`font-mono font-bold ${
                            p.prefix === "ANY NAME" ? "text-muted" : ds.textColor
                          }`}
                        >
                          {p.prefix}
                        </span>
                        <code className="text-muted/70 font-mono hidden sm:block">
                          {p.example}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auxiliary */}
                {ds.auxiliary.length > 0 && (
                  <div className="mt-auto pt-4">
                    <h4 className="text-[calc(11rem/16)] font-semibold text-text/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Code size={14} /> Associated Variables
                    </h4>
                    <div className="flex flex-col gap-2">
                      {ds.auxiliary.map((aux, i) => (
                        <div key={i} className="text-[12.5px]">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-semibold text-text/90">{aux.role}:</span>
                            <span className="font-mono text-accent/80">{aux.trigger}</span>
                          </div>
                          <p className="text-muted pl-2 border-l-2 border-border/50">
                            {aux.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
};

export default VisualizerNamingConventions;
