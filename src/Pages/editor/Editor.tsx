import CodeWindow from "../../codeVisualizer/CodeWindow"
const Editor = () => {
    return (
        <CodeWindow  codeObject={{
            "c++": `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
        }} />
    )
}

export default Editor
