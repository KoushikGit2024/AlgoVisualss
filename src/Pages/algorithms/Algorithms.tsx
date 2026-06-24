import { useEffect, useState } from "react";
import CodeWindow from "../../codeVisualizer/CodeWindow";
import DocParser from "../../codeVisualizer/sideComponents/parsers/DocParser";
import { useParams, useSearchParams } from "react-router-dom";
import ALGODATA from "./data/categories/AlgoData";
import { BookOpen, Code2 } from "lucide-react";
type ALGODATAITEM = (typeof ALGODATA)[number];
type subTopicItems = ALGODATAITEM["items"][number];
const Algorithms = () => {
  const { subTopic, topic } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ALGODATAITEM | subTopicItems | undefined>();
  const [activeView, setActiveView] = useState<"docs" | "visualizer">(
    searchParams.get("openCode") === "true" ? "visualizer" : "docs"
  );

  const handleViewChange = (view: "docs" | "visualizer") => {
    setActiveView(view);
    const newParams = new URLSearchParams(searchParams);
    if (view === "visualizer") {
      newParams.set("openCode", "true");
    } else {
      newParams.delete("openCode");
    }
    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    if (topic) {
      const topicPath = `/algorithms/${topic}`;

      // Primary: match by href (handles underscores, abbreviations, special chars)
      // Fallback: match by normalized name (handles simple cases)
      const topicData = ALGODATA.find(
        (item) =>
          item.href === topicPath ||
          item.name.toLowerCase() === topic.replace(/[-_]/g, ' ').toLowerCase()
      ) as ALGODATAITEM;

      if (topicData) {
        if (!subTopic) {
          setData(topicData);
        } else {
          const subTopicPath = `/algorithms/${topic}/${subTopic}`;
          // Match by href — handles bfs, lcs, lis, kadanes, etc. perfectly
          const subTopicData = topicData?.items?.find(
            (item) => item.href === subTopicPath
          );
          setData(subTopicData as subTopicItems);
        }
      } else {
        setData(undefined);
      }
    }
  }, [subTopic, topic]);

  const getCodeObject = () => {
    let codes: Record<string, string> = {};

    if (data) {
      if ("codes" in data && data.codes) {
        codes = { ...data.codes };
      }
    }

    if (Object.keys(codes).length === 0) {
      return {
        "c++": `
      #include <iostream>

      using namespace std;
      int main() {
        cout<<"Hello World"<<endl;
        return 0;
      }
      `
      };
    }
    
    return codes;
  };

  return (
    <div className="relative h-[calc(100vh-64px)] max-h-[calc(100vh-70px)] min-w-0 max-w-full flex flex-col bg-bg">
      
      {(!topic) && (
        <div className="w-full h-full flex items-center justify-center text-muted font-mono p-6">
          <p>Please select a topic from the sidebar.</p>
        </div>
      )}

      {(topic && !subTopic && data) && (
        <div className="w-full h-full">
          <DocParser data={data} />
        </div>
      )}

      {(topic && subTopic && data) && (
        <div className="w-full h-full flex flex-col min-h-0 relative">
          {/* Ultra Premium Expanding Toggle */}
          <div className="absolute bottom-6 left-6 z-[100] flex items-center bg-surface/60 backdrop-blur-2xl rounded-full p-1.5 border border-border/40 shadow-lg group transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-2xl hover:shadow-accent/10 hover:border-border/80 hover:bg-surface-2/90">
            <button
              onClick={() => handleViewChange("docs")}
              className={`flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeView === "docs" 
                  ? "bg-accent text-white shadow-md shadow-accent/30 px-3.5 py-2.5" 
                  : "text-muted hover:text-text hover:bg-surface px-2.5 py-2.5"
              }`}
            >
              <BookOpen size={16} />
              <span className={`text-[11px] font-bold uppercase tracking-wider overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ml-0 w-0 opacity-0 group-hover:ml-2 group-hover:w-[50px] group-hover:opacity-100`}>
                Theory
              </span>
            </button>
            
            <div className="h-4 bg-border/80 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 w-0 mx-0 group-hover:w-[1px] group-hover:mx-1 group-hover:opacity-100" />

            <button
              onClick={() => handleViewChange("visualizer")}
              className={`flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeView === "visualizer" 
                  ? "bg-accent text-white shadow-md shadow-accent/30 px-3.5 py-2.5" 
                  : "text-muted hover:text-text hover:bg-surface px-2.5 py-2.5"
              }`}
            >
              <Code2 size={16} />
              <span className={`text-[11px] font-bold uppercase tracking-wider overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ml-0 w-0 opacity-0 group-hover:ml-2 group-hover:w-[66px] group-hover:opacity-100`}>
                Visualize
              </span>
            </button>
          </div>

          {/* View Content */}
          <div className="flex-1 w-full h-full overflow-hidden min-h-0">
            {activeView === "docs" ? (
              <DocParser data={data} />
            ) : (
              <CodeWindow codeObject={getCodeObject()} />
            )}
          </div>
        </div>
      )}

      {(topic && !data) && (
        <div className="w-full h-full flex flex-col items-center justify-center text-muted font-mono p-6">
          <p>Topic or Algorithm not found.</p>
        </div>
      )}
      
    </div>
  )
}

export default Algorithms;