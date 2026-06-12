import React from 'react'

const CodeWindow = () => {
    return (
        <div className="relative bg-gray-800 text-white w-full h-full overflow-hidden rounded-2xl shadow-lg flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 p-3 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs font-medium text-gray-400">Code</span>
                <div className="w-8"></div>
            </div>

            {/* Code Area */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                <pre className=" whitespace-pre-wrap">
                    <span className="text-gray-500">1</span>
                    <span className="text-blue-500">function</span>
                    <span className="text-white"> bubbleSort</span>
                    (<span className="text-yellow-400">arr</span>) <span className="text-gray-500">{'{'}</span>
                    <br />
                    <span className="text-gray-500">  2</span>
                    <span className="text-white">    let</span>
                    <span className="text-yellow-400"> n </span>
                    <span className="text-white">=</span>
                    <span className="text-blue-500"> arr</span>
                    <span className="text-gray-500">.</span>
                    <span className="text-white">length</span>
                    <span className="text-gray-500">;</span>
                    <br />
                    <span className="text-gray-500">  3</span>
                    <span className="text-gray-500">    </span>
                    <span className="text-blue-500">for</span>
                    <span className="text-gray-500"> (</span>
                    <span className="text-white">let</span>
                    <span className="text-yellow-400"> i </span>
                    <span className="text-white">=</span>
                    <span className="text-blue-500"> 0</span>
                    <span className="text-gray-500">;</span>
                    <span className="text-yellow-400"> i </span>
                    <span className="text-white">&lt;</span>
                    <span className="text-yellow-400"> n </span>
                    <span className="text-white">-</span>
                    <span className="text-blue-500"> 1</span>
                    <span className="text-gray-500">; </span>
                    <span className="text-white">i</span>
                    <span className="text-gray-500">++</span>
                    <span className="text-gray-500">) {'{'}</span>
                    <br />
                    <span className="text-gray-500">  4</span>
                    <span className="text-gray-500">      </span>
                    <span className="text-white">let</span>
                    <span className="text-yellow-400"> swapped </span>
                    <span className="text-white">=</span>
                    <span className="text-white">false</span>
                    <span className="text-gray-500">;</span>
                    <br />
                    <span className="text-gray-500">  5</span>
                    <span className="text-gray-500">      </span>
                    <span className="text-blue-500">for</span>
                    <span className="text-gray-500"> (</span>
                    <span className="text-white">let</span>
                    <span className="text-yellow-400"> j </span>
                    <span className="text-white">=</span>
                    <span className="text-blue-500"> 0</span>
                    <span className="text-gray-500">; </span>
                    <span className="text-yellow-400">j </span>
                    <span className="text-white">&lt;</span>
                    <span className="text-yellow-400"> n </span>
                    <span className="text-white">-</span>
                    <span className="text-blue-500"> i </span>
                    <span className="text-white">-</span>
                    <span className="text-blue-500"> 1</span>
                    <span className="text-gray-500">; </span>
                    <span className="text-white">j</span>
                    <span className="text-gray-500">++</span>
                    <span className="text-gray-500">) {'{'}</span>
                    <br />
                    <span className="text-gray-500">  6</span>
                    <span className="text-gray-500">          </span>
                    <span className="text-blue-500">if</span>
                    <span className="text-gray-500"> (</span>
                    <span className="text-yellow-400">arr</span>
                    <span className="text-gray-500">[</span>
                    <span className="text-yellow-400">j</span>
                    <span className="text-gray-500">] </span>
                    <span className="text-white">&gt;</span>
                    <span className="text-yellow-400">arr</span>
                    <span className="text-gray-500">[</span>
                    <span className="text-yellow-400">j </span>
                    <span className="text-white">+</span>
                    <span className="text-blue-500"> 1</span>
                    <span className="text-gray-500">]</span>
                    <span className="text-gray-500">) {'{'}</span>
                    <br />
                    <span className="text-gray-500">  7</span>
                    <span className="text-gray-500">              </span>
                    <span className="text-white">let</span>
                    <span className="text-yellow-400"> temp </span>
                    <span className="text-white">=</span>
                    <span className="text-yellow-400">arr</span>
                    <span className="text-gray-500">[</span>
                    <span className="text-yellow-400">j</span>
                    <span className="text-gray-500">]</span>
                    <span className="text-gray-500">;</span>
                    <br />
                    <span className="text-gray-500">  8</span>
                    <span className="text-gray-500">              </span>
                    <span className="text-yellow-400">arr</span>
                    <span className="text-gray-500">[</span>
                    <span className="text-yellow-400">j</span>
                    <span className="text-gray-500">] </span>
                    <span className="text-white">=</span>
                    <span className="text-yellow-400">arr</span>
                    <span className="text-gray-500">[</span>
                    <span className="text-yellow-400">j </span>
                    <span className="text-white">+</span>
                    <span className="text-blue-500"> 1</span>
                    <span className="text-gray-500">]</span>
                    <span className="text-gray-500">;</span>
                    <br />
                    <span className="text-gray-500">  9</span>
                    <span className="text-gray-500">              </span>
                    <span className="text-yellow-400">arr</span>
                    <span className="text-gray-500">[</span>
                    <span className="text-yellow-400">j </span>
                    <span className="text-white">+</span>
                    <span className="text-blue-500"> 1</span>
                    <span className="text-gray-500">]</span>
                    <span className="text-white">= </span>
                    <span className="text-yellow-400">temp</span>
                    <span className="text-gray-500">;</span>
                    <br />
                    <span className="text-gray-500">  10</span>
                    <span className="text-gray-500">             </span>
                    <span className="text-white">swapped </span>
                    <span className="text-white">=</span>
                    <span className="text-white">true</span>
                    <span className="text-gray-500">;</span>
                    <br />
                    <span className="text-gray-500">  11</span>
                    <span className="text-gray-500">             </span>
                    <span className="text-gray-500">{'}'}</span>
                    <br />
                    <span className="text-gray-500">  12</span>
                    <span className="text-gray-500">     </span>
                    <span className="text-gray-500">{'}'}</span>
                    <br />
                    <span className="text-gray-500">  13</span>
                    <span className="text-gray-500">     </span>
                    <span className="text-blue-500">if</span>
                    <span className="text-gray-500"> (</span>
                    <span className="text-white">!</span>
                    <span className="text-yellow-400">swapped</span>
                    <span className="text-gray-500">) </span>
                    <span className="text-gray-500">{'}'}</span>
                    <br />
                    <span className="text-gray-500">  14</span>
                    <span className="text-gray-500">         </span>
                    <span className="text-blue-500">break</span>
                    <span className="text-gray-500">;</span>
                    <br />
                    <span className="text-gray-500">  15</span>
                    <span className="text-gray-500">     </span>
                    <span className="text-gray-500">{'}'}</span>
                    <br />
                    <span className="text-gray-500">  16</span>
                    <span className="text-gray-500">     </span>
                    <span className="text-blue-500">return</span>
                    <span className="text-gray-500"> arr</span>
                    <span className="text-gray-500">;</span>
                    <br />
                    <span className="text-gray-500"> 17</span>
                    <span className="text-gray-500">{'}'}</span>
                    <br />
                    <span className="text-gray-500">18</span>
                    <br />
                    <span className="text-white">console</span>
                    <span className="text-gray-500">.</span>
                    <span className="text-white">log</span>
                    <span className="text-gray-500">(</span>
                    <span className="text-white">bubbleSort</span>
                    <span className="text-gray-500">(</span>
                    <span className="text-gray-500">[</span>
                    <span className="text-blue-500">5</span>
                    <span className="text-gray-500">, </span>
                    <span className="text-blue-500">1</span>
                    <span className="text-gray-500">, </span>
                    <span className="text-blue-500">4</span>
                    <span className="text-gray-500">, </span>
                    <span className="text-blue-500">2</span>
                    <span className="text-gray-500">, </span>
                    <span className="text-blue-500">8</span>
                    <span className="text-gray-500">]</span>
                    <span className="text-gray-500">)</span>
                    <span className="text-gray-500">;</span>
                    <br />
                </pre>
            </div>
        </div>
    );
};

export default CodeWindow;