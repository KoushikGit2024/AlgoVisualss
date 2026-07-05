import { useState } from "react"
import CodeWindow from "../../codeVisualizer/CodeWindow"
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
        <CodeWindow  codeObject={{
            "c++":`${storedCode}`
        }} />
    )
}

export default Editor
