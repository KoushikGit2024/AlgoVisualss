import { useState, Suspense, lazy } from "react"
const CodeWindow = lazy(() => import("../../codeVisualizer/CodeWindow"));
import SEO from "../../components/SEO"
const Editor = () => {

    
    const [storedCode]=useState<String>(()=>{
        const code=localStorage.getItem("editor-code");
        const defaultCode = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;
        return code || defaultCode
    })
    return (
        <>
            <SEO title="Editor" description="Code editor sandbox." noindex={true} />
            <Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-muted">Loading Editor...</div>}>
                <CodeWindow  codeObject={{
                    "c++":`${storedCode}`
                }} />
            </Suspense>
        </>
    )
}

export default Editor
