import { useEffect, useState } from "react";
import CodeWindow from "../../codeVisualizer/CodeWindow";
import DocParser from "../../codeVisualizer/sideComponents/parsers/DocParser";
import { useParams, useSearchParams } from "react-router-dom";
import ALGODATA from "./data/categories/AlgoData";
// import { BookOpen, Code2 } from "lucide-react";
type ALGODATAITEM = (typeof ALGODATA)[number];
type subTopicItems = ALGODATAITEM["items"][number];
const Algorithms = () => {
  const { subTopic, topic } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<ALGODATAITEM | subTopicItems | undefined>();
  const activeView = searchParams.get("openCode") === "true" ? "visualizer" : "docs";

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
        "c++": `#include <iostream>

using namespace std;
int main() {
  cout<<"Hello World"<<endl;
  return 0;
}`
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

          {/* View Content */}
          <div className="flex-1 w-full h-full overflow-hidden min-h-0">
            <div className={`w-full h-full ${activeView === "docs" ? "block" : "hidden"}`}>
              <DocParser data={data} />
            </div>
            <div className={`w-full h-full ${activeView === "visualizer" ? "block" : "hidden"}`}>
              <CodeWindow codeObject={getCodeObject()} />
            </div>
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