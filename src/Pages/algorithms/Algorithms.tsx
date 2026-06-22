import { useEffect, useState } from "react";
import CodeWindow from "../../codeVisualizer/CodeWindow";
import DocParser from "../../codeVisualizer/sideComponents/parsers/DocParser";
import { useParams } from "react-router-dom";
import ALGODATA from "./data/categories/AlgoData";
import { BookOpen, Code2 } from "lucide-react";
type ALGODATAITEM = (typeof ALGODATA)[number];
type subTopicItems = ALGODATAITEM["items"][number];
const Algorithms = () => {
  const { subTopic, topic } = useParams();
  const [data, setData] = useState<ALGODATAITEM | subTopicItems | undefined>();
  const [activeView, setActiveView] = useState<"docs" | "visualizer">("docs");

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
          {/* Floating Toggle */}
          <div className="absolute bottom-6 left-6 z-60 flex bg-surface/90 backdrop-blur-md rounded-full p-1 border border-border shadow-2xl transition-transform hover:scale-105">
            <button
              onClick={() => setActiveView("docs")}
              className={`flex items-center justify-center p-2 rounded-full transition-all ${
                activeView === "docs" 
                  ? "bg-accent text-bg shadow-md" 
                  : "text-muted hover:text-text hover:bg-surface-3"
              }`}
              title="Documentation"
            >
              <BookOpen size={10} />
            </button>
            <button
              onClick={() => setActiveView("visualizer")}
              className={`flex items-center justify-center p-2 rounded-full transition-all ${
                activeView === "visualizer" 
                  ? "bg-accent text-bg shadow-md" 
                  : "text-muted hover:text-text hover:bg-surface-3"
              }`}
              title="Visualizer & Code"
            >
              <Code2 size={10} />
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