// const GRAPHS_SECTIONfx = {
//   name: "Graphs",
//   href: "/algorithms/graphs",
//     icon: (
//       <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
//         <circle cx="12" cy="32" r="5"/>
//         <circle cx="32" cy="12" r="5"/>
//         <circle cx="52" cy="32" r="5"/>
//         <circle cx="32" cy="52" r="5"/>
//         <line x1="12" y1="32" x2="32" y2="12"/>
//         <line x1="32" y1="12" x2="52" y2="32"/>
//         <line x1="52" y1="32" x2="32" y2="52"/>
//         <line x1="32" y1="52" x2="12" y2="32"/>
//       </svg>
//     ),
//     hoverIcon: (
//       <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
//         <circle cx="12" cy="32" r="5" fill="#34D399" stroke="#34D399"/>
//         <circle cx="32" cy="12" r="5" fill="#34D399" stroke="#34D399"/>
//         <circle cx="52" cy="32" r="5" fill="#34D399" stroke="#34D399"/>
//         <circle cx="32" cy="52" r="5"/>
//         <line x1="12" y1="32" x2="32" y2="12" stroke="#34D399" strokeWidth="5"/>
//         <line x1="32" y1="12" x2="52" y2="32" stroke="#34D399" strokeWidth="5"/>
//         <line x1="52" y1="32" x2="32" y2="52"/>
//         <line x1="32" y1="52" x2="12" y2="32"/>
//       </svg>
//     ),

//   about: [
//     { tag: "h1", text: "Graphs" },
//     { tag: "p", text: "A graph is a collection of vertices (nodes) connected by edges, used to model anything with relationships: road networks, social connections, dependency chains, computer networks, and state-transition systems. Unlike trees, graphs can contain cycles and don't require a single root, which is why graph algorithms must explicitly track visited state to avoid infinite loops." },
//     { tag: "p", text: "Most graph algorithms fall into a handful of families: traversal (BFS, DFS — visit every reachable node), shortest path (Dijkstra, Bellman-Ford, Floyd-Warshall — find minimum-cost routes), minimum spanning tree (Kruskal, Prim — connect all nodes at minimum total edge cost), and structural analysis (Topological Sort, Tarjan's SCC — extract ordering or connectivity structure)." },
//     { tag: "h2", text: "Representation matters" },
//     { tag: "p", text: "Almost every complexity bound below is expressed in terms of V (vertices) and E (edges), and which representation you use changes the constants involved. An adjacency list (array of neighbor lists per vertex) takes O(V + E) space and is the standard choice for sparse graphs. An adjacency matrix (V×V grid of edge weights/booleans) takes O(V²) space but gives O(1) edge-existence checks, which matters for dense graphs and for Floyd-Warshall specifically." },
//     { tag: "table",
//       headers: ["Algorithm", "Problem Solved", "Time", "Handles Negative Weights?"],
//       rows: [
//         ["BFS", "Shortest path by edge count (unweighted)", "O(V + E)", "N/A (unweighted)"],
//         ["DFS", "Reachability, cycle detection, ordering", "O(V + E)", "N/A (unweighted)"],
//         ["Topological Sort", "Linear ordering respecting DAG dependencies", "O(V + E)", "N/A"],
//         ["Dijkstra's Algorithm", "Single-source shortest path, non-negative weights", "O((V+E) log V)", "No"],
//         ["Bellman-Ford Algorithm", "Single-source shortest path, detects negative cycles", "O(VE)", "Yes"],
//         ["Floyd-Warshall Algorithm", "All-pairs shortest path", "O(V³)", "Yes (no negative cycles)"],
//         ["Kruskal's Algorithm", "Minimum spanning tree, edge-driven", "O(E log E)", "N/A (MST, not shortest path)"],
//         ["Prim's Algorithm", "Minimum spanning tree, vertex-driven", "O((V+E) log V)", "N/A (MST, not shortest path)"],
//         ["Tarjan's SCC", "Strongly connected components (directed graphs)", "O(V + E)", "N/A"]
//       ]
//     },
//     { tag: "note", variant: "tip", text: "If edge weights can be negative, Dijkstra silently produces wrong answers without warning — always reach for Bellman-Ford instead when negative weights are possible." }
//   ],

//   items: [

//     /* ════════════════════════════════════════════════════════════════════
//        1. BREADTH-FIRST SEARCH (BFS)
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Breadth-First Search (BFS)",
//       href: "/algorithms/graphs/bfs",
//       type: "Easy",

//       about: [
//         { tag: "h1", text: "Breadth-First Search (BFS)" },
//         { tag: "p", text: "BFS explores a graph level by level: it visits all neighbors of the starting node first, then all neighbors of those neighbors, and so on — expanding outward in concentric 'rings' from the source. It uses a queue (FIFO) to ensure nodes are processed in the order they were discovered, which is exactly what produces the level-by-level expansion pattern." },
//         { tag: "p", text: "Its single most important property is that on an unweighted graph, the first time BFS reaches a node is guaranteed to be via a shortest path (fewest edges) from the source — this is why BFS is the standard algorithm for shortest-path-by-hop-count problems, not just generic traversal." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "You need the shortest path in terms of number of edges (unweighted graph)",
//           "You need to find the minimum number of 'moves' or 'steps' in a state-space search (puzzle solving, word ladders, maze shortest path)",
//           "You want to process a graph level-by-level (e.g. finding all nodes within k hops of a source)",
//           "You need to check bipartiteness (BFS with 2-coloring) or find connected components"
//         ]},
//         { tag: "note", variant: "info", text: "BFS and DFS share the same O(V + E) time complexity — the choice between them is about what property you need (shortest unweighted path vs. simpler stack-based exploration), not about speed." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(V + E)",
//         best: [
//           { tag: "h2", text: "Best Case — O(V + E)" },
//           { tag: "p", text: "Even if the target node is the very first neighbor discovered, BFS as a full traversal still visits every vertex and edge to maintain the queue-based invariant and avoid revisiting nodes — there's no asymptotic shortcut, though early-exit search variants can stop sooner in practice." },
//           { tag: "ul", items: [
//             "Every vertex is enqueued and dequeued at most once: O(V)",
//             "Every edge is examined exactly once (or twice for undirected graphs, a constant factor): O(E)",
//             "Total: O(V + E), even in the most favourable input"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(V + E)" },
//           { tag: "p", text: "BFS performs the same fixed sequence of operations (enqueue, mark visited, examine neighbors) regardless of graph shape — the total work is structurally determined by V and E, not by the specific arrangement of edges." },
//           { tag: "ul", items: [
//             "Each vertex transitions through queue states exactly once: enqueued, then dequeued and processed — O(V) total",
//             "Each edge is inspected exactly once per direction it represents — O(E) total",
//             "Combined: O(V + E), regardless of graph topology"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(V + E)" },
//           { tag: "p", text: "There's no adversarial graph structure that increases BFS's cost beyond visiting every vertex and edge exactly once — a dense graph with E close to V² simply makes the E term dominate, but the bound itself doesn't change form." },
//           { tag: "ul", items: [
//             "Worst case is identical to best/average in asymptotic form: O(V + E)",
//             "For a dense graph (E ≈ V²), this becomes O(V²), but that's purely a consequence of the input's edge count, not algorithmic degeneration",
//             "This matches the trivial lower bound: any correct traversal must examine every reachable vertex and edge at least once"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(V)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(V)" },
//           { tag: "p", text: "BFS needs a visited-set and a queue, both of which can hold up to V vertices in the worst layer-width scenario, even in the most favourable graph shape." },
//           { tag: "ul", items: ["visited set/array: O(V)", "queue: up to O(V) entries at its widest point"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(V)" },
//           { tag: "p", text: "Space usage scales with the number of vertices regardless of edge density, since the visited-tracking structure must accommodate every vertex." },
//           { tag: "ul", items: ["visited array: O(V)", "queue: bounded by O(V) since each vertex enters at most once"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(V)" },
//           { tag: "p", text: "In a 'star' or very wide graph, an entire layer of the BFS frontier can contain almost all V vertices simultaneously in the queue, but this still stays bounded by O(V) — it never exceeds the vertex count." },
//           { tag: "ul", items: [
//             "Maximum queue size: O(V) (bounded by total vertex count, can't exceed it)",
//             "visited set: O(V)",
//             "Total: O(V), independent of E"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function breadthFirstSearch(graph, sourceVertex):
//     visitedVertices ← set containing sourceVertex
//     traversalQueue  ← empty queue
//     enqueue(traversalQueue, sourceVertex)
//     distanceFromSource[sourceVertex] ← 0

//     while traversalQueue is not empty:
//         currentVertex ← dequeue(traversalQueue)

//         for neighborVertex in graph.adjacent(currentVertex):
//             if neighborVertex not in visitedVertices:
//                 visitedVertices.add(neighborVertex)
//                 distanceFromSource[neighborVertex] ← distanceFromSource[currentVertex] + 1
//                 parentVertex[neighborVertex] ← currentVertex
//                 enqueue(traversalQueue, neighborVertex)

//     return distanceFromSource, parentVertex` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Mark the source as visited and enqueue it with distance 0.",
//           "Repeatedly dequeue the front of the queue (the 'oldest' discovered, not-yet-expanded node).",
//           "For each of its neighbors, if not already visited, mark it visited immediately upon discovery (critical: mark visited at enqueue time, not dequeue time, to avoid duplicate enqueues), record its distance as one more than the current node's, and enqueue it.",
//           "Repeat until the queue is empty — every reachable vertex has now been visited exactly once, with the shortest hop-distance recorded."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Invariant: the queue, at any point, contains vertices from at most two consecutive 'distance layers' (distance d and d+1), and the queue is ordered so all distance-d vertices are dequeued before any distance-(d+1) vertex. By induction on distance d, this guarantees the first time any vertex is discovered, it's discovered via a path of length equal to its true shortest distance from the source — a vertex at true distance d cannot be discovered before all distance-(d-1) vertices have been fully processed, since it can only be reached through one of them." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <queue>
// using namespace std;

// // Performs a breadth-first traversal of 'adjacencyList' starting at
// // 'sourceVertex', printing each vertex in the order it is visited and
// // its shortest hop-distance from the source.
// void breadthFirstSearch(const vector<vector<int>>& adjacencyList, int sourceVertex, int vertexCount) {
//     vector<int> distanceFromSource(vertexCount, -1); // -1 means "not yet reached"
//     vector<int> parentVertex(vertexCount, -1);
//     queue<int> traversalQueue;

//     // The source vertex starts the traversal at distance 0.
//     distanceFromSource[sourceVertex] = 0;
//     traversalQueue.push(sourceVertex);

//     while (!traversalQueue.empty()) {
//         int currentVertex = traversalQueue.front();
//         traversalQueue.pop();

//         cout << "Visiting vertex " << currentVertex
//              << " (distance = " << distanceFromSource[currentVertex] << ")" << endl;

//         // Examine every neighbor of the current vertex.
//         for (int neighborVertex : adjacencyList[currentVertex]) {
//             if (distanceFromSource[neighborVertex] == -1) {
//                 // First time this neighbor has been reached — record it
//                 // and schedule it for later expansion.
//                 distanceFromSource[neighborVertex] = distanceFromSource[currentVertex] + 1;
//                 parentVertex[neighborVertex] = currentVertex;
//                 traversalQueue.push(neighborVertex);
//             }
//         }
//     }

//     cout << endl << "Shortest distances from source vertex " << sourceVertex << ":" << endl;
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         cout << "  Vertex " << vertex << ": " << distanceFromSource[vertex] << endl;
//     }
// }

// int main() {
//     // Static demonstration data — an undirected graph with 6 vertices.
//     int vertexCount = 6;
//     vector<vector<int>> adjacencyList(vertexCount);

//     auto addUndirectedEdge = [&](int vertexA, int vertexB) {
//         adjacencyList[vertexA].push_back(vertexB);
//         adjacencyList[vertexB].push_back(vertexA);
//     };

//     addUndirectedEdge(0, 1);
//     addUndirectedEdge(0, 2);
//     addUndirectedEdge(1, 3);
//     addUndirectedEdge(1, 4);
//     addUndirectedEdge(2, 5);

//     breadthFirstSearch(adjacencyList, 0, vertexCount);

//     return 0;
// }
// `,
//         "python": `from collections import deque


// def breadth_first_search(adjacency_list, source_vertex, vertex_count):
//     """
//     Performs a breadth-first traversal of 'adjacency_list' starting at
//     'source_vertex', printing each vertex in the order it is visited and
//     its shortest hop-distance from the source.
//     """
//     distance_from_source = [-1] * vertex_count  # -1 means "not yet reached"
//     parent_vertex = [-1] * vertex_count

//     # The source vertex starts the traversal at distance 0.
//     distance_from_source[source_vertex] = 0
//     traversal_queue = deque([source_vertex])

//     while traversal_queue:
//         current_vertex = traversal_queue.popleft()
//         print(f"Visiting vertex {current_vertex} (distance = {distance_from_source[current_vertex]})")

//         # Examine every neighbor of the current vertex.
//         for neighbor_vertex in adjacency_list[current_vertex]:
//             if distance_from_source[neighbor_vertex] == -1:
//                 # First time this neighbor has been reached — record it
//                 # and schedule it for later expansion.
//                 distance_from_source[neighbor_vertex] = distance_from_source[current_vertex] + 1
//                 parent_vertex[neighbor_vertex] = current_vertex
//                 traversal_queue.append(neighbor_vertex)

//     print()
//     print(f"Shortest distances from source vertex {source_vertex}:")
//     for vertex in range(vertex_count):
//         print(f"  Vertex {vertex}: {distance_from_source[vertex]}")


// def main():
//     # Static demonstration data - an undirected graph with 6 vertices.
//     vertex_count = 6
//     adjacency_list = [[] for _ in range(vertex_count)]

//     def add_undirected_edge(vertex_a, vertex_b):
//         adjacency_list[vertex_a].append(vertex_b)
//         adjacency_list[vertex_b].append(vertex_a)

//     add_undirected_edge(0, 1)
//     add_undirected_edge(0, 2)
//     add_undirected_edge(1, 3)
//     add_undirected_edge(1, 4)
//     add_undirected_edge(2, 5)

//     breadth_first_search(adjacency_list, 0, vertex_count)


// if __name__ == "__main__":
//     main()
// `,
//         "java": `import java.util.ArrayList;
// import java.util.LinkedList;
// import java.util.List;
// import java.util.Queue;

// public class Main {

//     // Performs a breadth-first traversal of 'adjacencyList' starting at
//     // 'sourceVertex', printing each vertex in the order it is visited and
//     // its shortest hop-distance from the source.
//     static void breadthFirstSearch(List<List<Integer>> adjacencyList, int sourceVertex, int vertexCount) {
//         int[] distanceFromSource = new int[vertexCount];
//         int[] parentVertex = new int[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             distanceFromSource[vertex] = -1; // -1 means "not yet reached"
//             parentVertex[vertex] = -1;
//         }

//         Queue<Integer> traversalQueue = new LinkedList<>();

//         // The source vertex starts the traversal at distance 0.
//         distanceFromSource[sourceVertex] = 0;
//         traversalQueue.add(sourceVertex);

//         while (!traversalQueue.isEmpty()) {
//             int currentVertex = traversalQueue.poll();
//             System.out.println("Visiting vertex " + currentVertex
//                     + " (distance = " + distanceFromSource[currentVertex] + ")");

//             // Examine every neighbor of the current vertex.
//             for (int neighborVertex : adjacencyList.get(currentVertex)) {
//                 if (distanceFromSource[neighborVertex] == -1) {
//                     // First time this neighbor has been reached — record it
//                     // and schedule it for later expansion.
//                     distanceFromSource[neighborVertex] = distanceFromSource[currentVertex] + 1;
//                     parentVertex[neighborVertex] = currentVertex;
//                     traversalQueue.add(neighborVertex);
//                 }
//             }
//         }

//         System.out.println();
//         System.out.println("Shortest distances from source vertex " + sourceVertex + ":");
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             System.out.println("  Vertex " + vertex + ": " + distanceFromSource[vertex]);
//         }
//     }

//     public static void main(String[] args) {
//         // Static demonstration data — an undirected graph with 6 vertices.
//         int vertexCount = 6;
//         List<List<Integer>> adjacencyList = new ArrayList<>();
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             adjacencyList.add(new ArrayList<>());
//         }

//         int[][] undirectedEdges = {{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 5}};
//         for (int[] edge : undirectedEdges) {
//             adjacencyList.get(edge[0]).add(edge[1]);
//             adjacencyList.get(edge[1]).add(edge[0]);
//         }

//         breadthFirstSearch(adjacencyList, 0, vertexCount);
//     }
// }
// `,
//         "js": `// Performs a breadth-first traversal of 'adjacencyList' starting at
// // 'sourceVertex', printing each vertex in the order it is visited and
// // its shortest hop-distance from the source.
// function breadthFirstSearch(adjacencyList, sourceVertex, vertexCount) {
//     const distanceFromSource = new Array(vertexCount).fill(-1); // -1 means "not yet reached"
//     const parentVertex = new Array(vertexCount).fill(-1);
//     const traversalQueue = [];

//     // The source vertex starts the traversal at distance 0.
//     distanceFromSource[sourceVertex] = 0;
//     traversalQueue.push(sourceVertex);

//     let queueFront = 0; // avoids O(n) shift() calls by tracking a read index

//     while (queueFront < traversalQueue.length) {
//         const currentVertex = traversalQueue[queueFront];
//         queueFront++;

//         console.log(\`Visiting vertex \${currentVertex} (distance = \${distanceFromSource[currentVertex]})\`);

//         // Examine every neighbor of the current vertex.
//         for (const neighborVertex of adjacencyList[currentVertex]) {
//             if (distanceFromSource[neighborVertex] === -1) {
//                 // First time this neighbor has been reached — record it
//                 // and schedule it for later expansion.
//                 distanceFromSource[neighborVertex] = distanceFromSource[currentVertex] + 1;
//                 parentVertex[neighborVertex] = currentVertex;
//                 traversalQueue.push(neighborVertex);
//             }
//         }
//     }

//     console.log();
//     console.log(\`Shortest distances from source vertex \${sourceVertex}:\`);
//     for (let vertex = 0; vertex < vertexCount; vertex++) {
//         console.log(\`Vertex \${vertex}: \${distanceFromSource[vertex]}\`);
//     }
// }

// function main() {
//     // Static demonstration data — an undirected graph with 6 vertices.
//     const vertexCount = 6;
//     const adjacencyList = Array.from({ length: vertexCount }, () => []);

//     const addUndirectedEdge = (vertexA, vertexB) => {
//         adjacencyList[vertexA].push(vertexB);
//         adjacencyList[vertexB].push(vertexA);
//     };

//     addUndirectedEdge(0, 1);
//     addUndirectedEdge(0, 2);
//     addUndirectedEdge(1, 3);
//     addUndirectedEdge(1, 4);
//     addUndirectedEdge(2, 5);

//     breadthFirstSearch(adjacencyList, 0, vertexCount);
// }

// main();
// `,
//         "c": `#include <stdio.h>
// #include <string.h>

// #define MAX_VERTICES 100

// int adjacencyList[MAX_VERTICES][MAX_VERTICES];
// int neighborCount[MAX_VERTICES];

// // Records an undirected edge between 'vertexA' and 'vertexB' in the
// // fixed-size adjacency list.
// void addUndirectedEdge(int vertexA, int vertexB) {
//     adjacencyList[vertexA][neighborCount[vertexA]++] = vertexB;
//     adjacencyList[vertexB][neighborCount[vertexB]++] = vertexA;
// }

// // Performs a breadth-first traversal starting at 'sourceVertex', printing
// // each vertex in the order it is visited and its shortest hop-distance
// // from the source. Uses a simple array-backed queue.
// void breadthFirstSearch(int sourceVertex, int vertexCount) {
//     int distanceFromSource[MAX_VERTICES];
//     int parentVertex[MAX_VERTICES];
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         distanceFromSource[vertex] = -1; /* -1 means "not yet reached" */
//         parentVertex[vertex] = -1;
//     }

//     int traversalQueue[MAX_VERTICES];
//     int queueFront = 0;
//     int queueBack = 0;

//     distanceFromSource[sourceVertex] = 0;
//     traversalQueue[queueBack++] = sourceVertex;

//     while (queueFront < queueBack) {
//         int currentVertex = traversalQueue[queueFront++];
//         printf("Visiting vertex %d (distance = %d)\\n", currentVertex, distanceFromSource[currentVertex]);

//         for (int i = 0; i < neighborCount[currentVertex]; i++) {
//             int neighborVertex = adjacencyList[currentVertex][i];
//             if (distanceFromSource[neighborVertex] == -1) {
//                 distanceFromSource[neighborVertex] = distanceFromSource[currentVertex] + 1;
//                 parentVertex[neighborVertex] = currentVertex;
//                 traversalQueue[queueBack++] = neighborVertex;
//             }
//         }
//     }

//     printf("\\nShortest distances from source vertex %d:\\n", sourceVertex);
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         printf("  Vertex %d: %d\\n", vertex, distanceFromSource[vertex]);
//     }
// }

// int main() {
//     /* Static demonstration data - an undirected graph with 6 vertices. */
//     int vertexCount = 6;
//     memset(neighborCount, 0, sizeof(neighborCount));

//     addUndirectedEdge(0, 1);
//     addUndirectedEdge(0, 2);
//     addUndirectedEdge(1, 3);
//     addUndirectedEdge(1, 4);
//     addUndirectedEdge(2, 5);

//     breadthFirstSearch(0, vertexCount);

//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;

// class Program {

//     // Performs a breadth-first traversal of 'adjacencyList' starting at
//     // 'sourceVertex', printing each vertex in the order it is visited and
//     // its shortest hop-distance from the source.
//     static void BreadthFirstSearch(List<int>[] adjacencyList, int sourceVertex, int vertexCount) {
//         int[] distanceFromSource = new int[vertexCount];
//         int[] parentVertex = new int[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             distanceFromSource[vertex] = -1; // -1 means "not yet reached"
//             parentVertex[vertex] = -1;
//         }

//         var traversalQueue = new Queue<int>();

//         // The source vertex starts the traversal at distance 0.
//         distanceFromSource[sourceVertex] = 0;
//         traversalQueue.Enqueue(sourceVertex);

//         while (traversalQueue.Count > 0) {
//             int currentVertex = traversalQueue.Dequeue();
//             Console.WriteLine($"Visiting vertex {currentVertex} (distance = {distanceFromSource[currentVertex]})");

//             // Examine every neighbor of the current vertex.
//             foreach (int neighborVertex in adjacencyList[currentVertex]) {
//                 if (distanceFromSource[neighborVertex] == -1) {
//                     // First time this neighbor has been reached — record it
//                     // and schedule it for later expansion.
//                     distanceFromSource[neighborVertex] = distanceFromSource[currentVertex] + 1;
//                     parentVertex[neighborVertex] = currentVertex;
//                     traversalQueue.Enqueue(neighborVertex);
//                 }
//             }
//         }

//         Console.WriteLine();
//         Console.WriteLine($"Shortest distances from source vertex {sourceVertex}:");
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             Console.WriteLine($"  Vertex {vertex}: {distanceFromSource[vertex]}");
//         }
//     }

//     static void Main() {
//         // Static demonstration data — an undirected graph with 6 vertices.
//         int vertexCount = 6;
//         var adjacencyList = new List<int>[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             adjacencyList[vertex] = new List<int>();
//         }

//         void AddUndirectedEdge(int vertexA, int vertexB) {
//             adjacencyList[vertexA].Add(vertexB);
//             adjacencyList[vertexB].Add(vertexA);
//         }

//         AddUndirectedEdge(0, 1);
//         AddUndirectedEdge(0, 2);
//         AddUndirectedEdge(1, 3);
//         AddUndirectedEdge(1, 4);
//         AddUndirectedEdge(2, 5);

//         BreadthFirstSearch(adjacencyList, 0, vertexCount);
//     }
// }
// `,
//         "swift": `import Foundation

// // Performs a breadth-first traversal of 'adjacencyList' starting at
// // 'sourceVertex', printing each vertex in the order it is visited and
// // its shortest hop-distance from the source.
// func breadthFirstSearch(_ adjacencyList: [[Int]], _ sourceVertex: Int, _ vertexCount: Int) {
//     var distanceFromSource = [Int](repeating: -1, count: vertexCount) // -1 means "not yet reached"
//     var parentVertex = [Int](repeating: -1, count: vertexCount)
//     var traversalQueue: [Int] = []

//     // The source vertex starts the traversal at distance 0.
//     distanceFromSource[sourceVertex] = 0
//     traversalQueue.append(sourceVertex)

//     var queueFront = 0 // avoids O(n) removeFirst() calls by tracking a read index

//     while queueFront < traversalQueue.count {
//         let currentVertex = traversalQueue[queueFront]
//         queueFront += 1

//         print("Visiting vertex \\(currentVertex) (distance = \\(distanceFromSource[currentVertex]))")

//         // Examine every neighbor of the current vertex.
//         for neighborVertex in adjacencyList[currentVertex] {
//             if distanceFromSource[neighborVertex] == -1 {
//                 // First time this neighbor has been reached — record it
//                 // and schedule it for later expansion.
//                 distanceFromSource[neighborVertex] = distanceFromSource[currentVertex] + 1
//                 parentVertex[neighborVertex] = currentVertex
//                 traversalQueue.append(neighborVertex)
//             }
//         }
//     }

//     print()
//     print("Shortest distances from source vertex \\(sourceVertex):")
//     for vertex in 0..<vertexCount {
//         print("  Vertex \\(vertex): \\(distanceFromSource[vertex])")
//     }
// }

// // Static demonstration data — an undirected graph with 6 vertices.
// let vertexCount = 6
// var adjacencyList = [[Int]](repeating: [], count: vertexCount)

// func addUndirectedEdge(_ vertexA: Int, _ vertexB: Int) {
//     adjacencyList[vertexA].append(vertexB)
//     adjacencyList[vertexB].append(vertexA)
// }

// addUndirectedEdge(0, 1)
// addUndirectedEdge(0, 2)
// addUndirectedEdge(1, 3)
// addUndirectedEdge(1, 4)
// addUndirectedEdge(2, 5)

// breadthFirstSearch(adjacencyList, 0, vertexCount)
// `,
//         "kotlin": `import java.util.LinkedList

// // Performs a breadth-first traversal of 'adjacencyList' starting at
// // 'sourceVertex', printing each vertex in the order it is visited and
// // its shortest hop-distance from the source.
// fun breadthFirstSearch(adjacencyList: Array<MutableList<Int>>, sourceVertex: Int, vertexCount: Int) {
//     val distanceFromSource = IntArray(vertexCount) { -1 } // -1 means "not yet reached"
//     val parentVertex = IntArray(vertexCount) { -1 }
//     val traversalQueue: LinkedList<Int> = LinkedList()

//     // The source vertex starts the traversal at distance 0.
//     distanceFromSource[sourceVertex] = 0
//     traversalQueue.add(sourceVertex)

//     while (traversalQueue.isNotEmpty()) {
//         val currentVertex = traversalQueue.poll()
//         println("Visiting vertex $currentVertex (distance = \${distanceFromSource[currentVertex]})")

//         // Examine every neighbor of the current vertex.
//         for (neighborVertex in adjacencyList[currentVertex]) {
//             if (distanceFromSource[neighborVertex] == -1) {
//                 // First time this neighbor has been reached — record it
//                 // and schedule it for later expansion.
//                 distanceFromSource[neighborVertex] = distanceFromSource[currentVertex] + 1
//                 parentVertex[neighborVertex] = currentVertex
//                 traversalQueue.add(neighborVertex)
//             }
//         }
//     }

//     println()
//     println("Shortest distances from source vertex $sourceVertex:")
//     for (vertex in 0 until vertexCount) {
//         println("  Vertex $vertex: \${distanceFromSource[vertex]}")
//     }
// }

// fun main() {
//     // Static demonstration data — an undirected graph with 6 vertices.
//     val vertexCount = 6
//     val adjacencyList = Array(vertexCount) { mutableListOf<Int>() }

//     fun addUndirectedEdge(vertexA: Int, vertexB: Int) {
//         adjacencyList[vertexA].add(vertexB)
//         adjacencyList[vertexB].add(vertexA)
//     }

//     addUndirectedEdge(0, 1)
//     addUndirectedEdge(0, 2)
//     addUndirectedEdge(1, 3)
//     addUndirectedEdge(1, 4)
//     addUndirectedEdge(2, 5)

//     breadthFirstSearch(adjacencyList, 0, vertexCount)
// }
// `,
//         "scala": `import scala.collection.mutable

// object Main extends App {

//   // Performs a breadth-first traversal of 'adjacencyList' starting at
//   // 'sourceVertex', printing each vertex in the order it is visited and
//   // its shortest hop-distance from the source.
//   def breadthFirstSearch(adjacencyList: Array[mutable.ListBuffer[Int]], sourceVertex: Int, vertexCount: Int): Unit = {
//     val distanceFromSource = Array.fill(vertexCount)(-1) // -1 means "not yet reached"
//     val parentVertex = Array.fill(vertexCount)(-1)
//     val traversalQueue = mutable.Queue[Int]()

//     // The source vertex starts the traversal at distance 0.
//     distanceFromSource(sourceVertex) = 0
//     traversalQueue.enqueue(sourceVertex)

//     while (traversalQueue.nonEmpty) {
//       val currentVertex = traversalQueue.dequeue()
//       println(s"Visiting vertex $currentVertex (distance = \${distanceFromSource(currentVertex)})")

//       // Examine every neighbor of the current vertex.
//       for (neighborVertex <- adjacencyList(currentVertex)) {
//         if (distanceFromSource(neighborVertex) == -1) {
//           // First time this neighbor has been reached — record it
//           // and schedule it for later expansion.
//           distanceFromSource(neighborVertex) = distanceFromSource(currentVertex) + 1
//           parentVertex(neighborVertex) = currentVertex
//           traversalQueue.enqueue(neighborVertex)
//         }
//       }
//     }

//     println()
//     println(s"Shortest distances from source vertex $sourceVertex:")
//     for (vertex <- 0 until vertexCount) {
//       println(s"  Vertex $vertex: \${distanceFromSource(vertex)}")
//     }
//   }

//   // Static demonstration data — an undirected graph with 6 vertices.
//   val vertexCount = 6
//   val adjacencyList: Array[mutable.ListBuffer[Int]] = Array.fill(vertexCount)(mutable.ListBuffer[Int]())

//   def addUndirectedEdge(vertexA: Int, vertexB: Int): Unit = {
//     adjacencyList(vertexA) += vertexB
//     adjacencyList(vertexB) += vertexA
//   }

//   addUndirectedEdge(0, 1)
//   addUndirectedEdge(0, 2)
//   addUndirectedEdge(1, 3)
//   addUndirectedEdge(1, 4)
//   addUndirectedEdge(2, 5)

//   breadthFirstSearch(adjacencyList, 0, vertexCount)
// }
// `,
//         "go": `package main

// import "fmt"

// // breadthFirstSearch performs a breadth-first traversal of adjacencyList
// // starting at sourceVertex, printing each vertex in the order it is
// // visited and its shortest hop-distance from the source.
// func breadthFirstSearch(adjacencyList [][]int, sourceVertex int, vertexCount int) {
// 	distanceFromSource := make([]int, vertexCount)
// 	parentVertex := make([]int, vertexCount)
// 	for vertex := 0; vertex < vertexCount; vertex++ {
// 		distanceFromSource[vertex] = -1 // -1 means "not yet reached"
// 		parentVertex[vertex] = -1
// 	}

// 	traversalQueue := []int{sourceVertex}
// 	distanceFromSource[sourceVertex] = 0

// 	queueFront := 0
// 	for queueFront < len(traversalQueue) {
// 		currentVertex := traversalQueue[queueFront]
// 		queueFront++

// 		fmt.Printf("Visiting vertex %d (distance = %d)\n", currentVertex, distanceFromSource[currentVertex])

// 		// Examine every neighbor of the current vertex.
// 		for _, neighborVertex := range adjacencyList[currentVertex] {
// 			if distanceFromSource[neighborVertex] == -1 {
// 				// First time this neighbor has been reached — record it
// 				// and schedule it for later expansion.
// 				distanceFromSource[neighborVertex] = distanceFromSource[currentVertex] + 1
// 				parentVertex[neighborVertex] = currentVertex
// 				traversalQueue = append(traversalQueue, neighborVertex)
// 			}
// 		}
// 	}

// 	fmt.Println()
// 	fmt.Printf("Shortest distances from source vertex %d:\n", sourceVertex)
// 	for vertex := 0; vertex < vertexCount; vertex++ {
// 		fmt.Printf("  Vertex %d: %d\n", vertex, distanceFromSource[vertex])
// 	}
// }

// func main() {
// 	// Static demonstration data - an undirected graph with 6 vertices.
// 	vertexCount := 6
// 	adjacencyList := make([][]int, vertexCount)

// 	addUndirectedEdge := func(vertexA int, vertexB int) {
// 		adjacencyList[vertexA] = append(adjacencyList[vertexA], vertexB)
// 		adjacencyList[vertexB] = append(adjacencyList[vertexB], vertexA)
// 	}

// 	addUndirectedEdge(0, 1)
// 	addUndirectedEdge(0, 2)
// 	addUndirectedEdge(1, 3)
// 	addUndirectedEdge(1, 4)
// 	addUndirectedEdge(2, 5)

// 	breadthFirstSearch(adjacencyList, 0, vertexCount)
// }
// `,
//         "rust": `use std::collections::VecDeque;

// // Performs a breadth-first traversal of 'adjacency_list' starting at
// // 'source_vertex', printing each vertex in the order it is visited and
// // its shortest hop-distance from the source.
// fn breadth_first_search(adjacency_list: &Vec<Vec<usize>>, source_vertex: usize, vertex_count: usize) {
//     let mut distance_from_source: Vec<i32> = vec![-1; vertex_count]; // -1 means "not yet reached"
//     let mut parent_vertex: Vec<i32> = vec![-1; vertex_count];
//     let mut traversal_queue: VecDeque<usize> = VecDeque::new();

//     // The source vertex starts the traversal at distance 0.
//     distance_from_source[source_vertex] = 0;
//     traversal_queue.push_back(source_vertex);

//     while let Some(current_vertex) = traversal_queue.pop_front() {
//         println!(
//             "Visiting vertex {} (distance = {})",
//             current_vertex, distance_from_source[current_vertex]
//         );

//         // Examine every neighbor of the current vertex.
//         for &neighbor_vertex in &adjacency_list[current_vertex] {
//             if distance_from_source[neighbor_vertex] == -1 {
//                 // First time this neighbor has been reached — record it
//                 // and schedule it for later expansion.
//                 distance_from_source[neighbor_vertex] = distance_from_source[current_vertex] + 1;
//                 parent_vertex[neighbor_vertex] = current_vertex as i32;
//                 traversal_queue.push_back(neighbor_vertex);
//             }
//         }
//     }

//     println!();
//     println!("Shortest distances from source vertex {}:", source_vertex);
//     for vertex in 0..vertex_count {
//         println!("  Vertex {}: {}", vertex, distance_from_source[vertex]);
//     }
// }

// fn main() {
//     // Static demonstration data - an undirected graph with 6 vertices.
//     let vertex_count = 6;
//     let mut adjacency_list: Vec<Vec<usize>> = vec![Vec::new(); vertex_count];

//     let mut add_undirected_edge = |vertex_a: usize, vertex_b: usize, list: &mut Vec<Vec<usize>>| {
//         list[vertex_a].push(vertex_b);
//         list[vertex_b].push(vertex_a);
//     };

//     add_undirected_edge(0, 1, &mut adjacency_list);
//     add_undirected_edge(0, 2, &mut adjacency_list);
//     add_undirected_edge(1, 3, &mut adjacency_list);
//     add_undirected_edge(1, 4, &mut adjacency_list);
//     add_undirected_edge(2, 5, &mut adjacency_list);

//     breadth_first_search(&adjacency_list, 0, vertex_count);
// }
// `
//       }
//     },
//     /* ════════════════════════════════════════════════════════════════════
//        2. TOPOLOGICAL SORT
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Topological Sort",
//       href: "/algorithms/graphs/topological-sort",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "Topological Sort" },
//         { tag: "p", text: "Topological Sort produces a linear ordering of the vertices of a Directed Acyclic Graph (DAG) such that for every directed edge u → v, u appears before v in the ordering. It only makes sense for DAGs — a graph with a cycle has no valid topological order, since cyclic dependencies create a contradiction (A must come before B, but B must also come before A)." },
//         { tag: "p", text: "Two standard approaches exist: Kahn's algorithm (BFS-based, repeatedly removing nodes with in-degree zero) and DFS-based (post-order traversal, reversed). Both run in O(V + E) and both naturally detect cycles as a side effect — Kahn's by failing to process all vertices, DFS-based by detecting a back-edge." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Build/task scheduling where some tasks depend on others completing first (build systems, package managers, course prerequisite ordering)",
//           "Detecting circular dependencies (the algorithm fails or reports a cycle if one exists)",
//           "Compiler/spreadsheet dependency resolution — determining the order to evaluate expressions",
//           "As a preprocessing step for dynamic programming on DAGs (process nodes in topological order so all dependencies are already resolved)"
//         ]},
//         { tag: "note", variant: "warning", text: "A topological order is not necessarily unique — any graph with vertices that have no dependency relationship between them admits multiple valid orderings." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(V + E)",
//         best: [
//           { tag: "h2", text: "Best Case — O(V + E)" },
//           { tag: "p", text: "Kahn's algorithm always processes every vertex once and every edge once while decrementing in-degrees, regardless of the DAG's specific shape — there's no early-exit shortcut." },
//           { tag: "ul", items: [
//             "Initial in-degree computation: scan all edges once — O(E)",
//             "Each vertex is enqueued and dequeued exactly once when its in-degree hits zero: O(V)",
//             "Each edge is examined exactly once to decrement a neighbor's in-degree: O(E)",
//             "Total: O(V + E)"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(V + E)" },
//           { tag: "p", text: "Both Kahn's and DFS-based approaches perform a fixed, structurally-determined amount of work per vertex and edge — there's no value-dependent branching that changes the iteration count." },
//           { tag: "ul", items: [
//             "DFS-based: standard DFS traversal cost, O(V + E), plus O(V) to reverse the post-order result",
//             "Kahn's: O(V + E) as above",
//             "Both approaches are asymptotically identical regardless of graph shape, as long as it's a valid DAG"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(V + E)" },
//           { tag: "p", text: "No DAG structure increases the cost beyond visiting every vertex and edge exactly once — even a graph that is 'almost' a total order (a single long chain) costs the same asymptotic O(V + E)." },
//           { tag: "ul", items: [
//             "Worst case matches best/average exactly: O(V + E)",
//             "Cycle detection (when the graph is not actually a DAG) also completes in O(V + E) — Kahn's simply terminates with fewer than V vertices processed"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(V)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(V)" },
//           { tag: "p", text: "Kahn's algorithm needs an in-degree array and a queue, both sized to V; the DFS-based approach needs a visited set and a result stack, also both O(V)." },
//           { tag: "ul", items: ["in-degree array: O(V)", "queue: up to O(V)", "result list: O(V)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(V)" },
//           { tag: "p", text: "Space usage is fixed by the number of vertices, regardless of edge density or graph shape (the adjacency list itself is typically counted as O(V + E) input, not algorithm overhead)." },
//           { tag: "ul", items: ["in-degree / visited tracking: O(V)", "output ordering: O(V)"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(V)" },
//           { tag: "p", text: "Even a graph where the entire vertex set is simultaneously 'ready' (in-degree zero) at the start keeps the queue bounded by O(V) — it can never exceed the total vertex count." },
//           { tag: "ul", items: ["Maximum queue size: O(V)", "DFS recursion stack (DFS-based variant): up to O(V) in the worst case of a single long chain"] }
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "p", text: "Kahn's algorithm (BFS-based):" },
//         { tag: "code", language: "text", text:
// `function topologicalSort(graph):
//     inDegree ← map of vertex → 0, for all vertices
//     for currentVertex in graph.vertices:
//         for neighborVertex in graph.adjacent(currentVertex):
//             inDegree[neighborVertex] ← inDegree[neighborVertex] + 1

//     readyQueue ← all vertices with inDegree == 0
//     orderedResult ← empty list

//     while readyQueue is not empty:
//         currentVertex ← dequeue(readyQueue)
//         append currentVertex to orderedResult

//         for neighborVertex in graph.adjacent(currentVertex):
//             inDegree[neighborVertex] ← inDegree[neighborVertex] − 1
//             if inDegree[neighborVertex] == 0:
//                 enqueue(readyQueue, neighborVertex)

//     if length(orderedResult) != number of vertices:
//         return CYCLE_DETECTED       // graph is not a DAG

//     return orderedResult` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Compute the in-degree (number of incoming edges) for every vertex by scanning all edges once.",
//           "Initialise a queue with every vertex that has in-degree zero — these have no unresolved dependencies and can be processed first.",
//           "Repeatedly dequeue a vertex, append it to the result ordering, and 'remove' it from the graph by decrementing the in-degree of each of its neighbors.",
//           "Whenever a neighbor's in-degree drops to zero, all its dependencies have now been satisfied — enqueue it.",
//           "If the final result contains all V vertices, it's a valid topological order. If fewer vertices were processed, the remaining vertices form a cycle (their in-degree never reaches zero because they depend on each other)."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Invariant: a vertex is only enqueued once all of its prerequisite vertices (everything with an edge pointing to it) have already been added to the result. This directly enforces the topological-order requirement: every edge u → v has u processed (and removed from consideration) before v's in-degree can reach zero. If the graph has a cycle, every vertex in that cycle perpetually has at least one unresolved incoming edge from within the cycle, so none of them can ever reach in-degree zero — correctly signalling that no valid topological order exists." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <queue>
// using namespace std;

// // Computes a topological ordering of 'adjacencyList' using Kahn's
// // algorithm. Returns an empty list and prints a warning if the graph
// // contains a cycle (i.e. is not a valid DAG).
// vector<int> topologicalSort(const vector<vector<int>>& adjacencyList, int vertexCount) {
//     vector<int> inDegree(vertexCount, 0);

//     // Compute the in-degree of every vertex by scanning all edges once.
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         for (int neighborVertex : adjacencyList[vertex]) {
//             inDegree[neighborVertex]++;
//         }
//     }

//     // Every vertex with in-degree zero has no unresolved dependencies
//     // and can be processed immediately.
//     queue<int> readyQueue;
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         if (inDegree[vertex] == 0) {
//             readyQueue.push(vertex);
//         }
//     }

//     vector<int> orderedResult;
//     while (!readyQueue.empty()) {
//         int currentVertex = readyQueue.front();
//         readyQueue.pop();
//         orderedResult.push_back(currentVertex);

//         // "Remove" currentVertex from the graph by decrementing the
//         // in-degree of every vertex it points to.
//         for (int neighborVertex : adjacencyList[currentVertex]) {
//             inDegree[neighborVertex]--;
//             if (inDegree[neighborVertex] == 0) {
//                 readyQueue.push(neighborVertex);
//             }
//         }
//     }

//     if ((int)orderedResult.size() != vertexCount) {
//         cout << "Cycle detected — the graph is not a valid DAG." << endl;
//         return {};
//     }

//     return orderedResult;
// }

// int main() {
//     // Static demonstration data — a directed acyclic graph with 6 vertices.
//     int vertexCount = 6;
//     vector<vector<int>> adjacencyList(vertexCount);

//     adjacencyList[5].push_back(2);
//     adjacencyList[5].push_back(0);
//     adjacencyList[4].push_back(0);
//     adjacencyList[4].push_back(1);
//     adjacencyList[2].push_back(3);
//     adjacencyList[3].push_back(1);

//     vector<int> topologicalOrder = topologicalSort(adjacencyList, vertexCount);

//     cout << "Topological order: ";
//     for (int vertex : topologicalOrder) {
//         cout << vertex << " ";
//     }
//     cout << endl;

//     return 0;
// }
// `,
//         "python": `from collections import deque


// def topological_sort(adjacency_list, vertex_count):
//     """
//     Computes a topological ordering of 'adjacency_list' using Kahn's
//     algorithm. Returns an empty list and prints a warning if the graph
//     contains a cycle (i.e. is not a valid DAG).
//     """
//     in_degree = [0] * vertex_count

//     # Compute the in-degree of every vertex by scanning all edges once.
//     for vertex in range(vertex_count):
//         for neighbor_vertex in adjacency_list[vertex]:
//             in_degree[neighbor_vertex] += 1

//     # Every vertex with in-degree zero has no unresolved dependencies
//     # and can be processed immediately.
//     ready_queue = deque(vertex for vertex in range(vertex_count) if in_degree[vertex] == 0)

//     ordered_result = []
//     while ready_queue:
//         current_vertex = ready_queue.popleft()
//         ordered_result.append(current_vertex)

//         # "Remove" current_vertex from the graph by decrementing the
//         # in-degree of every vertex it points to.
//         for neighbor_vertex in adjacency_list[current_vertex]:
//             in_degree[neighbor_vertex] -= 1
//             if in_degree[neighbor_vertex] == 0:
//                 ready_queue.append(neighbor_vertex)

//     if len(ordered_result) != vertex_count:
//         print("Cycle detected - the graph is not a valid DAG.")
//         return []

//     return ordered_result


// def main():
//     # Static demonstration data - a directed acyclic graph with 6 vertices.
//     vertex_count = 6
//     adjacency_list = [[] for _ in range(vertex_count)]

//     adjacency_list[5].extend([2, 0])
//     adjacency_list[4].extend([0, 1])
//     adjacency_list[2].append(3)
//     adjacency_list[3].append(1)

//     topological_order = topological_sort(adjacency_list, vertex_count)

//     print("Topological order:", topological_order)


// if __name__ == "__main__":
//     main()
// `,
//         "java": `import java.util.ArrayList;
// import java.util.LinkedList;
// import java.util.List;
// import java.util.Queue;

// public class Main {

//     // Computes a topological ordering of 'adjacencyList' using Kahn's
//     // algorithm. Returns an empty list and prints a warning if the graph
//     // contains a cycle (i.e. is not a valid DAG).
//     static List<Integer> topologicalSort(List<List<Integer>> adjacencyList, int vertexCount) {
//         int[] inDegree = new int[vertexCount];

//         // Compute the in-degree of every vertex by scanning all edges once.
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             for (int neighborVertex : adjacencyList.get(vertex)) {
//                 inDegree[neighborVertex]++;
//             }
//         }

//         // Every vertex with in-degree zero has no unresolved dependencies
//         // and can be processed immediately.
//         Queue<Integer> readyQueue = new LinkedList<>();
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             if (inDegree[vertex] == 0) {
//                 readyQueue.add(vertex);
//             }
//         }

//         List<Integer> orderedResult = new ArrayList<>();
//         while (!readyQueue.isEmpty()) {
//             int currentVertex = readyQueue.poll();
//             orderedResult.add(currentVertex);

//             // "Remove" currentVertex from the graph by decrementing the
//             // in-degree of every vertex it points to.
//             for (int neighborVertex : adjacencyList.get(currentVertex)) {
//                 inDegree[neighborVertex]--;
//                 if (inDegree[neighborVertex] == 0) {
//                     readyQueue.add(neighborVertex);
//                 }
//             }
//         }

//         if (orderedResult.size() != vertexCount) {
//             System.out.println("Cycle detected — the graph is not a valid DAG.");
//             return new ArrayList<>();
//         }

//         return orderedResult;
//     }

//     public static void main(String[] args) {
//         // Static demonstration data — a directed acyclic graph with 6 vertices.
//         int vertexCount = 6;
//         List<List<Integer>> adjacencyList = new ArrayList<>();
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             adjacencyList.add(new ArrayList<>());
//         }

//         adjacencyList.get(5).add(2);
//         adjacencyList.get(5).add(0);
//         adjacencyList.get(4).add(0);
//         adjacencyList.get(4).add(1);
//         adjacencyList.get(2).add(3);
//         adjacencyList.get(3).add(1);

//         List<Integer> topologicalOrder = topologicalSort(adjacencyList, vertexCount);

//         System.out.println("Topological order: " + topologicalOrder);
//     }
// }
// `,
//         "js": `// Computes a topological ordering of 'adjacencyList' using Kahn's
// // algorithm. Returns an empty array and prints a warning if the graph
// // contains a cycle (i.e. is not a valid DAG).
// function topologicalSort(adjacencyList, vertexCount) {
//     const inDegree = new Array(vertexCount).fill(0);

//     // Compute the in-degree of every vertex by scanning all edges once.
//     for (let vertex = 0; vertex < vertexCount; vertex++) {
//         for (const neighborVertex of adjacencyList[vertex]) {
//             inDegree[neighborVertex]++;
//         }
//     }

//     // Every vertex with in-degree zero has no unresolved dependencies
//     // and can be processed immediately.
//     const readyQueue = [];
//     for (let vertex = 0; vertex < vertexCount; vertex++) {
//         if (inDegree[vertex] === 0) {
//             readyQueue.push(vertex);
//         }
//     }

//     const orderedResult = [];
//     let queueFront = 0;

//     while (queueFront < readyQueue.length) {
//         const currentVertex = readyQueue[queueFront];
//         queueFront++;
//         orderedResult.push(currentVertex);

//         // "Remove" currentVertex from the graph by decrementing the
//         // in-degree of every vertex it points to.
//         for (const neighborVertex of adjacencyList[currentVertex]) {
//             inDegree[neighborVertex]--;
//             if (inDegree[neighborVertex] === 0) {
//                 readyQueue.push(neighborVertex);
//             }
//         }
//     }

//     if (orderedResult.length !== vertexCount) {
//         console.log("Cycle detected — the graph is not a valid DAG.");
//         return [];
//     }

//     return orderedResult;
// }

// function main() {
//     // Static demonstration data — a directed acyclic graph with 6 vertices.
//     const vertexCount = 6;
//     const adjacencyList = Array.from({ length: vertexCount }, () => []);

//     adjacencyList[5].push(2, 0);
//     adjacencyList[4].push(0, 1);
//     adjacencyList[2].push(3);
//     adjacencyList[3].push(1);

//     const topologicalOrder = topologicalSort(adjacencyList, vertexCount);

//     console.log("Topological order:", topologicalOrder);
// }

// main();
// `,
//         "c": `#include <stdio.h>
// #include <string.h>

// #define MAX_VERTICES 100

// int adjacencyList[MAX_VERTICES][MAX_VERTICES];
// int neighborCount[MAX_VERTICES];
// int inDegree[MAX_VERTICES];
// int readyQueue[MAX_VERTICES];
// int orderedResult[MAX_VERTICES];

// // Records a directed edge fromVertex -> toVertex in the fixed-size
// // adjacency list and updates the destination vertex's in-degree.
// void addDirectedEdge(int fromVertex, int toVertex) {
//     adjacencyList[fromVertex][neighborCount[fromVertex]++] = toVertex;
//     inDegree[toVertex]++;
// }

// // Computes a topological ordering using Kahn's algorithm. Returns the
// // number of vertices successfully ordered; if this is less than
// // 'vertexCount', the graph contains a cycle and is not a valid DAG.
// int topologicalSort(int vertexCount) {
//     int queueFront = 0;
//     int queueBack = 0;
//     int resultSize = 0;

//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         if (inDegree[vertex] == 0) {
//             readyQueue[queueBack++] = vertex;
//         }
//     }

//     while (queueFront < queueBack) {
//         int currentVertex = readyQueue[queueFront++];
//         orderedResult[resultSize++] = currentVertex;

//         for (int i = 0; i < neighborCount[currentVertex]; i++) {
//             int neighborVertex = adjacencyList[currentVertex][i];
//             inDegree[neighborVertex]--;
//             if (inDegree[neighborVertex] == 0) {
//                 readyQueue[queueBack++] = neighborVertex;
//             }
//         }
//     }

//     return resultSize;
// }

// int main() {
//     /* Static demonstration data - a directed acyclic graph with 6 vertices. */
//     int vertexCount = 6;
//     memset(neighborCount, 0, sizeof(neighborCount));
//     memset(inDegree, 0, sizeof(inDegree));

//     addDirectedEdge(5, 2);
//     addDirectedEdge(5, 0);
//     addDirectedEdge(4, 0);
//     addDirectedEdge(4, 1);
//     addDirectedEdge(2, 3);
//     addDirectedEdge(3, 1);

//     int resultSize = topologicalSort(vertexCount);

//     if (resultSize != vertexCount) {
//         printf("Cycle detected - the graph is not a valid DAG.\\n");
//         return 0;
//     }

//     printf("Topological order: ");
//     for (int i = 0; i < resultSize; i++) {
//         printf("%d ", orderedResult[i]);
//     }
//     printf("\\n");

//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;

// class Program {

//     // Computes a topological ordering of 'adjacencyList' using Kahn's
//     // algorithm. Returns an empty list and prints a warning if the graph
//     // contains a cycle (i.e. is not a valid DAG).
//     static List<int> TopologicalSort(List<int>[] adjacencyList, int vertexCount) {
//         int[] inDegree = new int[vertexCount];

//         // Compute the in-degree of every vertex by scanning all edges once.
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             foreach (int neighborVertex in adjacencyList[vertex]) {
//                 inDegree[neighborVertex]++;
//             }
//         }

//         // Every vertex with in-degree zero has no unresolved dependencies
//         // and can be processed immediately.
//         var readyQueue = new Queue<int>();
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             if (inDegree[vertex] == 0) {
//                 readyQueue.Enqueue(vertex);
//             }
//         }

//         var orderedResult = new List<int>();
//         while (readyQueue.Count > 0) {
//             int currentVertex = readyQueue.Dequeue();
//             orderedResult.Add(currentVertex);

//             // "Remove" currentVertex from the graph by decrementing the
//             // in-degree of every vertex it points to.
//             foreach (int neighborVertex in adjacencyList[currentVertex]) {
//                 inDegree[neighborVertex]--;
//                 if (inDegree[neighborVertex] == 0) {
//                     readyQueue.Enqueue(neighborVertex);
//                 }
//             }
//         }

//         if (orderedResult.Count != vertexCount) {
//             Console.WriteLine("Cycle detected — the graph is not a valid DAG.");
//             return new List<int>();
//         }

//         return orderedResult;
//     }

//     static void Main() {
//         // Static demonstration data — a directed acyclic graph with 6 vertices.
//         int vertexCount = 6;
//         var adjacencyList = new List<int>[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             adjacencyList[vertex] = new List<int>();
//         }

//         adjacencyList[5].AddRange(new[] { 2, 0 });
//         adjacencyList[4].AddRange(new[] { 0, 1 });
//         adjacencyList[2].Add(3);
//         adjacencyList[3].Add(1);

//         List<int> topologicalOrder = TopologicalSort(adjacencyList, vertexCount);

//         Console.WriteLine("Topological order: " + string.Join(" ", topologicalOrder));
//     }
// }
// `,
//         "swift": `import Foundation

// // Computes a topological ordering of 'adjacencyList' using Kahn's
// // algorithm. Returns an empty array and prints a warning if the graph
// // contains a cycle (i.e. is not a valid DAG).
// func topologicalSort(_ adjacencyList: [[Int]], _ vertexCount: Int) -> [Int] {
//     var inDegree = [Int](repeating: 0, count: vertexCount)

//     // Compute the in-degree of every vertex by scanning all edges once.
//     for vertex in 0..<vertexCount {
//         for neighborVertex in adjacencyList[vertex] {
//             inDegree[neighborVertex] += 1
//         }
//     }

//     // Every vertex with in-degree zero has no unresolved dependencies
//     // and can be processed immediately.
//     var readyQueue: [Int] = []
//     for vertex in 0..<vertexCount {
//         if inDegree[vertex] == 0 {
//             readyQueue.append(vertex)
//         }
//     }

//     var orderedResult: [Int] = []
//     var queueFront = 0

//     while queueFront < readyQueue.count {
//         let currentVertex = readyQueue[queueFront]
//         queueFront += 1
//         orderedResult.append(currentVertex)

//         // "Remove" currentVertex from the graph by decrementing the
//         // in-degree of every vertex it points to.
//         for neighborVertex in adjacencyList[currentVertex] {
//             inDegree[neighborVertex] -= 1
//             if inDegree[neighborVertex] == 0 {
//                 readyQueue.append(neighborVertex)
//             }
//         }
//     }

//     if orderedResult.count != vertexCount {
//         print("Cycle detected — the graph is not a valid DAG.")
//         return []
//     }

//     return orderedResult
// }

// // Static demonstration data — a directed acyclic graph with 6 vertices.
// let vertexCount = 6
// var adjacencyList = [[Int]](repeating: [], count: vertexCount)

// adjacencyList[5] = [2, 0]
// adjacencyList[4] = [0, 1]
// adjacencyList[2] = [3]
// adjacencyList[3] = [1]

// let topologicalOrder = topologicalSort(adjacencyList, vertexCount)
// print("Topological order: \\(topologicalOrder)")
// `,
//         "kotlin": `import java.util.LinkedList

// // Computes a topological ordering of 'adjacencyList' using Kahn's
// // algorithm. Returns an empty list and prints a warning if the graph
// // contains a cycle (i.e. is not a valid DAG).
// fun topologicalSort(adjacencyList: Array<MutableList<Int>>, vertexCount: Int): List<Int> {
//     val inDegree = IntArray(vertexCount)

//     // Compute the in-degree of every vertex by scanning all edges once.
//     for (vertex in 0 until vertexCount) {
//         for (neighborVertex in adjacencyList[vertex]) {
//             inDegree[neighborVertex]++
//         }
//     }

//     // Every vertex with in-degree zero has no unresolved dependencies
//     // and can be processed immediately.
//     val readyQueue: LinkedList<Int> = LinkedList()
//     for (vertex in 0 until vertexCount) {
//         if (inDegree[vertex] == 0) {
//             readyQueue.add(vertex)
//         }
//     }

//     val orderedResult = mutableListOf<Int>()
//     while (readyQueue.isNotEmpty()) {
//         val currentVertex = readyQueue.poll()
//         orderedResult.add(currentVertex)

//         // "Remove" currentVertex from the graph by decrementing the
//         // in-degree of every vertex it points to.
//         for (neighborVertex in adjacencyList[currentVertex]) {
//             inDegree[neighborVertex]--
//             if (inDegree[neighborVertex] == 0) {
//                 readyQueue.add(neighborVertex)
//             }
//         }
//     }

//     if (orderedResult.size != vertexCount) {
//         println("Cycle detected — the graph is not a valid DAG.")
//         return emptyList()
//     }

//     return orderedResult
// }

// fun main() {
//     // Static demonstration data — a directed acyclic graph with 6 vertices.
//     val vertexCount = 6
//     val adjacencyList = Array(vertexCount) { mutableListOf<Int>() }

//     adjacencyList[5].addAll(listOf(2, 0))
//     adjacencyList[4].addAll(listOf(0, 1))
//     adjacencyList[2].add(3)
//     adjacencyList[3].add(1)

//     val topologicalOrder = topologicalSort(adjacencyList, vertexCount)

//     println("Topological order: $topologicalOrder")
// }
// `,
//         "scala": `import scala.collection.mutable

// object Main extends App {

//   // Computes a topological ordering of 'adjacencyList' using Kahn's
//   // algorithm. Returns an empty list and prints a warning if the graph
//   // contains a cycle (i.e. is not a valid DAG).
//   def topologicalSort(adjacencyList: Array[mutable.ListBuffer[Int]], vertexCount: Int): List[Int] = {
//     val inDegree = Array.fill(vertexCount)(0)

//     // Compute the in-degree of every vertex by scanning all edges once.
//     for (vertex <- 0 until vertexCount; neighborVertex <- adjacencyList(vertex)) {
//       inDegree(neighborVertex) += 1
//     }

//     // Every vertex with in-degree zero has no unresolved dependencies
//     // and can be processed immediately.
//     val readyQueue = mutable.Queue[Int]()
//     for (vertex <- 0 until vertexCount if inDegree(vertex) == 0) {
//       readyQueue.enqueue(vertex)
//     }

//     val orderedResult = mutable.ListBuffer[Int]()
//     while (readyQueue.nonEmpty) {
//       val currentVertex = readyQueue.dequeue()
//       orderedResult += currentVertex

//       // "Remove" currentVertex from the graph by decrementing the
//       // in-degree of every vertex it points to.
//       for (neighborVertex <- adjacencyList(currentVertex)) {
//         inDegree(neighborVertex) -= 1
//         if (inDegree(neighborVertex) == 0) {
//           readyQueue.enqueue(neighborVertex)
//         }
//       }
//     }

//     if (orderedResult.length != vertexCount) {
//       println("Cycle detected — the graph is not a valid DAG.")
//       return List()
//     }

//     orderedResult.toList
//   }

//   // Static demonstration data — a directed acyclic graph with 6 vertices.
//   val vertexCount = 6
//   val adjacencyList: Array[mutable.ListBuffer[Int]] = Array.fill(vertexCount)(mutable.ListBuffer[Int]())

//   adjacencyList(5) ++= List(2, 0)
//   adjacencyList(4) ++= List(0, 1)
//   adjacencyList(2) += 3
//   adjacencyList(3) += 1

//   val topologicalOrder = topologicalSort(adjacencyList, vertexCount)
//   println(s"Topological order: $topologicalOrder")
// }
// `,
//         "go": `package main

// import "fmt"

// // topologicalSort computes a topological ordering of adjacencyList using
// // Kahn's algorithm. Returns nil and prints a warning if the graph
// // contains a cycle (i.e. is not a valid DAG).
// func topologicalSort(adjacencyList [][]int, vertexCount int) []int {
// 	inDegree := make([]int, vertexCount)

// 	// Compute the in-degree of every vertex by scanning all edges once.
// 	for vertex := 0; vertex < vertexCount; vertex++ {
// 		for _, neighborVertex := range adjacencyList[vertex] {
// 			inDegree[neighborVertex]++
// 		}
// 	}

// 	// Every vertex with in-degree zero has no unresolved dependencies
// 	// and can be processed immediately.
// 	readyQueue := []int{}
// 	for vertex := 0; vertex < vertexCount; vertex++ {
// 		if inDegree[vertex] == 0 {
// 			readyQueue = append(readyQueue, vertex)
// 		}
// 	}

// 	orderedResult := []int{}
// 	queueFront := 0

// 	for queueFront < len(readyQueue) {
// 		currentVertex := readyQueue[queueFront]
// 		queueFront++
// 		orderedResult = append(orderedResult, currentVertex)

// 		// "Remove" currentVertex from the graph by decrementing the
// 		// in-degree of every vertex it points to.
// 		for _, neighborVertex := range adjacencyList[currentVertex] {
// 			inDegree[neighborVertex]--
// 			if inDegree[neighborVertex] == 0 {
// 				readyQueue = append(readyQueue, neighborVertex)
// 			}
// 		}
// 	}

// 	if len(orderedResult) != vertexCount {
// 		fmt.Println("Cycle detected - the graph is not a valid DAG.")
// 		return nil
// 	}

// 	return orderedResult
// }

// func main() {
// 	// Static demonstration data - a directed acyclic graph with 6 vertices.
// 	vertexCount := 6
// 	adjacencyList := make([][]int, vertexCount)

// 	adjacencyList[5] = []int{2, 0}
// 	adjacencyList[4] = []int{0, 1}
// 	adjacencyList[2] = []int{3}
// 	adjacencyList[3] = []int{1}

// 	topologicalOrder := topologicalSort(adjacencyList, vertexCount)

// 	fmt.Println("Topological order:", topologicalOrder)
// }
// `,
//         "rust": `use std::collections::VecDeque;

// // Computes a topological ordering of 'adjacency_list' using Kahn's
// // algorithm. Returns None and prints a warning if the graph contains
// // a cycle (i.e. is not a valid DAG).
// fn topological_sort(adjacency_list: &Vec<Vec<usize>>, vertex_count: usize) -> Option<Vec<usize>> {
//     let mut in_degree: Vec<usize> = vec![0; vertex_count];

//     // Compute the in-degree of every vertex by scanning all edges once.
//     for vertex in 0..vertex_count {
//         for &neighbor_vertex in &adjacency_list[vertex] {
//             in_degree[neighbor_vertex] += 1;
//         }
//     }

//     // Every vertex with in-degree zero has no unresolved dependencies
//     // and can be processed immediately.
//     let mut ready_queue: VecDeque<usize> = VecDeque::new();
//     for vertex in 0..vertex_count {
//         if in_degree[vertex] == 0 {
//             ready_queue.push_back(vertex);
//         }
//     }

//     let mut ordered_result: Vec<usize> = Vec::new();
//     while let Some(current_vertex) = ready_queue.pop_front() {
//         ordered_result.push(current_vertex);

//         // "Remove" current_vertex from the graph by decrementing the
//         // in-degree of every vertex it points to.
//         for &neighbor_vertex in &adjacency_list[current_vertex] {
//             in_degree[neighbor_vertex] -= 1;
//             if in_degree[neighbor_vertex] == 0 {
//                 ready_queue.push_back(neighbor_vertex);
//             }
//         }
//     }

//     if ordered_result.len() != vertex_count {
//         println!("Cycle detected - the graph is not a valid DAG.");
//         return None;
//     }

//     Some(ordered_result)
// }

// fn main() {
//     // Static demonstration data - a directed acyclic graph with 6 vertices.
//     let vertex_count = 6;
//     let mut adjacency_list: Vec<Vec<usize>> = vec![Vec::new(); vertex_count];

//     adjacency_list[5] = vec![2, 0];
//     adjacency_list[4] = vec![0, 1];
//     adjacency_list[2] = vec![3];
//     adjacency_list[3] = vec![1];

//     if let Some(topological_order) = topological_sort(&adjacency_list, vertex_count) {
//         println!("Topological order: {:?}", topological_order);
//     }
// }
// `
//       }
//     },
//     /* ════════════════════════════════════════════════════════════════════
//        3. DEPTH-FIRST SEARCH (DFS)
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Depth-First Search (DFS)",
//       href: "/algorithms/graphs/dfs",
//       type: "Easy",
 
//       about: [
//         { tag: "h1", text: "Depth-First Search (DFS)" },
//         { tag: "p", text: "DFS explores a graph by going as deep as possible along each branch before backtracking — the opposite exploration order to BFS's level-by-level expansion. It can be implemented recursively (using the call stack implicitly) or iteratively (using an explicit stack), and both produce the same traversal order family." },
//         { tag: "p", text: "DFS is the foundation for a remarkably wide range of graph algorithms beyond simple traversal: cycle detection, topological sorting (via post-order), finding connected/strongly-connected components, solving mazes, and backtracking search (subsets, permutations, N-Queens) are all DFS variants or direct applications." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "You need to explore all paths or all reachable states (backtracking problems)",
//           "Cycle detection in directed or undirected graphs",
//           "Computing connected components, or as the building block for Tarjan's SCC algorithm",
//           "Topological sorting via post-order traversal",
//           "Maze-solving or any 'is there a path' connectivity question where the shortest path doesn't matter"
//         ]},
//         { tag: "note", variant: "warning", text: "Recursive DFS can hit a stack overflow on very deep or very large graphs (e.g. a long chain of millions of vertices) — an iterative implementation with an explicit stack avoids this risk for production code." }
//       ],
 
//       timeComplexityCalculation: {
//         notation: "O(V + E)",
//         best: [
//           { tag: "h2", text: "Best Case — O(V + E)" },
//           { tag: "p", text: "As a full traversal, DFS always visits every reachable vertex and examines every edge exactly once (or twice for undirected graphs) — there's no asymptotic shortcut even for the most favourable graph shape." },
//           { tag: "ul", items: [
//             "Each vertex is visited and marked exactly once: O(V)",
//             "Each edge is examined exactly once when exploring from its source vertex: O(E)",
//             "Total: O(V + E), unconditionally"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(V + E)" },
//           { tag: "p", text: "DFS performs the same fixed sequence of operations (visit, mark, recurse/push) regardless of graph shape — the total work is structurally determined by V and E alone." },
//           { tag: "ul", items: [
//             "Each vertex's adjacency list is fully scanned exactly once across the whole traversal: O(E) total across all vertices",
//             "Each vertex visit/mark operation: O(V) total",
//             "Combined: O(V + E)"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(V + E)" },
//           { tag: "p", text: "No graph structure increases DFS's cost beyond visiting every vertex and edge exactly once — this matches BFS's bound exactly, since both are exhaustive traversals differing only in exploration order." },
//           { tag: "ul", items: [
//             "Worst case identical to best/average: O(V + E)",
//             "For a dense graph, E dominates and the bound becomes O(V²), purely a consequence of edge count, not algorithmic degeneration"
//           ]}
//         ]
//       },
 
//       spaceComplexityCalculation: {
//         notation: "O(V)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(V)" },
//           { tag: "p", text: "DFS needs a visited set sized to V, plus a recursion/explicit stack that in the best case (a wide, shallow graph) stays small." },
//           { tag: "ul", items: ["visited set: O(V)", "stack depth in a wide/shallow graph: much less than V"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(V)" },
//           { tag: "p", text: "The visited set always requires O(V) space regardless of graph shape, and stack depth is bounded by the longest simple path in the graph, which is at most V." },
//           { tag: "ul", items: ["visited set: O(V)", "stack: bounded by O(V) in the worst nesting case"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(V)" },
//           { tag: "p", text: "A graph shaped like a single long chain forces the recursion/stack depth to reach V before any backtracking occurs, the maximum possible depth." },
//           { tag: "ul", items: [
//             "visited set: O(V)",
//             "Recursion stack (or explicit stack): up to O(V) in a maximally 'deep' graph (e.g. a straight-line chain of V vertices)",
//             "Total: O(V), same asymptotic class as BFS despite the very different access pattern"
//           ]}
//         ]
//       },
 
//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "p", text: "Recursive formulation:" },
//         { tag: "code", language: "text", text:
// `function dfs(graph, source):
//     visited ← empty set
//     dfsVisit(graph, source, visited)
 
// function dfsVisit(graph, u, visited):
//     visited.add(u)
//     process(u)                          // e.g. record discovery order
 
//     for v in graph.adjacent(u):
//         if v not in visited:
//             dfsVisit(graph, v, visited)` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Mark the starting vertex as visited and process it (e.g. add to traversal order).",
//           "Examine its neighbors one at a time, in whatever order the adjacency list provides.",
//           "For the first unvisited neighbor found, recurse into it immediately — going as deep as possible before considering any sibling neighbors.",
//           "When a vertex has no unvisited neighbors left, the recursive call returns ('backtracks') to its caller, which then continues checking its own remaining neighbors.",
//           "This naturally produces a depth-first exploration order, completing one entire branch before starting the next."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Invariant: a vertex is marked visited exactly once, the moment it is first discovered, which prevents infinite loops on cyclic graphs and guarantees each vertex is processed exactly once. By induction on the recursion: dfsVisit(u) correctly visits u and then recursively visits every vertex reachable from u that hasn't already been visited by an earlier call in the traversal — so starting from the source, every vertex reachable from it is eventually visited, since each unvisited neighbor triggers a recursive call that itself is guaranteed (by the inductive hypothesis) to visit everything reachable from that neighbor." }
//       ],
 
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// using namespace std;
 
// // Recursively visits currentVertex and every unvisited vertex reachable
// // from it, printing the depth-first visit order.
// void depthFirstSearchVisit(vector<vector<int>>& graphAdjacency, int currentVertex, vector<bool>& visited) {
//     visited[currentVertex] = true;
//     cout << "Visiting: " << currentVertex << endl;
 
//     for (int neighborVertex : graphAdjacency[currentVertex]) {
//         if (!visited[neighborVertex]) {
//             depthFirstSearchVisit(graphAdjacency, neighborVertex, visited);
//         }
//     }
// }
 
// // Runs a full depth-first traversal of graphAdjacency starting from sourceVertex.
// void depthFirstSearch(vector<vector<int>>& graphAdjacency, int sourceVertex, int vertexCount) {
//     vector<bool> visited(vertexCount, false);
//     depthFirstSearchVisit(graphAdjacency, sourceVertex, visited);
// }
 
// int main() {
//     int vertexCount = 6;
//     vector<vector<int>> graphAdjacency(vertexCount);
 
//     auto addUndirectedEdge = [&](int u, int v) {
//         graphAdjacency[u].push_back(v);
//         graphAdjacency[v].push_back(u);
//     };
 
//     addUndirectedEdge(0, 1);
//     addUndirectedEdge(0, 2);
//     addUndirectedEdge(1, 3);
//     addUndirectedEdge(1, 4);
//     addUndirectedEdge(2, 5);
 
//     depthFirstSearch(graphAdjacency, 0, vertexCount);
 
//     return 0;
// }
// `,
//         "python": `def depth_first_search_visit(graph_adjacency, current_vertex, visited):
//     """Recursively visits current_vertex and every unvisited vertex reachable
//     from it, printing the depth-first visit order.
//     """
//     visited[current_vertex] = True
//     print(f"Visiting: {current_vertex}")
 
//     for neighbor_vertex in graph_adjacency[current_vertex]:
//         if not visited[neighbor_vertex]:
//             depth_first_search_visit(graph_adjacency, neighbor_vertex, visited)
 
 
// def depth_first_search(graph_adjacency, source_vertex, vertex_count):
//     """Runs a full depth-first traversal starting from source_vertex."""
//     visited = [False] * vertex_count
//     depth_first_search_visit(graph_adjacency, source_vertex, visited)
 
 
// if __name__ == "__main__":
//     vertex_count = 6
//     graph_adjacency = [[] for _ in range(vertex_count)]
 
//     def add_undirected_edge(u, v):
//         graph_adjacency[u].append(v)
//         graph_adjacency[v].append(u)
 
//     add_undirected_edge(0, 1)
//     add_undirected_edge(0, 2)
//     add_undirected_edge(1, 3)
//     add_undirected_edge(1, 4)
//     add_undirected_edge(2, 5)
 
//     depth_first_search(graph_adjacency, 0, vertex_count)
// `,
//         "java": `import java.util.ArrayList;
// import java.util.List;
 
// public class Main {
 
//     // Recursively visits currentVertex and every unvisited vertex reachable
//     // from it, printing the depth-first visit order.
//     static void depthFirstSearchVisit(List<List<Integer>> graphAdjacency, int currentVertex, boolean[] visited) {
//         visited[currentVertex] = true;
//         System.out.println("Visiting: " + currentVertex);
 
//         for (int neighborVertex : graphAdjacency.get(currentVertex)) {
//             if (!visited[neighborVertex]) {
//                 depthFirstSearchVisit(graphAdjacency, neighborVertex, visited);
//             }
//         }
//     }
 
//     // Runs a full depth-first traversal starting from sourceVertex.
//     static void depthFirstSearch(List<List<Integer>> graphAdjacency, int sourceVertex, int vertexCount) {
//         boolean[] visited = new boolean[vertexCount];
//         depthFirstSearchVisit(graphAdjacency, sourceVertex, visited);
//     }
 
//     public static void main(String[] args) {
//         int vertexCount = 6;
//         List<List<Integer>> graphAdjacency = new ArrayList<>();
//         for (int i = 0; i < vertexCount; i++) graphAdjacency.add(new ArrayList<>());
 
//         int[][] edges = { {0,1}, {0,2}, {1,3}, {1,4}, {2,5} };
//         for (int[] edge : edges) {
//             graphAdjacency.get(edge[0]).add(edge[1]);
//             graphAdjacency.get(edge[1]).add(edge[0]);
//         }
 
//         depthFirstSearch(graphAdjacency, 0, vertexCount);
//     }
// }
// `,
//         "js": `// Recursively visits currentVertex and every unvisited vertex reachable
// // from it, printing the depth-first visit order.
// function depthFirstSearchVisit(graphAdjacency, currentVertex, visited) {
//     visited[currentVertex] = true;
//     console.log(\`Visiting: \${currentVertex}\`);
 
//     for (const neighborVertex of graphAdjacency[currentVertex]) {
//         if (!visited[neighborVertex]) {
//             depthFirstSearchVisit(graphAdjacency, neighborVertex, visited);
//         }
//     }
// }
 
// // Runs a full depth-first traversal starting from sourceVertex.
// function depthFirstSearch(graphAdjacency, sourceVertex, vertexCount) {
//     const visited = new Array(vertexCount).fill(false);
//     depthFirstSearchVisit(graphAdjacency, sourceVertex, visited);
// }
 
// const vertexCount = 6;
// const graphAdjacency = Array.from({ length: vertexCount }, () => []);
 
// function addUndirectedEdge(u, v) {
//     graphAdjacency[u].push(v);
//     graphAdjacency[v].push(u);
// }
 
// addUndirectedEdge(0, 1);
// addUndirectedEdge(0, 2);
// addUndirectedEdge(1, 3);
// addUndirectedEdge(1, 4);
// addUndirectedEdge(2, 5);
 
// depthFirstSearch(graphAdjacency, 0, vertexCount);
// `,
//         "c": `#include <stdio.h>
// #include <string.h>
 
// #define MAX_VERTICES 100
 
// int graphAdjacency[MAX_VERTICES][MAX_VERTICES];
// int adjacencyDegree[MAX_VERTICES];
// int visited[MAX_VERTICES];
 
// void addUndirectedEdge(int u, int v) {
//     graphAdjacency[u][adjacencyDegree[u]++] = v;
//     graphAdjacency[v][adjacencyDegree[v]++] = u;
// }
 
// // Recursively visits currentVertex and every unvisited vertex reachable
// // from it, printing the depth-first visit order.
// void depthFirstSearchVisit(int currentVertex) {
//     visited[currentVertex] = 1;
//     printf("Visiting: %d\\n", currentVertex);
 
//     for (int i = 0; i < adjacencyDegree[currentVertex]; i++) {
//         int neighborVertex = graphAdjacency[currentVertex][i];
//         if (!visited[neighborVertex]) {
//             depthFirstSearchVisit(neighborVertex);
//         }
//     }
// }
 
// int main() {
//     int vertexCount = 6;
//     memset(adjacencyDegree, 0, sizeof(adjacencyDegree));
//     memset(visited, 0, sizeof(visited));
 
//     addUndirectedEdge(0, 1);
//     addUndirectedEdge(0, 2);
//     addUndirectedEdge(1, 3);
//     addUndirectedEdge(1, 4);
//     addUndirectedEdge(2, 5);
 
//     depthFirstSearchVisit(0);
 
//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;
 
// class Program {
//     // Recursively visits currentVertex and every unvisited vertex reachable
//     // from it, printing the depth-first visit order.
//     static void DepthFirstSearchVisit(List<int>[] graphAdjacency, int currentVertex, bool[] visited) {
//         visited[currentVertex] = true;
//         Console.WriteLine($"Visiting: {currentVertex}");
 
//         foreach (int neighborVertex in graphAdjacency[currentVertex]) {
//             if (!visited[neighborVertex]) {
//                 DepthFirstSearchVisit(graphAdjacency, neighborVertex, visited);
//             }
//         }
//     }
 
//     // Runs a full depth-first traversal starting from sourceVertex.
//     static void DepthFirstSearch(List<int>[] graphAdjacency, int sourceVertex, int vertexCount) {
//         bool[] visited = new bool[vertexCount];
//         DepthFirstSearchVisit(graphAdjacency, sourceVertex, visited);
//     }
 
//     static void Main() {
//         int vertexCount = 6;
//         var graphAdjacency = new List<int>[vertexCount];
//         for (int i = 0; i < vertexCount; i++) graphAdjacency[i] = new List<int>();
 
//         int[][] edges = { new[]{0,1}, new[]{0,2}, new[]{1,3}, new[]{1,4}, new[]{2,5} };
//         foreach (var edge in edges) {
//             graphAdjacency[edge[0]].Add(edge[1]);
//             graphAdjacency[edge[1]].Add(edge[0]);
//         }
 
//         DepthFirstSearch(graphAdjacency, 0, vertexCount);
//     }
// }
// `,
//         "swift": `import Foundation
 
// // Recursively visits currentVertex and every unvisited vertex reachable
// // from it, printing the depth-first visit order.
// func depthFirstSearchVisit(_ graphAdjacency: [[Int]], currentVertex: Int, visited: inout [Bool]) {
//     visited[currentVertex] = true
//     print("Visiting: \\(currentVertex)")
 
//     for neighborVertex in graphAdjacency[currentVertex] {
//         if !visited[neighborVertex] {
//             depthFirstSearchVisit(graphAdjacency, currentVertex: neighborVertex, visited: &visited)
//         }
//     }
// }
 
// // Runs a full depth-first traversal starting from sourceVertex.
// func depthFirstSearch(_ graphAdjacency: [[Int]], sourceVertex: Int, vertexCount: Int) {
//     var visited = Array(repeating: false, count: vertexCount)
//     depthFirstSearchVisit(graphAdjacency, currentVertex: sourceVertex, visited: &visited)
// }
 
// let vertexCount = 6
// var graphAdjacency = [[Int]](repeating: [], count: vertexCount)
 
// func addUndirectedEdge(_ u: Int, _ v: Int) {
//     graphAdjacency[u].append(v)
//     graphAdjacency[v].append(u)
// }
 
// addUndirectedEdge(0, 1)
// addUndirectedEdge(0, 2)
// addUndirectedEdge(1, 3)
// addUndirectedEdge(1, 4)
// addUndirectedEdge(2, 5)
 
// depthFirstSearch(graphAdjacency, sourceVertex: 0, vertexCount: vertexCount)
// `,
//         "kotlin": `// Recursively visits currentVertex and every unvisited vertex reachable
// // from it, printing the depth-first visit order.
// fun depthFirstSearchVisit(graphAdjacency: Array<MutableList<Int>>, currentVertex: Int, visited: BooleanArray) {
//     visited[currentVertex] = true
//     println("Visiting: $currentVertex")
 
//     for (neighborVertex in graphAdjacency[currentVertex]) {
//         if (!visited[neighborVertex]) {
//             depthFirstSearchVisit(graphAdjacency, neighborVertex, visited)
//         }
//     }
// }
 
// // Runs a full depth-first traversal starting from sourceVertex.
// fun depthFirstSearch(graphAdjacency: Array<MutableList<Int>>, sourceVertex: Int, vertexCount: Int) {
//     val visited = BooleanArray(vertexCount)
//     depthFirstSearchVisit(graphAdjacency, sourceVertex, visited)
// }
 
// fun main() {
//     val vertexCount = 6
//     val graphAdjacency = Array(vertexCount) { mutableListOf<Int>() }
 
//     fun addUndirectedEdge(u: Int, v: Int) {
//         graphAdjacency[u].add(v)
//         graphAdjacency[v].add(u)
//     }
 
//     addUndirectedEdge(0, 1)
//     addUndirectedEdge(0, 2)
//     addUndirectedEdge(1, 3)
//     addUndirectedEdge(1, 4)
//     addUndirectedEdge(2, 5)
 
//     depthFirstSearch(graphAdjacency, 0, vertexCount)
// }
// `,
//         "scala": `import scala.collection.mutable
 
// object Main extends App {
//     // Recursively visits currentVertex and every unvisited vertex reachable
//     // from it, printing the depth-first visit order.
//     def depthFirstSearchVisit(graphAdjacency: Array[mutable.ListBuffer[Int]], currentVertex: Int, visited: Array[Boolean]): Unit = {
//         visited(currentVertex) = true
//         println(s"Visiting: $currentVertex")
 
//         for (neighborVertex <- graphAdjacency(currentVertex)) {
//             if (!visited(neighborVertex)) {
//                 depthFirstSearchVisit(graphAdjacency, neighborVertex, visited)
//             }
//         }
//     }
 
//     // Runs a full depth-first traversal starting from sourceVertex.
//     def depthFirstSearch(graphAdjacency: Array[mutable.ListBuffer[Int]], sourceVertex: Int, vertexCount: Int): Unit = {
//         val visited = Array.fill(vertexCount)(false)
//         depthFirstSearchVisit(graphAdjacency, sourceVertex, visited)
//     }
 
//     val vertexCount = 6
//     val graphAdjacency = Array.fill(vertexCount)(mutable.ListBuffer[Int]())
 
//     def addUndirectedEdge(u: Int, v: Int): Unit = {
//         graphAdjacency(u) += v
//         graphAdjacency(v) += u
//     }
 
//     addUndirectedEdge(0, 1)
//     addUndirectedEdge(0, 2)
//     addUndirectedEdge(1, 3)
//     addUndirectedEdge(1, 4)
//     addUndirectedEdge(2, 5)
 
//     depthFirstSearch(graphAdjacency, 0, vertexCount)
// }
// `,
//         "go": `package main
 
// import "fmt"
 
// // depthFirstSearchVisit recursively visits currentVertex and every
// // unvisited vertex reachable from it, printing the depth-first visit order.
// func depthFirstSearchVisit(graphAdjacency [][]int, currentVertex int, visited []bool) {
//     visited[currentVertex] = true
//     fmt.Printf("Visiting: %d\\n", currentVertex)
 
//     for _, neighborVertex := range graphAdjacency[currentVertex] {
//         if !visited[neighborVertex] {
//             depthFirstSearchVisit(graphAdjacency, neighborVertex, visited)
//         }
//     }
// }
 
// // depthFirstSearch runs a full depth-first traversal starting from sourceVertex.
// func depthFirstSearch(graphAdjacency [][]int, sourceVertex int, vertexCount int) {
//     visited := make([]bool, vertexCount)
//     depthFirstSearchVisit(graphAdjacency, sourceVertex, visited)
// }
 
// func main() {
//     vertexCount := 6
//     graphAdjacency := make([][]int, vertexCount)
 
//     addUndirectedEdge := func(u, v int) {
//         graphAdjacency[u] = append(graphAdjacency[u], v)
//         graphAdjacency[v] = append(graphAdjacency[v], u)
//     }
 
//     addUndirectedEdge(0, 1)
//     addUndirectedEdge(0, 2)
//     addUndirectedEdge(1, 3)
//     addUndirectedEdge(1, 4)
//     addUndirectedEdge(2, 5)
 
//     depthFirstSearch(graphAdjacency, 0, vertexCount)
// }
// `,
//         "rust": `// Recursively visits current_vertex and every unvisited vertex reachable
// // from it, printing the depth-first visit order.
// fn depth_first_search_visit(graph_adjacency: &Vec<Vec<usize>>, current_vertex: usize, visited: &mut Vec<bool>) {
//     visited[current_vertex] = true;
//     println!("Visiting: {}", current_vertex);
 
//     for &neighbor_vertex in &graph_adjacency[current_vertex] {
//         if !visited[neighbor_vertex] {
//             depth_first_search_visit(graph_adjacency, neighbor_vertex, visited);
//         }
//     }
// }
 
// // Runs a full depth-first traversal starting from source_vertex.
// fn depth_first_search(graph_adjacency: &Vec<Vec<usize>>, source_vertex: usize, vertex_count: usize) {
//     let mut visited = vec![false; vertex_count];
//     depth_first_search_visit(graph_adjacency, source_vertex, &mut visited);
// }
 
// fn main() {
//     let vertex_count = 6;
//     let mut graph_adjacency: Vec<Vec<usize>> = vec![vec![]; vertex_count];
 
//     let mut add_undirected_edge = |graph: &mut Vec<Vec<usize>>, u: usize, v: usize| {
//         graph[u].push(v);
//         graph[v].push(u);
//     };
 
//     add_undirected_edge(&mut graph_adjacency, 0, 1);
//     add_undirected_edge(&mut graph_adjacency, 0, 2);
//     add_undirected_edge(&mut graph_adjacency, 1, 3);
//     add_undirected_edge(&mut graph_adjacency, 1, 4);
//     add_undirected_edge(&mut graph_adjacency, 2, 5);
 
//     depth_first_search(&graph_adjacency, 0, vertex_count);
// }
// `
//       }
//     },
 
//     /* ════════════════════════════════════════════════════════════════════
//        4. DIJKSTRA'S ALGORITHM
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Dijkstra's Algorithm",
//       href: "/algorithms/graphs/dijkstra",
//       type: "Medium",
 
//       about: [
//         { tag: "h1", text: "Dijkstra's Algorithm" },
//         { tag: "p", text: "Dijkstra's Algorithm, devised by Edsger Dijkstra in 1956, finds the shortest path from a single source vertex to every other vertex in a weighted graph with non-negative edge weights. It greedily expands outward from the source, always finalising the closest not-yet-finalised vertex next, using a priority queue (min-heap) to efficiently find that closest vertex at every step." },
//         { tag: "p", text: "It can be thought of as a weighted generalisation of BFS: where BFS uses a plain queue and treats every edge as cost 1, Dijkstra uses a priority queue ordered by cumulative path cost, allowing it to correctly handle edges of different weights while still guaranteeing the first-finalised distance for each vertex is its true shortest distance." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Single-source shortest path on a weighted graph with all non-negative edge weights",
//           "Routing/navigation problems (e.g. road networks where edge weight = distance or time)",
//           "Network routing protocols (e.g. OSPF uses a Dijkstra-based approach)",
//           "Any problem reducible to 'minimum cost to reach state X from state Y' where costs are non-negative"
//         ]},
//         { tag: "note", variant: "warning", text: "Dijkstra produces silently incorrect results in the presence of negative edge weights — it does not raise an error, it just returns a wrong shortest-path value, since its greedy finalisation assumes distances only ever increase." }
//       ],
 
//       timeComplexityCalculation: {
//         notation: "O((V + E) log V)",
//         best: [
//           { tag: "h2", text: "Best Case — O((V + E) log V)" },
//           { tag: "p", text: "Using a binary heap priority queue, every vertex extraction and every edge relaxation costs O(log V), and the algorithm always processes every reachable vertex and edge at least once — there's no shortcut even for the most favourable weight distribution." },
//           { tag: "ul", items: [
//             "Each of the V vertices is extracted from the priority queue exactly once: O(V log V)",
//             "Each of the E edges can trigger at most one decrease-key/insert operation: O(E log V)",
//             "Combined: O((V + E) log V)"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O((V + E) log V)" },
//           { tag: "p", text: "The binary-heap-based implementation performs the same structural sequence of extract-min and insert/decrease-key operations regardless of the specific edge weight values, only their relative ordering affects which vertex gets extracted when, not the asymptotic operation count." },
//           { tag: "ul", items: [
//             "V extract-min operations: O(V log V)",
//             "Up to E insert/decrease-key operations (one potential relaxation per edge): O(E log V)",
//             "Total: O((V + E) log V), the standard binary-heap bound"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O((V + E) log V)" },
//           { tag: "p", text: "No edge-weight configuration increases Dijkstra's asymptotic cost beyond the standard bound — even a fully dense graph where every edge triggers a relaxation still fits within this envelope." },
//           { tag: "ul", items: [
//             "Worst case matches best/average: O((V + E) log V) with a binary heap",
//             "Using a Fibonacci heap instead, this improves to O(E + V log V), since decrease-key becomes O(1) amortised — relevant for very dense graphs",
//             "For a dense graph (E ≈ V²), an adjacency-matrix-based O(V²) implementation (without a heap) can actually outperform the heap-based version, since the heap overhead isn't worth it when nearly every edge exists"
//           ]}
//         ]
//       },
 
//       spaceComplexityCalculation: {
//         notation: "O(V)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(V)" },
//           { tag: "p", text: "Dijkstra maintains a distance array, a visited/finalised set, and a priority queue, all sized proportional to the number of vertices." },
//           { tag: "ul", items: ["distance array: O(V)", "priority queue: up to O(V) entries", "visited/finalised set: O(V)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(V)" },
//           { tag: "p", text: "Space usage is fixed by vertex count, since the distance and visited tracking structures must accommodate every vertex regardless of how the priority queue churns through insertions." },
//           { tag: "ul", items: ["distance[], visited[]: O(V) each", "priority queue contents: bounded by O(V) distinct vertices (with decrease-key) or O(E) lazy entries (with lazy deletion)"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(V + E)" },
//           { tag: "p", text: "Implementations using 'lazy deletion' (inserting a new priority queue entry on every relaxation instead of updating in place) can grow the queue to O(E) entries in the worst case, though logical vertex-tracking arrays remain O(V)." },
//           { tag: "ul", items: [
//             "distance[], visited[]: O(V)",
//             "Lazy-deletion priority queue: up to O(E) stale entries in the worst case",
//             "True decrease-key-based implementations keep the queue strictly at O(V), trading implementation complexity for tighter space"
//           ]}
//         ]
//       },
 
//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function dijkstra(graph, source):
//     distance ← map of vertex → infinity, for all vertices
//     distance[source] ← 0
//     pq ← min-priority-queue, ordered by distance
//     pq.insert(source, 0)
//     visited ← empty set
 
//     while pq is not empty:
//         (u, d) ← pq.extractMin()
//         if u in visited:
//             continue                       // stale entry, skip
//         visited.add(u)
 
//         for (v, weight) in graph.adjacent(u):
//             if v not in visited:
//                 newDist ← distance[u] + weight
//                 if newDist < distance[v]:
//                     distance[v] ← newDist
//                     pq.insert(v, newDist)   // or decreaseKey(v, newDist)
 
//     return distance` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Initialise every vertex's distance to infinity except the source, which is 0.",
//           "Use a priority queue to always extract the not-yet-finalised vertex with the smallest known distance.",
//           "Once a vertex is extracted and finalised, its distance is guaranteed correct and will never be updated again — mark it visited.",
//           "For each neighbor of the just-finalised vertex, check if reaching it through the current vertex gives a shorter path than previously known — this is called 'relaxing' the edge.",
//           "If a shorter path is found, update the neighbor's distance and push the new, better distance onto the priority queue.",
//           "Repeat until the priority queue is empty — every reachable vertex has been finalised with its true shortest distance."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "The key invariant relies on non-negative weights: when a vertex u is extracted from the priority queue, its current distance value is provably its true shortest distance from the source. This holds because every vertex still in the queue has a distance ≥ u's distance (by the min-heap property), and since all edge weights are non-negative, any path through a not-yet-finalised vertex could only be longer or equal — never shorter — than the direct path already found to u. This greedy 'finalise the closest vertex first' strategy therefore never needs to revisit or correct an already-finalised vertex, which is exactly what breaks down if negative weights are allowed." }
//       ],
 
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <queue>
// #include <climits>
// using namespace std;
 
// typedef pair<int, int> WeightVertexPair; // (weight-so-far, vertex)
 
// // Computes the shortest distance from sourceVertex to every other vertex in
// // graphAdjacency, where each edge is stored as (weight, neighborVertex).
// vector<int> dijkstraShortestPaths(vector<vector<WeightVertexPair>>& graphAdjacency, int sourceVertex, int vertexCount) {
//     vector<int> shortestDistance(vertexCount, INT_MAX);
//     priority_queue<WeightVertexPair, vector<WeightVertexPair>, greater<WeightVertexPair>> minPriorityQueue;
 
//     shortestDistance[sourceVertex] = 0;
//     minPriorityQueue.push({0, sourceVertex});
 
//     while (!minPriorityQueue.empty()) {
//         auto [currentDistance, currentVertex] = minPriorityQueue.top();
//         minPriorityQueue.pop();
 
//         // A stale queue entry: we've already found a better path since this was pushed.
//         if (currentDistance > shortestDistance[currentVertex]) continue;
 
//         for (auto [edgeWeight, neighborVertex] : graphAdjacency[currentVertex]) {
//             int candidateDistance = shortestDistance[currentVertex] + edgeWeight;
//             if (candidateDistance < shortestDistance[neighborVertex]) {
//                 shortestDistance[neighborVertex] = candidateDistance;
//                 minPriorityQueue.push({shortestDistance[neighborVertex], neighborVertex});
//             }
//         }
//     }
 
//     return shortestDistance;
// }
 
// int main() {
//     int vertexCount = 5;
//     vector<vector<WeightVertexPair>> graphAdjacency(vertexCount);
 
//     auto addUndirectedWeightedEdge = [&](int u, int v, int weight) {
//         graphAdjacency[u].push_back({weight, v});
//         graphAdjacency[v].push_back({weight, u});
//     };
 
//     addUndirectedWeightedEdge(0, 1, 10);
//     addUndirectedWeightedEdge(0, 2, 3);
//     addUndirectedWeightedEdge(1, 2, 1);
//     addUndirectedWeightedEdge(1, 3, 2);
//     addUndirectedWeightedEdge(2, 3, 8);
//     addUndirectedWeightedEdge(2, 4, 2);
//     addUndirectedWeightedEdge(3, 4, 7);
 
//     vector<int> shortestDistances = dijkstraShortestPaths(graphAdjacency, 0, vertexCount);
 
//     cout << "Shortest distances from vertex 0:" << endl;
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         cout << "  Vertex " << vertex << ": " << shortestDistances[vertex] << endl;
//     }
 
//     return 0;
// }
// `,
//         "python": `import heapq
 
 
// def dijkstra_shortest_paths(graph_adjacency, source_vertex, vertex_count):
//     """Computes the shortest distance from source_vertex to every other
//     vertex in graph_adjacency, where each edge is stored as (weight, neighbor).
//     """
//     shortest_distance = [float("inf")] * vertex_count
//     shortest_distance[source_vertex] = 0
//     min_priority_queue = [(0, source_vertex)]  # (distance-so-far, vertex)
 
//     while min_priority_queue:
//         current_distance, current_vertex = heapq.heappop(min_priority_queue)
 
//         # A stale queue entry: we've already found a better path since this was pushed.
//         if current_distance > shortest_distance[current_vertex]:
//             continue
 
//         for edge_weight, neighbor_vertex in graph_adjacency[current_vertex]:
//             candidate_distance = shortest_distance[current_vertex] + edge_weight
//             if candidate_distance < shortest_distance[neighbor_vertex]:
//                 shortest_distance[neighbor_vertex] = candidate_distance
//                 heapq.heappush(min_priority_queue, (candidate_distance, neighbor_vertex))
 
//     return shortest_distance
 
 
// if __name__ == "__main__":
//     vertex_count = 5
//     graph_adjacency = [[] for _ in range(vertex_count)]
 
//     def add_undirected_weighted_edge(u, v, weight):
//         graph_adjacency[u].append((weight, v))
//         graph_adjacency[v].append((weight, u))
 
//     add_undirected_weighted_edge(0, 1, 10)
//     add_undirected_weighted_edge(0, 2, 3)
//     add_undirected_weighted_edge(1, 2, 1)
//     add_undirected_weighted_edge(1, 3, 2)
//     add_undirected_weighted_edge(2, 3, 8)
//     add_undirected_weighted_edge(2, 4, 2)
//     add_undirected_weighted_edge(3, 4, 7)
 
//     shortest_distances = dijkstra_shortest_paths(graph_adjacency, 0, vertex_count)
 
//     print("Shortest distances from vertex 0:")
//     for vertex in range(vertex_count):
//         print(f"  Vertex {vertex}: {shortest_distances[vertex]}")
// `,
//         "java": `import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.Comparator;
// import java.util.List;
// import java.util.PriorityQueue;
 
// public class Main {
 
//     // Computes the shortest distance from sourceVertex to every other
//     // vertex in graphAdjacency, where each edge is stored as {neighbor, weight}.
//     static int[] dijkstraShortestPaths(List<int[]>[] graphAdjacency, int sourceVertex, int vertexCount) {
//         int[] shortestDistance = new int[vertexCount];
//         Arrays.fill(shortestDistance, Integer.MAX_VALUE);
//         shortestDistance[sourceVertex] = 0;
 
//         // Each queue entry is {distance-so-far, vertex}, ordered by distance.
//         PriorityQueue<int[]> minPriorityQueue = new PriorityQueue<>(Comparator.comparingInt(entry -> entry[0]));
//         minPriorityQueue.offer(new int[] { 0, sourceVertex });
 
//         while (!minPriorityQueue.isEmpty()) {
//             int[] top = minPriorityQueue.poll();
//             int currentDistance = top[0];
//             int currentVertex = top[1];
 
//             // A stale queue entry: we've already found a better path since this was pushed.
//             if (currentDistance > shortestDistance[currentVertex]) continue;
 
//             for (int[] edge : graphAdjacency[currentVertex]) {
//                 int neighborVertex = edge[0];
//                 int edgeWeight = edge[1];
//                 int candidateDistance = shortestDistance[currentVertex] + edgeWeight;
 
//                 if (candidateDistance < shortestDistance[neighborVertex]) {
//                     shortestDistance[neighborVertex] = candidateDistance;
//                     minPriorityQueue.offer(new int[] { candidateDistance, neighborVertex });
//                 }
//             }
//         }
 
//         return shortestDistance;
//     }
 
//     public static void main(String[] args) {
//         int vertexCount = 5;
//         @SuppressWarnings("unchecked")
//         List<int[]>[] graphAdjacency = new List[vertexCount];
//         for (int i = 0; i < vertexCount; i++) graphAdjacency[i] = new ArrayList<>();
 
//         int[][] edges = { {0,1,10}, {0,2,3}, {1,2,1}, {1,3,2}, {2,3,8}, {2,4,2}, {3,4,7} };
//         for (int[] edge : edges) {
//             int u = edge[0], v = edge[1], weight = edge[2];
//             graphAdjacency[u].add(new int[] { v, weight });
//             graphAdjacency[v].add(new int[] { u, weight });
//         }
 
//         int[] shortestDistances = dijkstraShortestPaths(graphAdjacency, 0, vertexCount);
 
//         System.out.println("Shortest distances from vertex 0:");
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             System.out.println("  Vertex " + vertex + ": " + shortestDistances[vertex]);
//         }
//     }
// }
// `,
//         "js": `// A minimal binary min-heap keyed by the first element of each pushed
// // array, used to implement the priority queue Dijkstra's algorithm needs.
// class MinPriorityQueue {
//     constructor() {
//         this.heap = [];
//     }
 
//     get size() {
//         return this.heap.length;
//     }
 
//     push(entry) {
//         this.heap.push(entry);
//         this._siftUp(this.heap.length - 1);
//     }
 
//     pop() {
//         const top = this.heap[0];
//         const last = this.heap.pop();
//         if (this.heap.length > 0) {
//             this.heap[0] = last;
//             this._siftDown(0);
//         }
//         return top;
//     }
 
//     _siftUp(index) {
//         while (index > 0) {
//             const parentIndex = (index - 1) >> 1;
//             if (this.heap[parentIndex][0] <= this.heap[index][0]) break;
//             [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
//             index = parentIndex;
//         }
//     }
 
//     _siftDown(index) {
//         const n = this.heap.length;
//         while (true) {
//             let smallest = index;
//             const left = 2 * index + 1;
//             const right = 2 * index + 2;
//             if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
//             if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
//             if (smallest === index) break;
//             [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
//             index = smallest;
//         }
//     }
// }
 
// // Computes the shortest distance from sourceVertex to every other vertex in
// // graphAdjacency, where each edge is stored as [neighborVertex, weight].
// function dijkstraShortestPaths(graphAdjacency, sourceVertex, vertexCount) {
//     const shortestDistance = new Array(vertexCount).fill(Infinity);
//     shortestDistance[sourceVertex] = 0;
 
//     const minPriorityQueue = new MinPriorityQueue();
//     minPriorityQueue.push([0, sourceVertex]); // [distance-so-far, vertex]
 
//     while (minPriorityQueue.size > 0) {
//         const [currentDistance, currentVertex] = minPriorityQueue.pop();
 
//         // A stale queue entry: we've already found a better path since this was pushed.
//         if (currentDistance > shortestDistance[currentVertex]) continue;
 
//         for (const [neighborVertex, edgeWeight] of graphAdjacency[currentVertex]) {
//             const candidateDistance = shortestDistance[currentVertex] + edgeWeight;
//             if (candidateDistance < shortestDistance[neighborVertex]) {
//                 shortestDistance[neighborVertex] = candidateDistance;
//                 minPriorityQueue.push([candidateDistance, neighborVertex]);
//             }
//         }
//     }
 
//     return shortestDistance;
// }
 
// const vertexCount = 5;
// const graphAdjacency = Array.from({ length: vertexCount }, () => []);
 
// function addUndirectedWeightedEdge(u, v, weight) {
//     graphAdjacency[u].push([v, weight]);
//     graphAdjacency[v].push([u, weight]);
// }
 
// addUndirectedWeightedEdge(0, 1, 10);
// addUndirectedWeightedEdge(0, 2, 3);
// addUndirectedWeightedEdge(1, 2, 1);
// addUndirectedWeightedEdge(1, 3, 2);
// addUndirectedWeightedEdge(2, 3, 8);
// addUndirectedWeightedEdge(2, 4, 2);
// addUndirectedWeightedEdge(3, 4, 7);
 
// const shortestDistances = dijkstraShortestPaths(graphAdjacency, 0, vertexCount);
 
// console.log("Shortest distances from vertex 0:");
// for (let vertex = 0; vertex < vertexCount; vertex++) {
//     console.log(\`  Vertex \${vertex}: \${shortestDistances[vertex]}\`);
// }
// `,
//         "c": `#include <stdio.h>
// #include <limits.h>
// #include <string.h>
 
// #define MAX_VERTICES 100
// #define INFINITY_DISTANCE INT_MAX
 
// int graphAdjacency[MAX_VERTICES][MAX_VERTICES];
// int edgeWeight[MAX_VERTICES][MAX_VERTICES];
// int adjacencyDegree[MAX_VERTICES];
// int shortestDistance[MAX_VERTICES];
// int finalised[MAX_VERTICES];
 
// void addUndirectedWeightedEdge(int u, int v, int weight) {
//     graphAdjacency[u][adjacencyDegree[u]] = v;
//     edgeWeight[u][adjacencyDegree[u]++] = weight;
//     graphAdjacency[v][adjacencyDegree[v]] = u;
//     edgeWeight[v][adjacencyDegree[v]++] = weight;
// }
 
// // Computes the shortest distance from sourceVertex to every other vertex.
// // Uses a simple O(V^2) linear scan for the minimum instead of a binary
// // heap, which keeps this demonstration self-contained without needing a
// // custom priority-queue implementation in plain C.
// void dijkstraShortestPaths(int sourceVertex, int vertexCount) {
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         shortestDistance[vertex] = INFINITY_DISTANCE;
//         finalised[vertex] = 0;
//     }
//     shortestDistance[sourceVertex] = 0;
 
//     for (int iteration = 0; iteration < vertexCount; iteration++) {
//         // Find the not-yet-finalised vertex with the smallest known distance.
//         int currentVertex = -1;
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             if (!finalised[vertex] &&
//                 (currentVertex == -1 || shortestDistance[vertex] < shortestDistance[currentVertex])) {
//                 currentVertex = vertex;
//             }
//         }
 
//         if (currentVertex == -1 || shortestDistance[currentVertex] == INFINITY_DISTANCE) break;
//         finalised[currentVertex] = 1;
 
//         for (int i = 0; i < adjacencyDegree[currentVertex]; i++) {
//             int neighborVertex = graphAdjacency[currentVertex][i];
//             int weight = edgeWeight[currentVertex][i];
 
//             if (!finalised[neighborVertex] &&
//                 shortestDistance[currentVertex] + weight < shortestDistance[neighborVertex]) {
//                 shortestDistance[neighborVertex] = shortestDistance[currentVertex] + weight;
//             }
//         }
//     }
// }
 
// int main() {
//     int vertexCount = 5;
//     memset(adjacencyDegree, 0, sizeof(adjacencyDegree));
 
//     addUndirectedWeightedEdge(0, 1, 10);
//     addUndirectedWeightedEdge(0, 2, 3);
//     addUndirectedWeightedEdge(1, 2, 1);
//     addUndirectedWeightedEdge(1, 3, 2);
//     addUndirectedWeightedEdge(2, 3, 8);
//     addUndirectedWeightedEdge(2, 4, 2);
//     addUndirectedWeightedEdge(3, 4, 7);
 
//     dijkstraShortestPaths(0, vertexCount);
 
//     printf("Shortest distances from vertex 0:\\n");
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         printf("  Vertex %d: %d\\n", vertex, shortestDistance[vertex]);
//     }
 
//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;
 
// class Program {
//     // Computes the shortest distance from sourceVertex to every other
//     // vertex in graphAdjacency, where each edge is stored as (neighbor, weight).
//     static int[] DijkstraShortestPaths(List<(int Neighbor, int Weight)>[] graphAdjacency, int sourceVertex, int vertexCount) {
//         int[] shortestDistance = new int[vertexCount];
//         Array.Fill(shortestDistance, int.MaxValue);
//         shortestDistance[sourceVertex] = 0;
 
//         // .NET has no built-in priority queue pre-6.0, so we use a sorted
//         // set of (distance, vertex) tuples, which naturally orders by distance.
//         var minPriorityQueue = new SortedSet<(int Distance, int Vertex)>();
//         minPriorityQueue.Add((0, sourceVertex));
 
//         while (minPriorityQueue.Count > 0) {
//             var (currentDistance, currentVertex) = minPriorityQueue.Min;
//             minPriorityQueue.Remove(minPriorityQueue.Min);
 
//             // A stale queue entry: we've already found a better path since this was pushed.
//             if (currentDistance > shortestDistance[currentVertex]) continue;
 
//             foreach (var (neighborVertex, edgeWeight) in graphAdjacency[currentVertex]) {
//                 int candidateDistance = shortestDistance[currentVertex] + edgeWeight;
//                 if (candidateDistance < shortestDistance[neighborVertex]) {
//                     minPriorityQueue.Remove((shortestDistance[neighborVertex], neighborVertex));
//                     shortestDistance[neighborVertex] = candidateDistance;
//                     minPriorityQueue.Add((candidateDistance, neighborVertex));
//                 }
//             }
//         }
 
//         return shortestDistance;
//     }
 
//     static void Main() {
//         int vertexCount = 5;
//         var graphAdjacency = new List<(int, int)>[vertexCount];
//         for (int i = 0; i < vertexCount; i++) graphAdjacency[i] = new List<(int, int)>();
 
//         void AddUndirectedWeightedEdge(int u, int v, int weight) {
//             graphAdjacency[u].Add((v, weight));
//             graphAdjacency[v].Add((u, weight));
//         }
 
//         AddUndirectedWeightedEdge(0, 1, 10);
//         AddUndirectedWeightedEdge(0, 2, 3);
//         AddUndirectedWeightedEdge(1, 2, 1);
//         AddUndirectedWeightedEdge(1, 3, 2);
//         AddUndirectedWeightedEdge(2, 3, 8);
//         AddUndirectedWeightedEdge(2, 4, 2);
//         AddUndirectedWeightedEdge(3, 4, 7);
 
//         int[] shortestDistances = DijkstraShortestPaths(graphAdjacency, 0, vertexCount);
 
//         Console.WriteLine("Shortest distances from vertex 0:");
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             Console.WriteLine($"  Vertex {vertex}: {shortestDistances[vertex]}");
//         }
//     }
// }
// `,
//         "swift": `import Foundation
 
// // Computes the shortest distance from sourceVertex to every other vertex in
// // graphAdjacency, where each edge is stored as (neighbor, weight). Uses a
// // simple O(V^2) linear scan for the minimum, which keeps this
// // self-contained without needing a custom heap implementation.
// func dijkstraShortestPaths(_ graphAdjacency: [[(neighbor: Int, weight: Int)]], sourceVertex: Int, vertexCount: Int) -> [Int] {
//     var shortestDistance = Array(repeating: Int.max, count: vertexCount)
//     var finalised = Array(repeating: false, count: vertexCount)
//     shortestDistance[sourceVertex] = 0
 
//     for _ in 0..<vertexCount {
//         // Find the not-yet-finalised vertex with the smallest known distance.
//         var currentVertex = -1
//         for vertex in 0..<vertexCount {
//             if !finalised[vertex] && (currentVertex == -1 || shortestDistance[vertex] < shortestDistance[currentVertex]) {
//                 currentVertex = vertex
//             }
//         }
 
//         if currentVertex == -1 || shortestDistance[currentVertex] == Int.max { break }
//         finalised[currentVertex] = true
 
//         for (neighborVertex, edgeWeight) in graphAdjacency[currentVertex] {
//             if !finalised[neighborVertex] && shortestDistance[currentVertex] + edgeWeight < shortestDistance[neighborVertex] {
//                 shortestDistance[neighborVertex] = shortestDistance[currentVertex] + edgeWeight
//             }
//         }
//     }
 
//     return shortestDistance
// }
 
// let vertexCount = 5
// var graphAdjacency = [[(neighbor: Int, weight: Int)]](repeating: [], count: vertexCount)
 
// func addUndirectedWeightedEdge(_ u: Int, _ v: Int, _ weight: Int) {
//     graphAdjacency[u].append((v, weight))
//     graphAdjacency[v].append((u, weight))
// }
 
// addUndirectedWeightedEdge(0, 1, 10)
// addUndirectedWeightedEdge(0, 2, 3)
// addUndirectedWeightedEdge(1, 2, 1)
// addUndirectedWeightedEdge(1, 3, 2)
// addUndirectedWeightedEdge(2, 3, 8)
// addUndirectedWeightedEdge(2, 4, 2)
// addUndirectedWeightedEdge(3, 4, 7)
 
// let shortestDistances = dijkstraShortestPaths(graphAdjacency, sourceVertex: 0, vertexCount: vertexCount)
 
// print("Shortest distances from vertex 0:")
// for vertex in 0..<vertexCount {
//     print("  Vertex \\(vertex): \\(shortestDistances[vertex])")
// }
// `,
//         "kotlin": `import java.util.PriorityQueue
 
// // Computes the shortest distance from sourceVertex to every other vertex in
// // graphAdjacency, where each edge is stored as a (neighbor, weight) pair.
// fun dijkstraShortestPaths(graphAdjacency: Array<MutableList<Pair<Int, Int>>>, sourceVertex: Int, vertexCount: Int): IntArray {
//     val shortestDistance = IntArray(vertexCount) { Int.MAX_VALUE }
//     shortestDistance[sourceVertex] = 0
 
//     // Each queue entry is (distance-so-far, vertex), ordered by distance.
//     val minPriorityQueue = PriorityQueue<Pair<Int, Int>>(compareBy { it.first })
//     minPriorityQueue.add(0 to sourceVertex)
 
//     while (minPriorityQueue.isNotEmpty()) {
//         val (currentDistance, currentVertex) = minPriorityQueue.poll()
 
//         // A stale queue entry: we've already found a better path since this was pushed.
//         if (currentDistance > shortestDistance[currentVertex]) continue
 
//         for ((neighborVertex, edgeWeight) in graphAdjacency[currentVertex]) {
//             val candidateDistance = shortestDistance[currentVertex] + edgeWeight
//             if (candidateDistance < shortestDistance[neighborVertex]) {
//                 shortestDistance[neighborVertex] = candidateDistance
//                 minPriorityQueue.add(candidateDistance to neighborVertex)
//             }
//         }
//     }
 
//     return shortestDistance
// }
 
// fun main() {
//     val vertexCount = 5
//     val graphAdjacency = Array(vertexCount) { mutableListOf<Pair<Int, Int>>() }
 
//     fun addUndirectedWeightedEdge(u: Int, v: Int, weight: Int) {
//         graphAdjacency[u].add(v to weight)
//         graphAdjacency[v].add(u to weight)
//     }
 
//     addUndirectedWeightedEdge(0, 1, 10)
//     addUndirectedWeightedEdge(0, 2, 3)
//     addUndirectedWeightedEdge(1, 2, 1)
//     addUndirectedWeightedEdge(1, 3, 2)
//     addUndirectedWeightedEdge(2, 3, 8)
//     addUndirectedWeightedEdge(2, 4, 2)
//     addUndirectedWeightedEdge(3, 4, 7)
 
//     val shortestDistances = dijkstraShortestPaths(graphAdjacency, 0, vertexCount)
 
//     println("Shortest distances from vertex 0:")
//     for (vertex in 0 until vertexCount) {
//         println("  Vertex $vertex: \${shortestDistances[vertex]}")
//     }
// }
// `,
//         "scala": `import scala.collection.mutable
 
// object Main extends App {
//     // Computes the shortest distance from sourceVertex to every other
//     // vertex in graphAdjacency, where each edge is stored as (neighbor, weight).
//     def dijkstraShortestPaths(graphAdjacency: Array[mutable.ListBuffer[(Int, Int)]], sourceVertex: Int, vertexCount: Int): Array[Int] = {
//         val shortestDistance = Array.fill(vertexCount)(Int.MaxValue)
//         shortestDistance(sourceVertex) = 0
 
//         // Min-heap ordered by distance (first element of the tuple).
//         val minPriorityQueue = mutable.PriorityQueue[(Int, Int)]()(Ordering.by((entry: (Int, Int)) => -entry._1))
//         minPriorityQueue.enqueue((0, sourceVertex))
 
//         while (minPriorityQueue.nonEmpty) {
//             val (currentDistance, currentVertex) = minPriorityQueue.dequeue()
 
//             // A stale queue entry: we've already found a better path since this was pushed.
//             if (currentDistance <= shortestDistance(currentVertex)) {
//                 for ((neighborVertex, edgeWeight) <- graphAdjacency(currentVertex)) {
//                     val candidateDistance = shortestDistance(currentVertex) + edgeWeight
//                     if (candidateDistance < shortestDistance(neighborVertex)) {
//                         shortestDistance(neighborVertex) = candidateDistance
//                         minPriorityQueue.enqueue((candidateDistance, neighborVertex))
//                     }
//                 }
//             }
//         }
 
//         shortestDistance
//     }
 
//     val vertexCount = 5
//     val graphAdjacency = Array.fill(vertexCount)(mutable.ListBuffer[(Int, Int)]())
 
//     def addUndirectedWeightedEdge(u: Int, v: Int, weight: Int): Unit = {
//         graphAdjacency(u) += ((v, weight))
//         graphAdjacency(v) += ((u, weight))
//     }
 
//     addUndirectedWeightedEdge(0, 1, 10)
//     addUndirectedWeightedEdge(0, 2, 3)
//     addUndirectedWeightedEdge(1, 2, 1)
//     addUndirectedWeightedEdge(1, 3, 2)
//     addUndirectedWeightedEdge(2, 3, 8)
//     addUndirectedWeightedEdge(2, 4, 2)
//     addUndirectedWeightedEdge(3, 4, 7)
 
//     val shortestDistances = dijkstraShortestPaths(graphAdjacency, 0, vertexCount)
 
//     println("Shortest distances from vertex 0:")
//     for (vertex <- 0 until vertexCount) {
//         println(s"  Vertex $vertex: \${shortestDistances(vertex)}")
//     }
// }
// `,
//         "go": `package main
 
// import (
//     "container/heap"
//     "fmt"
//     "math"
// )
 
// // distanceVertexItem is one entry in the priority queue: a candidate
// // distance paired with the vertex it leads to.
// type distanceVertexItem struct {
//     distance int
//     vertex   int
// }
 
// // distanceVertexHeap implements container/heap.Interface as a min-heap
// // ordered by distance.
// type distanceVertexHeap []distanceVertexItem
 
// func (h distanceVertexHeap) Len() int            { return len(h) }
// func (h distanceVertexHeap) Less(i, j int) bool  { return h[i].distance < h[j].distance }
// func (h distanceVertexHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
// func (h *distanceVertexHeap) Push(x interface{}) { *h = append(*h, x.(distanceVertexItem)) }
// func (h *distanceVertexHeap) Pop() interface{} {
//     old := *h
//     n := len(old)
//     item := old[n-1]
//     *h = old[:n-1]
//     return item
// }
 
// type weightedEdge struct {
//     neighbor int
//     weight   int
// }
 
// // dijkstraShortestPaths computes the shortest distance from sourceVertex to
// // every other vertex in graphAdjacency.
// func dijkstraShortestPaths(graphAdjacency [][]weightedEdge, sourceVertex int, vertexCount int) []int {
//     shortestDistance := make([]int, vertexCount)
//     for i := range shortestDistance {
//         shortestDistance[i] = math.MaxInt32
//     }
//     shortestDistance[sourceVertex] = 0
 
//     minPriorityQueue := &distanceVertexHeap{{distance: 0, vertex: sourceVertex}}
//     heap.Init(minPriorityQueue)
 
//     for minPriorityQueue.Len() > 0 {
//         top := heap.Pop(minPriorityQueue).(distanceVertexItem)
//         currentDistance, currentVertex := top.distance, top.vertex
 
//         // A stale queue entry: we've already found a better path since this was pushed.
//         if currentDistance > shortestDistance[currentVertex] {
//             continue
//         }
 
//         for _, edge := range graphAdjacency[currentVertex] {
//             candidateDistance := shortestDistance[currentVertex] + edge.weight
//             if candidateDistance < shortestDistance[edge.neighbor] {
//                 shortestDistance[edge.neighbor] = candidateDistance
//                 heap.Push(minPriorityQueue, distanceVertexItem{distance: candidateDistance, vertex: edge.neighbor})
//             }
//         }
//     }
 
//     return shortestDistance
// }
 
// func main() {
//     vertexCount := 5
//     graphAdjacency := make([][]weightedEdge, vertexCount)
 
//     addUndirectedWeightedEdge := func(u, v, weight int) {
//         graphAdjacency[u] = append(graphAdjacency[u], weightedEdge{neighbor: v, weight: weight})
//         graphAdjacency[v] = append(graphAdjacency[v], weightedEdge{neighbor: u, weight: weight})
//     }
 
//     addUndirectedWeightedEdge(0, 1, 10)
//     addUndirectedWeightedEdge(0, 2, 3)
//     addUndirectedWeightedEdge(1, 2, 1)
//     addUndirectedWeightedEdge(1, 3, 2)
//     addUndirectedWeightedEdge(2, 3, 8)
//     addUndirectedWeightedEdge(2, 4, 2)
//     addUndirectedWeightedEdge(3, 4, 7)
 
//     shortestDistances := dijkstraShortestPaths(graphAdjacency, 0, vertexCount)
 
//     fmt.Println("Shortest distances from vertex 0:")
//     for vertex := 0; vertex < vertexCount; vertex++ {
//         fmt.Printf("  Vertex %d: %d\\n", vertex, shortestDistances[vertex])
//     }
// }
// `,
//         "rust": `use std::cmp::Reverse;
// use std::collections::BinaryHeap;
 
// // Computes the shortest distance from source_vertex to every other vertex
// // in graph_adjacency, where each edge is stored as (neighbor, weight).
// fn dijkstra_shortest_paths(graph_adjacency: &Vec<Vec<(usize, i32)>>, source_vertex: usize, vertex_count: usize) -> Vec<i32> {
//     let mut shortest_distance = vec![i32::MAX; vertex_count];
//     shortest_distance[source_vertex] = 0;
 
//     // Reverse(...) turns Rust's max-heap BinaryHeap into a min-heap by
//     // distance, since Reverse flips the Ord comparison direction.
//     let mut min_priority_queue = BinaryHeap::new();
//     min_priority_queue.push(Reverse((0i32, source_vertex)));
 
//     while let Some(Reverse((current_distance, current_vertex))) = min_priority_queue.pop() {
//         // A stale queue entry: we've already found a better path since this was pushed.
//         if current_distance > shortest_distance[current_vertex] {
//             continue;
//         }
 
//         for &(neighbor_vertex, edge_weight) in &graph_adjacency[current_vertex] {
//             let candidate_distance = shortest_distance[current_vertex] + edge_weight;
//             if candidate_distance < shortest_distance[neighbor_vertex] {
//                 shortest_distance[neighbor_vertex] = candidate_distance;
//                 min_priority_queue.push(Reverse((candidate_distance, neighbor_vertex)));
//             }
//         }
//     }
 
//     shortest_distance
// }
 
// fn main() {
//     let vertex_count = 5;
//     let mut graph_adjacency: Vec<Vec<(usize, i32)>> = vec![vec![]; vertex_count];
 
//     let mut add_undirected_weighted_edge = |graph: &mut Vec<Vec<(usize, i32)>>, u: usize, v: usize, weight: i32| {
//         graph[u].push((v, weight));
//         graph[v].push((u, weight));
//     };
 
//     add_undirected_weighted_edge(&mut graph_adjacency, 0, 1, 10);
//     add_undirected_weighted_edge(&mut graph_adjacency, 0, 2, 3);
//     add_undirected_weighted_edge(&mut graph_adjacency, 1, 2, 1);
//     add_undirected_weighted_edge(&mut graph_adjacency, 1, 3, 2);
//     add_undirected_weighted_edge(&mut graph_adjacency, 2, 3, 8);
//     add_undirected_weighted_edge(&mut graph_adjacency, 2, 4, 2);
//     add_undirected_weighted_edge(&mut graph_adjacency, 3, 4, 7);
 
//     let shortest_distances = dijkstra_shortest_paths(&graph_adjacency, 0, vertex_count);
 
//     println!("Shortest distances from vertex 0:");
//     for vertex in 0..vertex_count {
//         println!("  Vertex {}: {}", vertex, shortest_distances[vertex]);
//     }
// }
// `
//       }
//     },
//     /* ════════════════════════════════════════════════════════════════════
//        5. BELLMAN-FORD ALGORITHM
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Bellman-Ford Algorithm",
//       href: "/algorithms/graphs/bellman-ford",
//       type: "Hard",

//       about: [
//         { tag: "h1", text: "Bellman-Ford Algorithm" },
//         { tag: "p", text: "Bellman-Ford, independently developed by Richard Bellman and Lester Ford in the 1950s, finds the shortest path from a single source to all other vertices, and unlike Dijkstra's, it correctly handles negative edge weights. It works by relaxing every edge in the graph, repeated V − 1 times — a brute-force but provably sufficient strategy for propagating correct shortest distances through the graph." },
//         { tag: "p", text: "Its second crucial capability is negative cycle detection: after the standard V − 1 rounds of relaxation, a single additional round is run — if any edge can still be relaxed (i.e. distance further decreases), the graph contains a negative-weight cycle reachable from the source, meaning no shortest path is well-defined (you could loop the cycle forever to decrease the path cost indefinitely)." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "The graph may contain negative edge weights (e.g. financial models with costs and gains, or arbitrage detection in currency exchange graphs)",
//           "You need to detect whether a negative-weight cycle exists",
//           "Distributed routing protocols where path computation must tolerate cost decreases (the basis of the original distance-vector routing protocols)",
//           "When Dijkstra's non-negative-weight assumption can't be guaranteed for the problem domain"
//         ]},
//         { tag: "note", variant: "tip", text: "Bellman-Ford's V−1-round relaxation is exactly the number of edges in the longest possible simple shortest path (a path visits at most V vertices, hence at most V−1 edges) — that's why exactly V−1 rounds always suffice when no negative cycle exists." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(VE)",
//         best: [
//           { tag: "h2", text: "Best Case — O(VE)" },
//           { tag: "p", text: "The standard implementation always performs the full V − 1 rounds of relaxing every edge, regardless of how quickly distances actually converge — there's no structural early exit in the basic version, though an optimised variant can detect early convergence." },
//           { tag: "ul", items: [
//             "V − 1 rounds, each examining all E edges: (V−1) × E = O(VE)",
//             "An early-exit optimisation (stop if a full round makes no changes) can reduce this in practice, but the worst-case asymptotic bound remains O(VE)"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(VE)" },
//           { tag: "p", text: "Every round performs the same fixed amount of work — examining every edge once — regardless of the specific weight values or graph topology, as long as the round count (V−1) is fixed." },
//           { tag: "ul", items: [
//             "(V − 1) rounds × E edge examinations per round = O(VE)",
//             "Each edge relaxation is O(1) — one addition and one comparison",
//             "No input distribution changes this structural bound"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(VE)" },
//           { tag: "p", text: "The worst case matches the average exactly — there's no graph structure that increases the cost beyond the fixed (V−1) × E relaxation rounds, plus one additional round for negative-cycle detection." },
//           { tag: "ul", items: [
//             "(V − 1) relaxation rounds + 1 detection round, each O(E): O(VE)",
//             "For a dense graph (E ≈ V²), this becomes O(V³), notably worse than Dijkstra's O((V+E) log V) — the price paid for tolerating negative weights"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(V)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(V)" },
//           { tag: "p", text: "Only a distance array (and optionally a predecessor array for path reconstruction) is needed, both sized to the number of vertices." },
//           { tag: "ul", items: ["distance array: O(V)", "predecessor array (optional): O(V)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(V)" },
//           { tag: "p", text: "Space usage is fixed by vertex count alone — there's no auxiliary structure that grows with edge count or specific weight values." },
//           { tag: "ul", items: ["No priority queue or heap needed, unlike Dijkstra — just two flat arrays of size V"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(V)" },
//           { tag: "p", text: "No graph configuration increases memory usage beyond the fixed distance and predecessor arrays — even maximal edge density doesn't change this." },
//           { tag: "ul", items: ["distance[], predecessor[]: O(V) each, regardless of E", "The edge list itself (input, not auxiliary) is O(E)"] }
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function bellmanFord(graph, sourceVertex):
//     distanceFromSource ← map of vertex → infinity, for all vertices
//     distanceFromSource[sourceVertex] ← 0

//     // Relax all edges V − 1 times
//     for iteration from 1 to numVertices − 1:
//         for (fromVertex, toVertex, edgeWeight) in graph.edges:
//             if distanceFromSource[fromVertex] + edgeWeight < distanceFromSource[toVertex]:
//                 distanceFromSource[toVertex] ← distanceFromSource[fromVertex] + edgeWeight

//     // One more pass to detect negative cycles
//     for (fromVertex, toVertex, edgeWeight) in graph.edges:
//         if distanceFromSource[fromVertex] + edgeWeight < distanceFromSource[toVertex]:
//             return NEGATIVE_CYCLE_DETECTED

//     return distanceFromSource` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Initialise every vertex's distance to infinity except the source, which starts at 0.",
//           "Repeat exactly V − 1 times: for every edge (fromVertex, toVertex) with weight edgeWeight, check if going through fromVertex gives a shorter path to toVertex than currently known, and update if so. This is 'relaxation'.",
//           "After V − 1 full rounds, every shortest path (which can have at most V − 1 edges, since a simple path visits at most V vertices) has been fully propagated, assuming no negative cycle exists.",
//           "Run one final round: if any edge can still be relaxed, that means there's a path that keeps getting shorter even after V − 1 rounds — which is only possible if a negative-weight cycle is reachable from the source.",
//           "If no further relaxation is possible, the distance array holds the correct shortest path to every vertex."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Inductive claim: after k rounds of relaxing all edges, distanceFromSource[vertex] is correct for every vertex whose true shortest path from the source uses at most k edges. The base case (k=0) holds trivially (only the source, at distance 0, has a 0-edge path). The inductive step holds because if the true shortest path to a vertex uses exactly k edges and ends with edge (fromVertex, toVertex), then by the inductive hypothesis distanceFromSource[fromVertex] is already correct after k−1 rounds, so round k's relaxation of that edge correctly sets distanceFromSource[toVertex]. Since any simple shortest path has at most V−1 edges, V−1 rounds guarantee correctness for all vertices — and if a valid relaxation is still possible after that, the only explanation is a negative cycle, since no simple shortest path can have more than V−1 edges." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <climits>
// using namespace std;

// // Simple structure representing one directed, weighted edge.
// struct Edge {
//     int fromVertex;
//     int toVertex;
//     int edgeWeight;
// };

// // Computes single-source shortest distances from 'sourceVertex' using
// // the Bellman-Ford algorithm. Prints a warning and returns an empty
// // vector if a negative-weight cycle reachable from the source exists.
// vector<int> bellmanFord(int vertexCount, const vector<Edge>& edgeList, int sourceVertex) {
//     vector<int> distanceFromSource(vertexCount, INT_MAX);
//     distanceFromSource[sourceVertex] = 0;

//     // Relax every edge exactly (vertexCount - 1) times.
//     for (int iteration = 1; iteration < vertexCount; iteration++) {
//         for (const Edge& edge : edgeList) {
//             if (distanceFromSource[edge.fromVertex] != INT_MAX &&
//                 distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex]) {
//                 distanceFromSource[edge.toVertex] = distanceFromSource[edge.fromVertex] + edge.edgeWeight;
//             }
//         }
//     }

//     // One additional pass: if any edge can still be relaxed, a
//     // negative-weight cycle is reachable from the source.
//     for (const Edge& edge : edgeList) {
//         if (distanceFromSource[edge.fromVertex] != INT_MAX &&
//             distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex]) {
//             cout << "Negative-weight cycle detected — shortest paths are undefined." << endl;
//             return {};
//         }
//     }

//     return distanceFromSource;
// }

// int main() {
//     // Static demonstration data — a directed weighted graph with 5 vertices,
//     // including some negative edge weights.
//     int vertexCount = 5;
//     vector<Edge> edgeList = {
//         {0, 1, -1}, {0, 2, 4},
//         {1, 2, 3},  {1, 3, 2}, {1, 4, 2},
//         {3, 2, 5},  {3, 1, 1},
//         {4, 3, -3}
//     };

//     vector<int> shortestDistances = bellmanFord(vertexCount, edgeList, 0);

//     if (!shortestDistances.empty()) {
//         cout << "Shortest distances from source vertex 0:" << endl;
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             cout << "  Vertex " << vertex << ": " << shortestDistances[vertex] << endl;
//         }
//     }

//     return 0;
// }
// `,
//         "python": `INFINITY = float('inf')


// def bellman_ford(vertex_count, edge_list, source_vertex):
//     """
//     Computes single-source shortest distances from 'source_vertex' using
//     the Bellman-Ford algorithm. Prints a warning and returns None if a
//     negative-weight cycle reachable from the source exists.

//     'edge_list' is a list of (from_vertex, to_vertex, edge_weight) tuples.
//     """
//     distance_from_source = [INFINITY] * vertex_count
//     distance_from_source[source_vertex] = 0

//     # Relax every edge exactly (vertex_count - 1) times.
//     for _ in range(vertex_count - 1):
//         for from_vertex, to_vertex, edge_weight in edge_list:
//             if (distance_from_source[from_vertex] != INFINITY and
//                     distance_from_source[from_vertex] + edge_weight < distance_from_source[to_vertex]):
//                 distance_from_source[to_vertex] = distance_from_source[from_vertex] + edge_weight

//     # One additional pass: if any edge can still be relaxed, a
//     # negative-weight cycle is reachable from the source.
//     for from_vertex, to_vertex, edge_weight in edge_list:
//         if (distance_from_source[from_vertex] != INFINITY and
//                 distance_from_source[from_vertex] + edge_weight < distance_from_source[to_vertex]):
//             print("Negative-weight cycle detected - shortest paths are undefined.")
//             return None

//     return distance_from_source


// def main():
//     # Static demonstration data - a directed weighted graph with 5 vertices,
//     # including some negative edge weights.
//     vertex_count = 5
//     edge_list = [
//         (0, 1, -1), (0, 2, 4),
//         (1, 2, 3), (1, 3, 2), (1, 4, 2),
//         (3, 2, 5), (3, 1, 1),
//         (4, 3, -3),
//     ]

//     shortest_distances = bellman_ford(vertex_count, edge_list, 0)

//     if shortest_distances is not None:
//         print("Shortest distances from source vertex 0:")
//         for vertex in range(vertex_count):
//             print(f"  Vertex {vertex}: {shortest_distances[vertex]}")


// if __name__ == "__main__":
//     main()
// `,
//         "java": `import java.util.Arrays;

// public class Main {

//     // Simple structure representing one directed, weighted edge.
//     static class Edge {
//         int fromVertex;
//         int toVertex;
//         int edgeWeight;

//         Edge(int fromVertex, int toVertex, int edgeWeight) {
//             this.fromVertex = fromVertex;
//             this.toVertex = toVertex;
//             this.edgeWeight = edgeWeight;
//         }
//     }

//     // Computes single-source shortest distances from 'sourceVertex' using
//     // the Bellman-Ford algorithm. Prints a warning and returns null if a
//     // negative-weight cycle reachable from the source exists.
//     static int[] bellmanFord(int vertexCount, Edge[] edgeList, int sourceVertex) {
//         int[] distanceFromSource = new int[vertexCount];
//         Arrays.fill(distanceFromSource, Integer.MAX_VALUE);
//         distanceFromSource[sourceVertex] = 0;

//         // Relax every edge exactly (vertexCount - 1) times.
//         for (int iteration = 1; iteration < vertexCount; iteration++) {
//             for (Edge edge : edgeList) {
//                 if (distanceFromSource[edge.fromVertex] != Integer.MAX_VALUE &&
//                         distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex]) {
//                     distanceFromSource[edge.toVertex] = distanceFromSource[edge.fromVertex] + edge.edgeWeight;
//                 }
//             }
//         }

//         // One additional pass: if any edge can still be relaxed, a
//         // negative-weight cycle is reachable from the source.
//         for (Edge edge : edgeList) {
//             if (distanceFromSource[edge.fromVertex] != Integer.MAX_VALUE &&
//                     distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex]) {
//                 System.out.println("Negative-weight cycle detected — shortest paths are undefined.");
//                 return null;
//             }
//         }

//         return distanceFromSource;
//     }

//     public static void main(String[] args) {
//         // Static demonstration data — a directed weighted graph with 5 vertices,
//         // including some negative edge weights.
//         int vertexCount = 5;
//         Edge[] edgeList = {
//             new Edge(0, 1, -1), new Edge(0, 2, 4),
//             new Edge(1, 2, 3), new Edge(1, 3, 2), new Edge(1, 4, 2),
//             new Edge(3, 2, 5), new Edge(3, 1, 1),
//             new Edge(4, 3, -3)
//         };

//         int[] shortestDistances = bellmanFord(vertexCount, edgeList, 0);

//         if (shortestDistances != null) {
//             System.out.println("Shortest distances from source vertex 0:");
//             for (int vertex = 0; vertex < vertexCount; vertex++) {
//                 System.out.println("  Vertex " + vertex + ": " + shortestDistances[vertex]);
//             }
//         }
//     }
// }
// `,
//         "js": `// Computes single-source shortest distances from 'sourceVertex' using
// // the Bellman-Ford algorithm. Prints a warning and returns null if a
// // negative-weight cycle reachable from the source exists.
// //
// // 'edgeList' is an array of { fromVertex, toVertex, edgeWeight } objects.
// function bellmanFord(vertexCount, edgeList, sourceVertex) {
//     const INFINITY = Number.POSITIVE_INFINITY;
//     const distanceFromSource = new Array(vertexCount).fill(INFINITY);
//     distanceFromSource[sourceVertex] = 0;

//     // Relax every edge exactly (vertexCount - 1) times.
//     for (let iteration = 1; iteration < vertexCount; iteration++) {
//         for (const edge of edgeList) {
//             if (distanceFromSource[edge.fromVertex] !== INFINITY &&
//                 distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex]) {
//                 distanceFromSource[edge.toVertex] = distanceFromSource[edge.fromVertex] + edge.edgeWeight;
//             }
//         }
//     }

//     // One additional pass: if any edge can still be relaxed, a
//     // negative-weight cycle is reachable from the source.
//     for (const edge of edgeList) {
//         if (distanceFromSource[edge.fromVertex] !== INFINITY &&
//             distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex]) {
//             console.log("Negative-weight cycle detected — shortest paths are undefined.");
//             return null;
//         }
//     }

//     return distanceFromSource;
// }

// function main() {
//     // Static demonstration data — a directed weighted graph with 5 vertices,
//     // including some negative edge weights.
//     const vertexCount = 5;
//     const edgeList = [
//         { fromVertex: 0, toVertex: 1, edgeWeight: -1 },
//         { fromVertex: 0, toVertex: 2, edgeWeight: 4 },
//         { fromVertex: 1, toVertex: 2, edgeWeight: 3 },
//         { fromVertex: 1, toVertex: 3, edgeWeight: 2 },
//         { fromVertex: 1, toVertex: 4, edgeWeight: 2 },
//         { fromVertex: 3, toVertex: 2, edgeWeight: 5 },
//         { fromVertex: 3, toVertex: 1, edgeWeight: 1 },
//         { fromVertex: 4, toVertex: 3, edgeWeight: -3 }
//     ];

//     const shortestDistances = bellmanFord(vertexCount, edgeList, 0);

//     if (shortestDistances !== null) {
//         console.log("Shortest distances from source vertex 0:");
//         for (let vertex = 0; vertex < vertexCount; vertex++) {
//             console.log(\`  Vertex \${vertex}: \${shortestDistances[vertex]}\`);
//         }
//     }
// }

// main();
// `,
//         "c": `#include <stdio.h>
// #include <limits.h>

// #define MAX_EDGES 100

// typedef struct {
//     int fromVertex;
//     int toVertex;
//     int edgeWeight;
// } Edge;

// // Computes single-source shortest distances from 'sourceVertex' into
// // 'distanceFromSource' using the Bellman-Ford algorithm. Returns 1 on
// // success, or 0 if a negative-weight cycle reachable from the source
// // is detected.
// int bellmanFord(int vertexCount, Edge* edgeList, int edgeCount, int sourceVertex, int* distanceFromSource) {
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         distanceFromSource[vertex] = INT_MAX;
//     }
//     distanceFromSource[sourceVertex] = 0;

//     /* Relax every edge exactly (vertexCount - 1) times. */
//     for (int iteration = 1; iteration < vertexCount; iteration++) {
//         for (int i = 0; i < edgeCount; i++) {
//             Edge edge = edgeList[i];
//             if (distanceFromSource[edge.fromVertex] != INT_MAX &&
//                 distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex]) {
//                 distanceFromSource[edge.toVertex] = distanceFromSource[edge.fromVertex] + edge.edgeWeight;
//             }
//         }
//     }

//     /* One additional pass: if any edge can still be relaxed, a
//        negative-weight cycle is reachable from the source. */
//     for (int i = 0; i < edgeCount; i++) {
//         Edge edge = edgeList[i];
//         if (distanceFromSource[edge.fromVertex] != INT_MAX &&
//             distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex]) {
//             return 0; /* negative cycle detected */
//         }
//     }

//     return 1;
// }

// int main() {
//     /* Static demonstration data - a directed weighted graph with 5 vertices,
//        including some negative edge weights. */
//     int vertexCount = 5;
//     Edge edgeList[MAX_EDGES] = {
//         {0, 1, -1}, {0, 2, 4},
//         {1, 2, 3},  {1, 3, 2}, {1, 4, 2},
//         {3, 2, 5},  {3, 1, 1},
//         {4, 3, -3}
//     };
//     int edgeCount = 8;

//     int distanceFromSource[MAX_EDGES];
//     int succeeded = bellmanFord(vertexCount, edgeList, edgeCount, 0, distanceFromSource);

//     if (!succeeded) {
//         printf("Negative-weight cycle detected - shortest paths are undefined.\\n");
//         return 0;
//     }

//     printf("Shortest distances from source vertex 0:\\n");
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         printf("  Vertex %d: %d\\n", vertex, distanceFromSource[vertex]);
//     }

//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;

// class Program {

//     // Simple structure representing one directed, weighted edge.
//     struct Edge {
//         public int FromVertex;
//         public int ToVertex;
//         public int EdgeWeight;

//         public Edge(int fromVertex, int toVertex, int edgeWeight) {
//             FromVertex = fromVertex;
//             ToVertex = toVertex;
//             EdgeWeight = edgeWeight;
//         }
//     }

//     // Computes single-source shortest distances from 'sourceVertex' using
//     // the Bellman-Ford algorithm. Prints a warning and returns null if a
//     // negative-weight cycle reachable from the source exists.
//     static int[] BellmanFord(int vertexCount, List<Edge> edgeList, int sourceVertex) {
//         int[] distanceFromSource = new int[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             distanceFromSource[vertex] = int.MaxValue;
//         }
//         distanceFromSource[sourceVertex] = 0;

//         // Relax every edge exactly (vertexCount - 1) times.
//         for (int iteration = 1; iteration < vertexCount; iteration++) {
//             foreach (Edge edge in edgeList) {
//                 if (distanceFromSource[edge.FromVertex] != int.MaxValue &&
//                     distanceFromSource[edge.FromVertex] + edge.EdgeWeight < distanceFromSource[edge.ToVertex]) {
//                     distanceFromSource[edge.ToVertex] = distanceFromSource[edge.FromVertex] + edge.EdgeWeight;
//                 }
//             }
//         }

//         // One additional pass: if any edge can still be relaxed, a
//         // negative-weight cycle is reachable from the source.
//         foreach (Edge edge in edgeList) {
//             if (distanceFromSource[edge.FromVertex] != int.MaxValue &&
//                 distanceFromSource[edge.FromVertex] + edge.EdgeWeight < distanceFromSource[edge.ToVertex]) {
//                 Console.WriteLine("Negative-weight cycle detected — shortest paths are undefined.");
//                 return null;
//             }
//         }

//         return distanceFromSource;
//     }

//     static void Main() {
//         // Static demonstration data — a directed weighted graph with 5 vertices,
//         // including some negative edge weights.
//         int vertexCount = 5;
//         var edgeList = new List<Edge> {
//             new Edge(0, 1, -1), new Edge(0, 2, 4),
//             new Edge(1, 2, 3),  new Edge(1, 3, 2), new Edge(1, 4, 2),
//             new Edge(3, 2, 5),  new Edge(3, 1, 1),
//             new Edge(4, 3, -3)
//         };

//         int[] shortestDistances = BellmanFord(vertexCount, edgeList, 0);

//         if (shortestDistances != null) {
//             Console.WriteLine("Shortest distances from source vertex 0:");
//             for (int vertex = 0; vertex < vertexCount; vertex++) {
//                 Console.WriteLine($"  Vertex {vertex}: {shortestDistances[vertex]}");
//             }
//         }
//     }
// }
// `,
//         "swift": `import Foundation

// // Simple structure representing one directed, weighted edge.
// struct Edge {
//     let fromVertex: Int
//     let toVertex: Int
//     let edgeWeight: Int
// }

// // Computes single-source shortest distances from 'sourceVertex' using
// // the Bellman-Ford algorithm. Prints a warning and returns nil if a
// // negative-weight cycle reachable from the source exists.
// func bellmanFord(_ vertexCount: Int, _ edgeList: [Edge], _ sourceVertex: Int) -> [Int]? {
//     let infinityValue = Int.max
//     var distanceFromSource = [Int](repeating: infinityValue, count: vertexCount)
//     distanceFromSource[sourceVertex] = 0

//     // Relax every edge exactly (vertexCount - 1) times.
//     for _ in 1..<vertexCount {
//         for edge in edgeList {
//             if distanceFromSource[edge.fromVertex] != infinityValue &&
//                 distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex] {
//                 distanceFromSource[edge.toVertex] = distanceFromSource[edge.fromVertex] + edge.edgeWeight
//             }
//         }
//     }

//     // One additional pass: if any edge can still be relaxed, a
//     // negative-weight cycle is reachable from the source.
//     for edge in edgeList {
//         if distanceFromSource[edge.fromVertex] != infinityValue &&
//             distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex] {
//             print("Negative-weight cycle detected — shortest paths are undefined.")
//             return nil
//         }
//     }

//     return distanceFromSource
// }

// // Static demonstration data — a directed weighted graph with 5 vertices,
// // including some negative edge weights.
// let vertexCount = 5
// let edgeList = [
//     Edge(fromVertex: 0, toVertex: 1, edgeWeight: -1),
//     Edge(fromVertex: 0, toVertex: 2, edgeWeight: 4),
//     Edge(fromVertex: 1, toVertex: 2, edgeWeight: 3),
//     Edge(fromVertex: 1, toVertex: 3, edgeWeight: 2),
//     Edge(fromVertex: 1, toVertex: 4, edgeWeight: 2),
//     Edge(fromVertex: 3, toVertex: 2, edgeWeight: 5),
//     Edge(fromVertex: 3, toVertex: 1, edgeWeight: 1),
//     Edge(fromVertex: 4, toVertex: 3, edgeWeight: -3)
// ]

// if let shortestDistances = bellmanFord(vertexCount, edgeList, 0) {
//     print("Shortest distances from source vertex 0:")
//     for vertex in 0..<vertexCount {
//         print("  Vertex \\(vertex): \\(shortestDistances[vertex])")
//     }
// }
// `,
//         "kotlin": `// Simple data class representing one directed, weighted edge.
// data class Edge(val fromVertex: Int, val toVertex: Int, val edgeWeight: Int)

// // Computes single-source shortest distances from 'sourceVertex' using
// // the Bellman-Ford algorithm. Prints a warning and returns null if a
// // negative-weight cycle reachable from the source exists.
// fun bellmanFord(vertexCount: Int, edgeList: List<Edge>, sourceVertex: Int): IntArray? {
//     val infinityValue = Int.MAX_VALUE
//     val distanceFromSource = IntArray(vertexCount) { infinityValue }
//     distanceFromSource[sourceVertex] = 0

//     // Relax every edge exactly (vertexCount - 1) times.
//     for (iteration in 1 until vertexCount) {
//         for (edge in edgeList) {
//             if (distanceFromSource[edge.fromVertex] != infinityValue &&
//                 distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex]) {
//                 distanceFromSource[edge.toVertex] = distanceFromSource[edge.fromVertex] + edge.edgeWeight
//             }
//         }
//     }

//     // One additional pass: if any edge can still be relaxed, a
//     // negative-weight cycle is reachable from the source.
//     for (edge in edgeList) {
//         if (distanceFromSource[edge.fromVertex] != infinityValue &&
//             distanceFromSource[edge.fromVertex] + edge.edgeWeight < distanceFromSource[edge.toVertex]) {
//             println("Negative-weight cycle detected — shortest paths are undefined.")
//             return null
//         }
//     }

//     return distanceFromSource
// }

// fun main() {
//     // Static demonstration data — a directed weighted graph with 5 vertices,
//     // including some negative edge weights.
//     val vertexCount = 5
//     val edgeList = listOf(
//         Edge(0, 1, -1), Edge(0, 2, 4),
//         Edge(1, 2, 3), Edge(1, 3, 2), Edge(1, 4, 2),
//         Edge(3, 2, 5), Edge(3, 1, 1),
//         Edge(4, 3, -3)
//     )

//     val shortestDistances = bellmanFord(vertexCount, edgeList, 0)

//     if (shortestDistances != null) {
//         println("Shortest distances from source vertex 0:")
//         for (vertex in 0 until vertexCount) {
//             println("  Vertex $vertex: \${shortestDistances[vertex]}")
//         }
//     }
// }
// `,
//         "scala": `// Simple case class representing one directed, weighted edge.
// case class Edge(fromVertex: Int, toVertex: Int, edgeWeight: Int)

// object Main extends App {

//   // Computes single-source shortest distances from 'sourceVertex' using
//   // the Bellman-Ford algorithm. Prints a warning and returns None if a
//   // negative-weight cycle reachable from the source exists.
//   def bellmanFord(vertexCount: Int, edgeList: List[Edge], sourceVertex: Int): Option[Array[Int]] = {
//     val infinityValue = Int.MaxValue
//     val distanceFromSource = Array.fill(vertexCount)(infinityValue)
//     distanceFromSource(sourceVertex) = 0

//     // Relax every edge exactly (vertexCount - 1) times.
//     for (_ <- 1 until vertexCount; edge <- edgeList) {
//       if (distanceFromSource(edge.fromVertex) != infinityValue &&
//           distanceFromSource(edge.fromVertex) + edge.edgeWeight < distanceFromSource(edge.toVertex)) {
//         distanceFromSource(edge.toVertex) = distanceFromSource(edge.fromVertex) + edge.edgeWeight
//       }
//     }

//     // One additional pass: if any edge can still be relaxed, a
//     // negative-weight cycle is reachable from the source.
//     for (edge <- edgeList) {
//       if (distanceFromSource(edge.fromVertex) != infinityValue &&
//           distanceFromSource(edge.fromVertex) + edge.edgeWeight < distanceFromSource(edge.toVertex)) {
//         println("Negative-weight cycle detected — shortest paths are undefined.")
//         return None
//       }
//     }

//     Some(distanceFromSource)
//   }

//   // Static demonstration data — a directed weighted graph with 5 vertices,
//   // including some negative edge weights.
//   val vertexCount = 5
//   val edgeList = List(
//     Edge(0, 1, -1), Edge(0, 2, 4),
//     Edge(1, 2, 3), Edge(1, 3, 2), Edge(1, 4, 2),
//     Edge(3, 2, 5), Edge(3, 1, 1),
//     Edge(4, 3, -3)
//   )

//   bellmanFord(vertexCount, edgeList, 0).foreach { shortestDistances =>
//     println("Shortest distances from source vertex 0:")
//     for (vertex <- 0 until vertexCount) {
//       println(s"  Vertex $vertex: \${shortestDistances(vertex)}")
//     }
//   }
// }
// `,
//         "go": `package main

// import (
// 	"fmt"
// 	"math"
// )

// // Edge represents one directed, weighted edge in the graph.
// type Edge struct {
// 	fromVertex int
// 	toVertex   int
// 	edgeWeight int
// }

// // bellmanFord computes single-source shortest distances from sourceVertex
// // using the Bellman-Ford algorithm. Returns nil and prints a warning if
// // a negative-weight cycle reachable from the source exists.
// func bellmanFord(vertexCount int, edgeList []Edge, sourceVertex int) []int {
// 	infinityValue := math.MaxInt32
// 	distanceFromSource := make([]int, vertexCount)
// 	for vertex := range distanceFromSource {
// 		distanceFromSource[vertex] = infinityValue
// 	}
// 	distanceFromSource[sourceVertex] = 0

// 	// Relax every edge exactly (vertexCount - 1) times.
// 	for iteration := 1; iteration < vertexCount; iteration++ {
// 		for _, edge := range edgeList {
// 			if distanceFromSource[edge.fromVertex] != infinityValue &&
// 				distanceFromSource[edge.fromVertex]+edge.edgeWeight < distanceFromSource[edge.toVertex] {
// 				distanceFromSource[edge.toVertex] = distanceFromSource[edge.fromVertex] + edge.edgeWeight
// 			}
// 		}
// 	}

// 	// One additional pass: if any edge can still be relaxed, a
// 	// negative-weight cycle is reachable from the source.
// 	for _, edge := range edgeList {
// 		if distanceFromSource[edge.fromVertex] != infinityValue &&
// 			distanceFromSource[edge.fromVertex]+edge.edgeWeight < distanceFromSource[edge.toVertex] {
// 			fmt.Println("Negative-weight cycle detected - shortest paths are undefined.")
// 			return nil
// 		}
// 	}

// 	return distanceFromSource
// }

// func main() {
// 	// Static demonstration data - a directed weighted graph with 5 vertices,
// 	// including some negative edge weights.
// 	vertexCount := 5
// 	edgeList := []Edge{
// 		{0, 1, -1}, {0, 2, 4},
// 		{1, 2, 3}, {1, 3, 2}, {1, 4, 2},
// 		{3, 2, 5}, {3, 1, 1},
// 		{4, 3, -3},
// 	}

// 	shortestDistances := bellmanFord(vertexCount, edgeList, 0)

// 	if shortestDistances != nil {
// 		fmt.Println("Shortest distances from source vertex 0:")
// 		for vertex := 0; vertex < vertexCount; vertex++ {
// 			fmt.Printf("  Vertex %d: %d\n", vertex, shortestDistances[vertex])
// 		}
// 	}
// }
// `,
//         "rust": `// Represents one directed, weighted edge in the graph.
// struct Edge {
//     from_vertex: usize,
//     to_vertex: usize,
//     edge_weight: i32,
// }

// // Computes single-source shortest distances from 'source_vertex' using
// // the Bellman-Ford algorithm. Returns None and prints a warning if a
// // negative-weight cycle reachable from the source exists.
// fn bellman_ford(vertex_count: usize, edge_list: &[Edge], source_vertex: usize) -> Option<Vec<i32>> {
//     const INFINITY_VALUE: i32 = i32::MAX;
//     let mut distance_from_source: Vec<i32> = vec![INFINITY_VALUE; vertex_count];
//     distance_from_source[source_vertex] = 0;

//     // Relax every edge exactly (vertex_count - 1) times.
//     for _ in 1..vertex_count {
//         for edge in edge_list {
//             if distance_from_source[edge.from_vertex] != INFINITY_VALUE
//                 && distance_from_source[edge.from_vertex] + edge.edge_weight < distance_from_source[edge.to_vertex]
//             {
//                 distance_from_source[edge.to_vertex] = distance_from_source[edge.from_vertex] + edge.edge_weight;
//             }
//         }
//     }

//     // One additional pass: if any edge can still be relaxed, a
//     // negative-weight cycle is reachable from the source.
//     for edge in edge_list {
//         if distance_from_source[edge.from_vertex] != INFINITY_VALUE
//             && distance_from_source[edge.from_vertex] + edge.edge_weight < distance_from_source[edge.to_vertex]
//         {
//             println!("Negative-weight cycle detected - shortest paths are undefined.");
//             return None;
//         }
//     }

//     Some(distance_from_source)
// }

// fn main() {
//     // Static demonstration data - a directed weighted graph with 5 vertices,
//     // including some negative edge weights.
//     let vertex_count = 5;
//     let edge_list = vec![
//         Edge { from_vertex: 0, to_vertex: 1, edge_weight: -1 },
//         Edge { from_vertex: 0, to_vertex: 2, edge_weight: 4 },
//         Edge { from_vertex: 1, to_vertex: 2, edge_weight: 3 },
//         Edge { from_vertex: 1, to_vertex: 3, edge_weight: 2 },
//         Edge { from_vertex: 1, to_vertex: 4, edge_weight: 2 },
//         Edge { from_vertex: 3, to_vertex: 2, edge_weight: 5 },
//         Edge { from_vertex: 3, to_vertex: 1, edge_weight: 1 },
//         Edge { from_vertex: 4, to_vertex: 3, edge_weight: -3 },
//     ];

//     if let Some(shortest_distances) = bellman_ford(vertex_count, &edge_list, 0) {
//         println!("Shortest distances from source vertex 0:");
//         for vertex in 0..vertex_count {
//             println!("  Vertex {}: {}", vertex, shortest_distances[vertex]);
//         }
//     }
// }
// `
//       }
//     },
//     /* ════════════════════════════════════════════════════════════════════
//        6. FLOYD-WARSHALL ALGORITHM
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Floyd-Warshall Algorithm",
//       href: "/algorithms/graphs/floyd-warshall",
//       type: "Hard",

//       about: [
//         { tag: "h1", text: "Floyd-Warshall Algorithm" },
//         { tag: "p", text: "Floyd-Warshall, developed by Robert Floyd and Stephen Warshall in 1962, computes the shortest path between every pair of vertices in a weighted graph simultaneously — an all-pairs shortest path (APSP) algorithm, in contrast to Dijkstra's and Bellman-Ford's single-source focus. It works on a V×V distance matrix using dynamic programming over an 'allowed intermediate vertex' dimension." },
//         { tag: "p", text: "The core idea: distanceMatrix[startVertex][endVertex] using only vertices {1...intermediateVertex} as intermediates is either the same as using only {1...intermediateVertex-1}, or it's improved by routing through intermediateVertex specifically (distanceMatrix[startVertex][intermediateVertex] + distanceMatrix[intermediateVertex][endVertex]). By incrementally allowing one more vertex as a possible 'waypoint' at each of V iterations, the algorithm converges to the true shortest path between every pair." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "You need shortest paths between ALL pairs of vertices, not just from one source",
//           "The graph is small to medium-sized (V up to a few hundred/low thousands) — O(V³) becomes prohibitive beyond that",
//           "Edge weights can be negative, as long as there are no negative-weight cycles (the algorithm can detect their presence via negative values on the diagonal)",
//           "You need transitive closure of a relation (a boolean variant answers 'is there ANY path from startVertex to endVertex')"
//         ]},
//         { tag: "note", variant: "tip", text: "Running Dijkstra V times (once per source) costs O(V(V+E) log V), which beats Floyd-Warshall's O(V³) for sparse graphs with non-negative weights — Floyd-Warshall's simplicity and negative-weight tolerance are its real advantages, not raw speed." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(V³)",
//         best: [
//           { tag: "h2", text: "Best Case — O(V³)" },
//           { tag: "p", text: "The algorithm always runs three fully nested loops over all V vertices (for the intermediate vertex, and for every pair of start/end vertices), regardless of the graph's actual connectivity or weight values — there is no early exit." },
//           { tag: "ul", items: [
//             "Outer loop over intermediate vertex: V iterations",
//             "Middle and inner loops over start vertex and end vertex: V × V = V² iterations each",
//             "Total: V × V² = O(V³), unconditionally"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(V³)" },
//           { tag: "p", text: "Every cell of the V×V distance matrix is checked and potentially updated exactly once per value of the intermediate vertex, regardless of how many actual edges exist or what values they carry." },
//           { tag: "ul", items: [
//             "V values of the intermediate vertex × V² (start, end) pairs per intermediate vertex = O(V³) total comparisons",
//             "Each comparison/update is O(1)",
//             "No input distribution changes this fixed triple-nested-loop structure"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(V³)" },
//           { tag: "p", text: "No graph configuration increases the cost beyond the fixed triple loop — this is identical to best and average case, a hallmark of dense dynamic-programming algorithms with no data-dependent branching that skips iterations." },
//           { tag: "ul", items: [
//             "O(V³) is simultaneously the best, average, and worst case — Floyd-Warshall has no adaptive behaviour",
//             "This makes it predictable but also means it can't be sped up by 'lucky' input the way Bellman-Ford's early-exit optimisation can"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(V²)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(V²)" },
//           { tag: "p", text: "The algorithm requires a full V×V distance matrix, since it computes and stores the shortest distance between every single pair of vertices." },
//           { tag: "ul", items: ["distance matrix: V² entries — O(V²)", "optional next/predecessor matrix for path reconstruction: another O(V²)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(V²)" },
//           { tag: "p", text: "Matrix size is fixed by vertex count alone, regardless of how many edges actually exist in the original graph — even a sparse graph still produces a dense V×V output matrix." },
//           { tag: "ul", items: ["The output is inherently dense (all-pairs distances), so space is always O(V²) regardless of input edge sparsity"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(V²)" },
//           { tag: "p", text: "No input increases space usage beyond the fixed V×V matrices — this is both the floor and ceiling for the algorithm's memory footprint." },
//           { tag: "ul", items: [
//             "Distance matrix + optional path-reconstruction matrix: O(V²) total",
//             "Can be done in-place (updating the same matrix across all intermediate-vertex iterations) without needing separate matrices per iteration"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function floydWarshall(graph):
//     distanceMatrix ← vertexCount x vertexCount matrix
//     for startVertex from 0 to vertexCount − 1:
//         for endVertex from 0 to vertexCount − 1:
//             if startVertex == endVertex:
//                 distanceMatrix[startVertex][endVertex] ← 0
//             else if edge (startVertex, endVertex) exists:
//                 distanceMatrix[startVertex][endVertex] ← weight(startVertex, endVertex)
//             else:
//                 distanceMatrix[startVertex][endVertex] ← infinity

//     for intermediateVertex from 0 to vertexCount − 1:       // allowed intermediate vertex
//         for startVertex from 0 to vertexCount − 1:
//             for endVertex from 0 to vertexCount − 1:
//                 if distanceMatrix[startVertex][intermediateVertex] + distanceMatrix[intermediateVertex][endVertex] < distanceMatrix[startVertex][endVertex]:
//                     distanceMatrix[startVertex][endVertex] ← distanceMatrix[startVertex][intermediateVertex] + distanceMatrix[intermediateVertex][endVertex]

//     // Negative cycle check: any distanceMatrix[vertex][vertex] < 0 means a negative cycle exists
//     return distanceMatrix` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Initialise the distance matrix directly from the graph's edge weights, with 0 on the diagonal and infinity for non-adjacent pairs.",
//           "For each vertex intermediateVertex from 0 to vertexCount−1, treat it as a newly 'allowed' intermediate stopping point.",
//           "For every pair (startVertex, endVertex), check whether routing through intermediateVertex — i.e. taking the best known path from startVertex to intermediateVertex, then from intermediateVertex to endVertex — produces a shorter total distance than the current distanceMatrix[startVertex][endVertex].",
//           "If so, update distanceMatrix[startVertex][endVertex] to this improved value.",
//           "After all V values of intermediateVertex have been processed, distanceMatrix[startVertex][endVertex] holds the true shortest distance from startVertex to endVertex using any vertex as an intermediate — i.e. the full graph."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Inductive claim: after processing intermediate vertex k, distanceMatrix[startVertex][endVertex] correctly holds the shortest path from startVertex to endVertex using only vertices from {0, 1, ..., k} as possible intermediates. Base case (before any intermediate vertex is processed) holds because distanceMatrix[startVertex][endVertex] is initialised to the direct edge weight, which is trivially the shortest path using zero intermediates. Inductive step: the shortest path from startVertex to endVertex using vertices up to k either avoids k entirely (so it's already captured by distanceMatrix[startVertex][endVertex] from the previous iteration) or passes through k exactly once (since revisiting k offers no benefit), in which case it equals distanceMatrix[startVertex][k] + distanceMatrix[k][endVertex], both of which are already correctly computed using vertices up to k−1 by the inductive hypothesis. Taking the minimum of these two options correctly updates distanceMatrix[startVertex][endVertex] for intermediates up to k. By induction, after k = V−1, all pairs are correctly computed using any vertex as an intermediate." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <algorithm>
// using namespace std;

// const int INFINITY_VALUE = 1000000000;

// // Computes all-pairs shortest distances for a graph with 'vertexCount'
// // vertices and undirected weighted edges 'edgeList', using the
// // Floyd-Warshall algorithm. Returns the completed V x V distance matrix.
// vector<vector<int>> floydWarshall(int vertexCount, const vector<vector<int>>& edgeList) {
//     vector<vector<int>> distanceMatrix(vertexCount, vector<int>(vertexCount, INFINITY_VALUE));

//     // A vertex's distance to itself is always zero.
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         distanceMatrix[vertex][vertex] = 0;
//     }

//     // Seed the matrix with the direct edge weights given in 'edgeList'.
//     // Each entry in edgeList is {vertexA, vertexB, edgeWeight}.
//     for (const vector<int>& edge : edgeList) {
//         int vertexA = edge[0];
//         int vertexB = edge[1];
//         int edgeWeight = edge[2];
//         distanceMatrix[vertexA][vertexB] = min(distanceMatrix[vertexA][vertexB], edgeWeight);
//         distanceMatrix[vertexB][vertexA] = min(distanceMatrix[vertexB][vertexA], edgeWeight);
//     }

//     // Progressively allow each vertex as an intermediate stopping point.
//     for (int intermediateVertex = 0; intermediateVertex < vertexCount; intermediateVertex++) {
//         for (int startVertex = 0; startVertex < vertexCount; startVertex++) {
//             for (int endVertex = 0; endVertex < vertexCount; endVertex++) {
//                 if (distanceMatrix[startVertex][intermediateVertex] < INFINITY_VALUE &&
//                     distanceMatrix[intermediateVertex][endVertex] < INFINITY_VALUE) {
//                     int distanceThroughIntermediate =
//                         distanceMatrix[startVertex][intermediateVertex] + distanceMatrix[intermediateVertex][endVertex];

//                     if (distanceThroughIntermediate < distanceMatrix[startVertex][endVertex]) {
//                         distanceMatrix[startVertex][endVertex] = distanceThroughIntermediate;
//                     }
//                 }
//             }
//         }
//     }

//     return distanceMatrix;
// }

// int main() {
//     // Static demonstration data — an undirected weighted graph with 4 vertices.
//     int vertexCount = 4;
//     vector<vector<int>> edgeList = {
//         {0, 1, 3}, {0, 3, 7}, {1, 2, 2}, {2, 3, 1}, {1, 3, 5}
//     };

//     vector<vector<int>> distanceMatrix = floydWarshall(vertexCount, edgeList);

//     cout << "All-pairs shortest distances:" << endl;
//     for (int startVertex = 0; startVertex < vertexCount; startVertex++) {
//         for (int endVertex = 0; endVertex < vertexCount; endVertex++) {
//             int distanceValue = distanceMatrix[startVertex][endVertex];
//             cout << (distanceValue == INFINITY_VALUE ? -1 : distanceValue) << "\\t";
//         }
//         cout << endl;
//     }

//     return 0;
// }
// `,
//         "python": `INFINITY_VALUE = float('inf')


// def floyd_warshall(vertex_count, edge_list):
//     """
//     Computes all-pairs shortest distances for a graph with 'vertex_count'
//     vertices and undirected weighted edges 'edge_list', using the
//     Floyd-Warshall algorithm. Returns the completed V x V distance matrix.

//     Each entry in edge_list is a (vertex_a, vertex_b, edge_weight) tuple.
//     """
//     distance_matrix = [[INFINITY_VALUE] * vertex_count for _ in range(vertex_count)]

//     # A vertex's distance to itself is always zero.
//     for vertex in range(vertex_count):
//         distance_matrix[vertex][vertex] = 0

//     # Seed the matrix with the direct edge weights given in edge_list.
//     for vertex_a, vertex_b, edge_weight in edge_list:
//         distance_matrix[vertex_a][vertex_b] = min(distance_matrix[vertex_a][vertex_b], edge_weight)
//         distance_matrix[vertex_b][vertex_a] = min(distance_matrix[vertex_b][vertex_a], edge_weight)

//     # Progressively allow each vertex as an intermediate stopping point.
//     for intermediate_vertex in range(vertex_count):
//         for start_vertex in range(vertex_count):
//             for end_vertex in range(vertex_count):
//                 distance_through_intermediate = (
//                     distance_matrix[start_vertex][intermediate_vertex] +
//                     distance_matrix[intermediate_vertex][end_vertex]
//                 )
//                 if distance_through_intermediate < distance_matrix[start_vertex][end_vertex]:
//                     distance_matrix[start_vertex][end_vertex] = distance_through_intermediate

//     return distance_matrix


// def main():
//     # Static demonstration data - an undirected weighted graph with 4 vertices.
//     vertex_count = 4
//     edge_list = [(0, 1, 3), (0, 3, 7), (1, 2, 2), (2, 3, 1), (1, 3, 5)]

//     distance_matrix = floyd_warshall(vertex_count, edge_list)

//     print("All-pairs shortest distances:")
//     for start_vertex in range(vertex_count):
//         row_values = []
//         for end_vertex in range(vertex_count):
//             distance_value = distance_matrix[start_vertex][end_vertex]
//             row_values.append(-1 if distance_value == INFINITY_VALUE else distance_value)
//         print("  " + str(row_values))


// if __name__ == "__main__":
//     main()
// `,
//         "java": `import java.util.Arrays;

// public class Main {

//     static final int INFINITY_VALUE = 1000000000;

//     // Computes all-pairs shortest distances for a graph with 'vertexCount'
//     // vertices and undirected weighted edges 'edgeList', using the
//     // Floyd-Warshall algorithm. Returns the completed V x V distance matrix.
//     // Each entry in edgeList is {vertexA, vertexB, edgeWeight}.
//     static int[][] floydWarshall(int vertexCount, int[][] edgeList) {
//         int[][] distanceMatrix = new int[vertexCount][vertexCount];
//         for (int[] row : distanceMatrix) {
//             Arrays.fill(row, INFINITY_VALUE);
//         }

//         // A vertex's distance to itself is always zero.
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             distanceMatrix[vertex][vertex] = 0;
//         }

//         // Seed the matrix with the direct edge weights given in edgeList.
//         for (int[] edge : edgeList) {
//             int vertexA = edge[0];
//             int vertexB = edge[1];
//             int edgeWeight = edge[2];
//             distanceMatrix[vertexA][vertexB] = Math.min(distanceMatrix[vertexA][vertexB], edgeWeight);
//             distanceMatrix[vertexB][vertexA] = Math.min(distanceMatrix[vertexB][vertexA], edgeWeight);
//         }

//         // Progressively allow each vertex as an intermediate stopping point.
//         for (int intermediateVertex = 0; intermediateVertex < vertexCount; intermediateVertex++) {
//             for (int startVertex = 0; startVertex < vertexCount; startVertex++) {
//                 for (int endVertex = 0; endVertex < vertexCount; endVertex++) {
//                     if (distanceMatrix[startVertex][intermediateVertex] < INFINITY_VALUE &&
//                             distanceMatrix[intermediateVertex][endVertex] < INFINITY_VALUE) {
//                         int distanceThroughIntermediate =
//                                 distanceMatrix[startVertex][intermediateVertex] + distanceMatrix[intermediateVertex][endVertex];

//                         if (distanceThroughIntermediate < distanceMatrix[startVertex][endVertex]) {
//                             distanceMatrix[startVertex][endVertex] = distanceThroughIntermediate;
//                         }
//                     }
//                 }
//             }
//         }

//         return distanceMatrix;
//     }

//     public static void main(String[] args) {
//         // Static demonstration data — an undirected weighted graph with 4 vertices.
//         int vertexCount = 4;
//         int[][] edgeList = {
//             {0, 1, 3}, {0, 3, 7}, {1, 2, 2}, {2, 3, 1}, {1, 3, 5}
//         };

//         int[][] distanceMatrix = floydWarshall(vertexCount, edgeList);

//         System.out.println("All-pairs shortest distances:");
//         for (int startVertex = 0; startVertex < vertexCount; startVertex++) {
//             StringBuilder rowText = new StringBuilder();
//             for (int endVertex = 0; endVertex < vertexCount; endVertex++) {
//                 int distanceValue = distanceMatrix[startVertex][endVertex];
//                 rowText.append(distanceValue == INFINITY_VALUE ? -1 : distanceValue).append("\\t");
//             }
//             System.out.println(rowText);
//         }
//     }
// }
// `,
//         "js": `const INFINITY_VALUE = 1000000000;

// // Computes all-pairs shortest distances for a graph with 'vertexCount'
// // vertices and undirected weighted edges 'edgeList', using the
// // Floyd-Warshall algorithm. Returns the completed V x V distance matrix.
// // Each entry in edgeList is [vertexA, vertexB, edgeWeight].
// function floydWarshall(vertexCount, edgeList) {
//     const distanceMatrix = Array.from({ length: vertexCount }, () =>
//         new Array(vertexCount).fill(INFINITY_VALUE)
//     );

//     // A vertex's distance to itself is always zero.
//     for (let vertex = 0; vertex < vertexCount; vertex++) {
//         distanceMatrix[vertex][vertex] = 0;
//     }

//     // Seed the matrix with the direct edge weights given in edgeList.
//     for (const [vertexA, vertexB, edgeWeight] of edgeList) {
//         distanceMatrix[vertexA][vertexB] = Math.min(distanceMatrix[vertexA][vertexB], edgeWeight);
//         distanceMatrix[vertexB][vertexA] = Math.min(distanceMatrix[vertexB][vertexA], edgeWeight);
//     }

//     // Progressively allow each vertex as an intermediate stopping point.
//     for (let intermediateVertex = 0; intermediateVertex < vertexCount; intermediateVertex++) {
//         for (let startVertex = 0; startVertex < vertexCount; startVertex++) {
//             for (let endVertex = 0; endVertex < vertexCount; endVertex++) {
//                 const distanceThroughIntermediate =
//                     distanceMatrix[startVertex][intermediateVertex] + distanceMatrix[intermediateVertex][endVertex];

//                 if (distanceThroughIntermediate < distanceMatrix[startVertex][endVertex]) {
//                     distanceMatrix[startVertex][endVertex] = distanceThroughIntermediate;
//                 }
//             }
//         }
//     }

//     return distanceMatrix;
// }

// function main() {
//     // Static demonstration data — an undirected weighted graph with 4 vertices.
//     const vertexCount = 4;
//     const edgeList = [
//         [0, 1, 3], [0, 3, 7], [1, 2, 2], [2, 3, 1], [1, 3, 5]
//     ];

//     const distanceMatrix = floydWarshall(vertexCount, edgeList);

//     console.log("All-pairs shortest distances:");
//     for (let startVertex = 0; startVertex < vertexCount; startVertex++) {
//         const rowValues = distanceMatrix[startVertex].map(
//             (distanceValue) => (distanceValue === INFINITY_VALUE ? -1 : distanceValue)
//         );
//         console.log("  " + rowValues.join("\\t"));
//     }
// }

// main();
// `,
//         "c": `#include <stdio.h>

// #define MAX_VERTICES 100
// #define INFINITY_VALUE 1000000000

// int distanceMatrix[MAX_VERTICES][MAX_VERTICES];

// // Computes all-pairs shortest distances into the global 'distanceMatrix'
// // using the Floyd-Warshall algorithm. 'edgeList' entries are
// // {vertexA, vertexB, edgeWeight}.
// void floydWarshall(int vertexCount, int edgeList[][3], int edgeCount) {
//     for (int startVertex = 0; startVertex < vertexCount; startVertex++) {
//         for (int endVertex = 0; endVertex < vertexCount; endVertex++) {
//             distanceMatrix[startVertex][endVertex] = (startVertex == endVertex) ? 0 : INFINITY_VALUE;
//         }
//     }

//     /* Seed the matrix with the direct edge weights given in edgeList. */
//     for (int i = 0; i < edgeCount; i++) {
//         int vertexA = edgeList[i][0];
//         int vertexB = edgeList[i][1];
//         int edgeWeight = edgeList[i][2];
//         if (edgeWeight < distanceMatrix[vertexA][vertexB]) {
//             distanceMatrix[vertexA][vertexB] = edgeWeight;
//         }
//         if (edgeWeight < distanceMatrix[vertexB][vertexA]) {
//             distanceMatrix[vertexB][vertexA] = edgeWeight;
//         }
//     }

//     /* Progressively allow each vertex as an intermediate stopping point. */
//     for (int intermediateVertex = 0; intermediateVertex < vertexCount; intermediateVertex++) {
//         for (int startVertex = 0; startVertex < vertexCount; startVertex++) {
//             for (int endVertex = 0; endVertex < vertexCount; endVertex++) {
//                 if (distanceMatrix[startVertex][intermediateVertex] < INFINITY_VALUE &&
//                     distanceMatrix[intermediateVertex][endVertex] < INFINITY_VALUE) {
//                     int distanceThroughIntermediate =
//                         distanceMatrix[startVertex][intermediateVertex] + distanceMatrix[intermediateVertex][endVertex];
//                     if (distanceThroughIntermediate < distanceMatrix[startVertex][endVertex]) {
//                         distanceMatrix[startVertex][endVertex] = distanceThroughIntermediate;
//                     }
//                 }
//             }
//         }
//     }
// }

// int main() {
//     /* Static demonstration data - an undirected weighted graph with 4 vertices. */
//     int vertexCount = 4;
//     int edgeList[][3] = {
//         {0, 1, 3}, {0, 3, 7}, {1, 2, 2}, {2, 3, 1}, {1, 3, 5}
//     };
//     int edgeCount = 5;

//     floydWarshall(vertexCount, edgeList, edgeCount);

//     printf("All-pairs shortest distances:\\n");
//     for (int startVertex = 0; startVertex < vertexCount; startVertex++) {
//         for (int endVertex = 0; endVertex < vertexCount; endVertex++) {
//             int distanceValue = distanceMatrix[startVertex][endVertex];
//             printf("%d\\t", distanceValue == INFINITY_VALUE ? -1 : distanceValue);
//         }
//         printf("\\n");
//     }

//     return 0;
// }
// `,
//         "c#": `using System;

// class Program {

//     const int InfinityValue = 1000000000;

//     // Computes all-pairs shortest distances for a graph with 'vertexCount'
//     // vertices and undirected weighted edges 'edgeList', using the
//     // Floyd-Warshall algorithm. Returns the completed V x V distance matrix.
//     // Each entry in edgeList is {vertexA, vertexB, edgeWeight}.
//     static int[,] FloydWarshall(int vertexCount, int[][] edgeList) {
//         int[,] distanceMatrix = new int[vertexCount, vertexCount];
//         for (int startVertex = 0; startVertex < vertexCount; startVertex++) {
//             for (int endVertex = 0; endVertex < vertexCount; endVertex++) {
//                 distanceMatrix[startVertex, endVertex] = (startVertex == endVertex) ? 0 : InfinityValue;
//             }
//         }

//         // Seed the matrix with the direct edge weights given in edgeList.
//         foreach (int[] edge in edgeList) {
//             int vertexA = edge[0];
//             int vertexB = edge[1];
//             int edgeWeight = edge[2];
//             distanceMatrix[vertexA, vertexB] = Math.Min(distanceMatrix[vertexA, vertexB], edgeWeight);
//             distanceMatrix[vertexB, vertexA] = Math.Min(distanceMatrix[vertexB, vertexA], edgeWeight);
//         }

//         // Progressively allow each vertex as an intermediate stopping point.
//         for (int intermediateVertex = 0; intermediateVertex < vertexCount; intermediateVertex++) {
//             for (int startVertex = 0; startVertex < vertexCount; startVertex++) {
//                 for (int endVertex = 0; endVertex < vertexCount; endVertex++) {
//                     if (distanceMatrix[startVertex, intermediateVertex] < InfinityValue &&
//                         distanceMatrix[intermediateVertex, endVertex] < InfinityValue) {
//                         int distanceThroughIntermediate =
//                             distanceMatrix[startVertex, intermediateVertex] + distanceMatrix[intermediateVertex, endVertex];

//                         if (distanceThroughIntermediate < distanceMatrix[startVertex, endVertex]) {
//                             distanceMatrix[startVertex, endVertex] = distanceThroughIntermediate;
//                         }
//                     }
//                 }
//             }
//         }

//         return distanceMatrix;
//     }

//     static void Main() {
//         // Static demonstration data — an undirected weighted graph with 4 vertices.
//         int vertexCount = 4;
//         int[][] edgeList = {
//             new[] {0, 1, 3}, new[] {0, 3, 7}, new[] {1, 2, 2}, new[] {2, 3, 1}, new[] {1, 3, 5}
//         };

//         int[,] distanceMatrix = FloydWarshall(vertexCount, edgeList);

//         Console.WriteLine("All-pairs shortest distances:");
//         for (int startVertex = 0; startVertex < vertexCount; startVertex++) {
//             for (int endVertex = 0; endVertex < vertexCount; endVertex++) {
//                 int distanceValue = distanceMatrix[startVertex, endVertex];
//                 Console.Write((distanceValue == InfinityValue ? -1 : distanceValue) + "\\t");
//             }
//             Console.WriteLine();
//         }
//     }
// }
// `,
//         "swift": `import Foundation

// let infinityValue = Int.max / 2

// // Computes all-pairs shortest distances for a graph with 'vertexCount'
// // vertices and undirected weighted edges 'edgeList', using the
// // Floyd-Warshall algorithm. Returns the completed V x V distance matrix.
// // Each entry in edgeList is (vertexA, vertexB, edgeWeight).
// func floydWarshall(_ vertexCount: Int, _ edgeList: [(Int, Int, Int)]) -> [[Int]] {
//     var distanceMatrix = [[Int]](repeating: [Int](repeating: infinityValue, count: vertexCount), count: vertexCount)

//     // A vertex's distance to itself is always zero.
//     for vertex in 0..<vertexCount {
//         distanceMatrix[vertex][vertex] = 0
//     }

//     // Seed the matrix with the direct edge weights given in edgeList.
//     for (vertexA, vertexB, edgeWeight) in edgeList {
//         distanceMatrix[vertexA][vertexB] = min(distanceMatrix[vertexA][vertexB], edgeWeight)
//         distanceMatrix[vertexB][vertexA] = min(distanceMatrix[vertexB][vertexA], edgeWeight)
//     }

//     // Progressively allow each vertex as an intermediate stopping point.
//     for intermediateVertex in 0..<vertexCount {
//         for startVertex in 0..<vertexCount {
//             for endVertex in 0..<vertexCount {
//                 if distanceMatrix[startVertex][intermediateVertex] < infinityValue &&
//                     distanceMatrix[intermediateVertex][endVertex] < infinityValue {
//                     let distanceThroughIntermediate =
//                         distanceMatrix[startVertex][intermediateVertex] + distanceMatrix[intermediateVertex][endVertex]

//                     if distanceThroughIntermediate < distanceMatrix[startVertex][endVertex] {
//                         distanceMatrix[startVertex][endVertex] = distanceThroughIntermediate
//                     }
//                 }
//             }
//         }
//     }

//     return distanceMatrix
// }

// // Static demonstration data — an undirected weighted graph with 4 vertices.
// let vertexCount = 4
// let edgeList = [(0, 1, 3), (0, 3, 7), (1, 2, 2), (2, 3, 1), (1, 3, 5)]

// let distanceMatrix = floydWarshall(vertexCount, edgeList)

// print("All-pairs shortest distances:")
// for startVertex in 0..<vertexCount {
//     let rowValues = distanceMatrix[startVertex].map { $0 == infinityValue ? -1 : $0 }
//     print("  \\(rowValues)")
// }
// `,
//         "kotlin": `const val INFINITY_VALUE = 1000000000

// // Computes all-pairs shortest distances for a graph with 'vertexCount'
// // vertices and undirected weighted edges 'edgeList', using the
// // Floyd-Warshall algorithm. Returns the completed V x V distance matrix.
// // Each entry in edgeList is a Triple(vertexA, vertexB, edgeWeight).
// fun floydWarshall(vertexCount: Int, edgeList: List<Triple<Int, Int, Int>>): Array<IntArray> {
//     val distanceMatrix = Array(vertexCount) { startVertex ->
//         IntArray(vertexCount) { endVertex -> if (startVertex == endVertex) 0 else INFINITY_VALUE }
//     }

//     // Seed the matrix with the direct edge weights given in edgeList.
//     for ((vertexA, vertexB, edgeWeight) in edgeList) {
//         distanceMatrix[vertexA][vertexB] = minOf(distanceMatrix[vertexA][vertexB], edgeWeight)
//         distanceMatrix[vertexB][vertexA] = minOf(distanceMatrix[vertexB][vertexA], edgeWeight)
//     }

//     // Progressively allow each vertex as an intermediate stopping point.
//     for (intermediateVertex in 0 until vertexCount) {
//         for (startVertex in 0 until vertexCount) {
//             for (endVertex in 0 until vertexCount) {
//                 if (distanceMatrix[startVertex][intermediateVertex] < INFINITY_VALUE &&
//                     distanceMatrix[intermediateVertex][endVertex] < INFINITY_VALUE) {
//                     val distanceThroughIntermediate =
//                         distanceMatrix[startVertex][intermediateVertex] + distanceMatrix[intermediateVertex][endVertex]

//                     if (distanceThroughIntermediate < distanceMatrix[startVertex][endVertex]) {
//                         distanceMatrix[startVertex][endVertex] = distanceThroughIntermediate
//                     }
//                 }
//             }
//         }
//     }

//     return distanceMatrix
// }

// fun main() {
//     // Static demonstration data — an undirected weighted graph with 4 vertices.
//     val vertexCount = 4
//     val edgeList = listOf(
//         Triple(0, 1, 3), Triple(0, 3, 7), Triple(1, 2, 2), Triple(2, 3, 1), Triple(1, 3, 5)
//     )

//     val distanceMatrix = floydWarshall(vertexCount, edgeList)

//     println("All-pairs shortest distances:")
//     for (startVertex in 0 until vertexCount) {
//         val rowValues = distanceMatrix[startVertex].map { if (it == INFINITY_VALUE) -1 else it }
//         println("  $rowValues")
//     }
// }
// `,
//         "scala": `object Main extends App {

//   val InfinityValue = Int.MaxValue / 2

//   // Computes all-pairs shortest distances for a graph with 'vertexCount'
//   // vertices and undirected weighted edges 'edgeList', using the
//   // Floyd-Warshall algorithm. Returns the completed V x V distance matrix.
//   // Each entry in edgeList is (vertexA, vertexB, edgeWeight).
//   def floydWarshall(vertexCount: Int, edgeList: List[(Int, Int, Int)]): Array[Array[Int]] = {
//     val distanceMatrix = Array.tabulate(vertexCount, vertexCount) { (startVertex, endVertex) =>
//       if (startVertex == endVertex) 0 else InfinityValue
//     }

//     // Seed the matrix with the direct edge weights given in edgeList.
//     for ((vertexA, vertexB, edgeWeight) <- edgeList) {
//       distanceMatrix(vertexA)(vertexB) = distanceMatrix(vertexA)(vertexB) min edgeWeight
//       distanceMatrix(vertexB)(vertexA) = distanceMatrix(vertexB)(vertexA) min edgeWeight
//     }

//     // Progressively allow each vertex as an intermediate stopping point.
//     for (intermediateVertex <- 0 until vertexCount; startVertex <- 0 until vertexCount; endVertex <- 0 until vertexCount) {
//       if (distanceMatrix(startVertex)(intermediateVertex) < InfinityValue &&
//           distanceMatrix(intermediateVertex)(endVertex) < InfinityValue) {
//         val distanceThroughIntermediate =
//           distanceMatrix(startVertex)(intermediateVertex) + distanceMatrix(intermediateVertex)(endVertex)

//         if (distanceThroughIntermediate < distanceMatrix(startVertex)(endVertex)) {
//           distanceMatrix(startVertex)(endVertex) = distanceThroughIntermediate
//         }
//       }
//     }

//     distanceMatrix
//   }

//   // Static demonstration data — an undirected weighted graph with 4 vertices.
//   val vertexCount = 4
//   val edgeList = List((0, 1, 3), (0, 3, 7), (1, 2, 2), (2, 3, 1), (1, 3, 5))

//   val distanceMatrix = floydWarshall(vertexCount, edgeList)

//   println("All-pairs shortest distances:")
//   for (startVertex <- 0 until vertexCount) {
//     val rowValues = distanceMatrix(startVertex).map(value => if (value == InfinityValue) -1 else value)
//     println(s"  \${rowValues.mkString(", ")}")
//   }
// }
// `,
//         "go": `package main

// import "fmt"

// const infinityValue = 1000000000

// // floydWarshall computes all-pairs shortest distances for a graph with
// // vertexCount vertices and undirected weighted edges edgeList, using the
// // Floyd-Warshall algorithm. Returns the completed V x V distance matrix.
// // Each entry in edgeList is [vertexA, vertexB, edgeWeight].
// func floydWarshall(vertexCount int, edgeList [][3]int) [][]int {
// 	distanceMatrix := make([][]int, vertexCount)
// 	for startVertex := range distanceMatrix {
// 		distanceMatrix[startVertex] = make([]int, vertexCount)
// 		for endVertex := range distanceMatrix[startVertex] {
// 			if startVertex == endVertex {
// 				distanceMatrix[startVertex][endVertex] = 0
// 			} else {
// 				distanceMatrix[startVertex][endVertex] = infinityValue
// 			}
// 		}
// 	}

// 	// Seed the matrix with the direct edge weights given in edgeList.
// 	for _, edge := range edgeList {
// 		vertexA, vertexB, edgeWeight := edge[0], edge[1], edge[2]
// 		if edgeWeight < distanceMatrix[vertexA][vertexB] {
// 			distanceMatrix[vertexA][vertexB] = edgeWeight
// 		}
// 		if edgeWeight < distanceMatrix[vertexB][vertexA] {
// 			distanceMatrix[vertexB][vertexA] = edgeWeight
// 		}
// 	}

// 	// Progressively allow each vertex as an intermediate stopping point.
// 	for intermediateVertex := 0; intermediateVertex < vertexCount; intermediateVertex++ {
// 		for startVertex := 0; startVertex < vertexCount; startVertex++ {
// 			for endVertex := 0; endVertex < vertexCount; endVertex++ {
// 				distanceThroughIntermediate := distanceMatrix[startVertex][intermediateVertex] + distanceMatrix[intermediateVertex][endVertex]
// 				if distanceThroughIntermediate < distanceMatrix[startVertex][endVertex] {
// 					distanceMatrix[startVertex][endVertex] = distanceThroughIntermediate
// 				}
// 			}
// 		}
// 	}

// 	return distanceMatrix
// }

// func main() {
// 	// Static demonstration data - an undirected weighted graph with 4 vertices.
// 	vertexCount := 4
// 	edgeList := [][3]int{
// 		{0, 1, 3}, {0, 3, 7}, {1, 2, 2}, {2, 3, 1}, {1, 3, 5},
// 	}

// 	distanceMatrix := floydWarshall(vertexCount, edgeList)

// 	fmt.Println("All-pairs shortest distances:")
// 	for startVertex := 0; startVertex < vertexCount; startVertex++ {
// 		for endVertex := 0; endVertex < vertexCount; endVertex++ {
// 			distanceValue := distanceMatrix[startVertex][endVertex]
// 			if distanceValue == infinityValue {
// 				fmt.Print("-1\t")
// 			} else {
// 				fmt.Printf("%d\t", distanceValue)
// 			}
// 		}
// 		fmt.Println()
// 	}
// }
// `,
//         "rust": `const INFINITY_VALUE: i32 = i32::MAX / 2;

// // Computes all-pairs shortest distances for a graph with 'vertex_count'
// // vertices and undirected weighted edges 'edge_list', using the
// // Floyd-Warshall algorithm. Returns the completed V x V distance matrix.
// // Each entry in edge_list is (vertex_a, vertex_b, edge_weight).
// fn floyd_warshall(vertex_count: usize, edge_list: &[(usize, usize, i32)]) -> Vec<Vec<i32>> {
//     let mut distance_matrix: Vec<Vec<i32>> = vec![vec![INFINITY_VALUE; vertex_count]; vertex_count];

//     // A vertex's distance to itself is always zero.
//     for vertex in 0..vertex_count {
//         distance_matrix[vertex][vertex] = 0;
//     }

//     // Seed the matrix with the direct edge weights given in edge_list.
//     for &(vertex_a, vertex_b, edge_weight) in edge_list {
//         distance_matrix[vertex_a][vertex_b] = distance_matrix[vertex_a][vertex_b].min(edge_weight);
//         distance_matrix[vertex_b][vertex_a] = distance_matrix[vertex_b][vertex_a].min(edge_weight);
//     }

//     // Progressively allow each vertex as an intermediate stopping point.
//     for intermediate_vertex in 0..vertex_count {
//         for start_vertex in 0..vertex_count {
//             for end_vertex in 0..vertex_count {
//                 if distance_matrix[start_vertex][intermediate_vertex] < INFINITY_VALUE
//                     && distance_matrix[intermediate_vertex][end_vertex] < INFINITY_VALUE
//                 {
//                     let distance_through_intermediate =
//                         distance_matrix[start_vertex][intermediate_vertex] + distance_matrix[intermediate_vertex][end_vertex];

//                     if distance_through_intermediate < distance_matrix[start_vertex][end_vertex] {
//                         distance_matrix[start_vertex][end_vertex] = distance_through_intermediate;
//                     }
//                 }
//             }
//         }
//     }

//     distance_matrix
// }

// fn main() {
//     // Static demonstration data - an undirected weighted graph with 4 vertices.
//     let vertex_count = 4;
//     let edge_list = vec![(0, 1, 3), (0, 3, 7), (1, 2, 2), (2, 3, 1), (1, 3, 5)];

//     let distance_matrix = floyd_warshall(vertex_count, &edge_list);

//     println!("All-pairs shortest distances:");
//     for start_vertex in 0..vertex_count {
//         let row_values: Vec<i32> = distance_matrix[start_vertex]
//             .iter()
//             .map(|&value| if value == INFINITY_VALUE { -1 } else { value })
//             .collect();
//         println!("  {:?}", row_values);
//     }
// }
// `
//       }
//     },
//     /* ════════════════════════════════════════════════════════════════════
//        7. KRUSKAL'S ALGORITHM
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Kruskal's Algorithm",
//       href: "/algorithms/graphs/kruskal",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "Kruskal's Algorithm" },
//         { tag: "p", text: "Kruskal's Algorithm, published by Joseph Kruskal in 1956, finds a Minimum Spanning Tree (MST) — a subset of edges connecting all vertices with the minimum possible total edge weight, and no cycles. It is greedy and edge-centric: sort all edges by weight ascending, then repeatedly add the cheapest remaining edge as long as it doesn't create a cycle with edges already chosen." },
//         { tag: "p", text: "Cycle detection is handled efficiently using a Union-Find (Disjoint Set Union) data structure: two vertices are in the same 'set' if and only if they're already connected by previously chosen edges, so an edge creates a cycle exactly when its two endpoints are already in the same set." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Network design problems: minimum cost to connect all locations (cabling, pipelines, road networks)",
//           "The graph is sparse (E close to V) — Kruskal's E log E sorting cost is then very competitive",
//           "You naturally have a list of edges available (rather than needing efficient per-vertex neighbor lookup, which favours Prim's)",
//           "Clustering applications: stopping Kruskal's early (before connecting everything) produces a natural hierarchical clustering"
//         ]},
//         { tag: "note", variant: "tip", text: "Kruskal's is typically preferred for sparse graphs (few edges relative to vertices), while Prim's with a Fibonacci heap is typically preferred for dense graphs — though both have the same theoretical correctness." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(E log E)",
//         best: [
//           { tag: "h2", text: "Best Case — O(E log E)" },
//           { tag: "p", text: "Sorting all edges always dominates the cost and is required regardless of input structure — there's no shortcut even if the MST happens to be trivially the first V−1 edges in sorted order." },
//           { tag: "ul", items: [
//             "Sorting E edges: O(E log E)",
//             "Processing each edge with Union-Find (near O(1) amortised with path compression and union by rank): O(E · α(V)), where α is the inverse Ackermann function — effectively constant",
//             "Total dominated by sorting: O(E log E)"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(E log E)" },
//           { tag: "p", text: "Both the sorting step and the union-find processing perform the same structural work regardless of edge weight distribution — comparison-based sorting is Θ(E log E) for any input, and Union-Find operations are near-constant regardless of which specific edges form the eventual MST." },
//           { tag: "ul", items: [
//             "O(E log E) for sorting (dominates)",
//             "O(E · α(V)) for the union-find based cycle checks, which is effectively O(E) for all practical purposes",
//             "Total: O(E log E)"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(E log E)" },
//           { tag: "p", text: "No edge weight configuration increases the cost beyond the sorting step's bound — even a graph requiring every single edge to be checked for cycles still fits within this envelope, since Union-Find operations are near-constant time." },
//           { tag: "ul", items: [
//             "Worst case equals best/average: O(E log E)",
//             "Since E ≤ V² always, this can also be expressed as O(E log V) (because log(V²) = 2 log V, a constant factor difference) — both notations are commonly seen in textbooks"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(V + E)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(V + E)" },
//           { tag: "p", text: "The algorithm needs the full edge list (O(E)) plus a Union-Find structure sized to the vertex count (O(V))." },
//           { tag: "ul", items: ["Edge list: O(E)", "Union-Find parent/rank arrays: O(V)", "MST result (at most V−1 edges): O(V)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(V + E)" },
//           { tag: "p", text: "Memory usage is fixed by graph size alone, since both the edge list and the union-find structure are sized independently of the specific weight values or which edges end up in the MST." },
//           { tag: "ul", items: ["Same O(V + E) bound regardless of edge weight distribution"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(V + E)" },
//           { tag: "p", text: "No graph configuration increases space beyond storing the full edge list and the fixed-size Union-Find structure." },
//           { tag: "ul", items: ["O(E) for edges + O(V) for Union-Find = O(V + E), identical across all cases"] }
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function kruskalMST(graph):
//     minimumSpanningTree ← empty list
//     sortedEdges ← sort graph.edges by edgeWeight ascending

//     disjointSet ← new DisjointSet(graph.vertices)   // each vertex starts in its own set

//     for (vertexA, vertexB, edgeWeight) in sortedEdges:
//         if disjointSet.find(vertexA) != disjointSet.find(vertexB):
//             minimumSpanningTree.append((vertexA, vertexB, edgeWeight))
//             disjointSet.union(vertexA, vertexB)
//             if length(minimumSpanningTree) == numVertices − 1:
//                 break                              // MST complete

//     return minimumSpanningTree` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Sort every edge in the graph by weight, ascending — this lets the algorithm greedily consider the cheapest edges first.",
//           "Initialise a Union-Find structure where every vertex starts in its own singleton set.",
//           "Process edges in sorted order: for each edge (vertexA, vertexB), check whether vertexA and vertexB are already in the same set (meaning they're already connected via previously chosen MST edges).",
//           "If they're in different sets, adding this edge connects two previously separate components without creating a cycle — add it to the MST and merge (union) the two sets.",
//           "If they're already in the same set, adding this edge would create a cycle — skip it.",
//           "Stop once V − 1 edges have been added (a spanning tree on V vertices always has exactly V − 1 edges)."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "This follows from the Cut Property of MSTs: for any partition of the vertices into two non-empty sets, the minimum-weight edge crossing that partition must be part of some MST. Processing edges in ascending weight order and only adding an edge when it connects two different components is exactly choosing, at each step, the minimum-weight edge crossing the cut between 'already-connected components' and 'everything else' — which the Cut Property guarantees is always safe to include. The greedy choice never needs to be undone, and since Union-Find correctly tracks connectivity, every cycle-forming edge is correctly rejected, yielding a true minimum spanning tree." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <algorithm>
// using namespace std;

// // Simple structure representing one undirected, weighted edge.
// struct Edge {
//     int vertexA;
//     int vertexB;
//     int edgeWeight;
// };

// vector<int> parentOf;
// vector<int> rankOf;

// // Initialises the disjoint-set structure so every vertex starts as its
// // own parent (i.e. its own singleton set).
// void initializeDisjointSet(int vertexCount) {
//     parentOf.assign(vertexCount, 0);
//     rankOf.assign(vertexCount, 0);
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         parentOf[vertex] = vertex;
//     }
// }

// // Finds the representative ("root") of the set containing 'vertex',
// // applying path compression so future lookups are faster.
// int findSetRoot(int vertex) {
//     if (parentOf[vertex] != vertex) {
//         parentOf[vertex] = findSetRoot(parentOf[vertex]);
//     }
//     return parentOf[vertex];
// }

// // Merges the sets containing 'vertexA' and 'vertexB'. Returns false if
// // they were already in the same set (meaning the edge would form a cycle).
// bool unionSets(int vertexA, int vertexB) {
//     int rootA = findSetRoot(vertexA);
//     int rootB = findSetRoot(vertexB);

//     if (rootA == rootB) {
//         return false; // already connected — adding this edge would create a cycle
//     }

//     // Union by rank: attach the smaller-rank tree under the larger one.
//     if (rankOf[rootA] < rankOf[rootB]) {
//         swap(rootA, rootB);
//     }
//     parentOf[rootB] = rootA;
//     if (rankOf[rootA] == rankOf[rootB]) {
//         rankOf[rootA]++;
//     }

//     return true;
// }

// // Computes a Minimum Spanning Tree of the graph described by 'edgeList'
// // using Kruskal's algorithm, and returns the list of edges included.
// vector<Edge> kruskalMST(int vertexCount, vector<Edge> edgeList) {
//     sort(edgeList.begin(), edgeList.end(), [](const Edge& first, const Edge& second) {
//         return first.edgeWeight < second.edgeWeight;
//     });

//     initializeDisjointSet(vertexCount);

//     vector<Edge> minimumSpanningTree;
//     for (const Edge& edge : edgeList) {
//         if (unionSets(edge.vertexA, edge.vertexB)) {
//             minimumSpanningTree.push_back(edge);
//             if ((int)minimumSpanningTree.size() == vertexCount - 1) {
//                 break; // a spanning tree on vertexCount vertices has exactly (vertexCount - 1) edges
//             }
//         }
//     }

//     return minimumSpanningTree;
// }

// int main() {
//     // Static demonstration data — an undirected weighted graph with 4 vertices.
//     int vertexCount = 4;
//     vector<Edge> edgeList = {
//         {0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}
//     };

//     vector<Edge> minimumSpanningTree = kruskalMST(vertexCount, edgeList);

//     int totalWeight = 0;
//     cout << "Minimum Spanning Tree edges:" << endl;
//     for (const Edge& edge : minimumSpanningTree) {
//         cout << "  " << edge.vertexA << " -- " << edge.vertexB << " (weight " << edge.edgeWeight << ")" << endl;
//         totalWeight += edge.edgeWeight;
//     }
//     cout << "Total MST weight: " << totalWeight << endl;

//     return 0;
// }
// `,
//         "python": `def initialize_disjoint_set(vertex_count):
//     """Returns a fresh disjoint-set (union-find) where every vertex starts
//     as its own parent (i.e. its own singleton set)."""
//     parent_of = list(range(vertex_count))
//     rank_of = [0] * vertex_count
//     return parent_of, rank_of


// def find_set_root(parent_of, vertex):
//     """Finds the representative ("root") of the set containing 'vertex',
//     applying path compression so future lookups are faster."""
//     if parent_of[vertex] != vertex:
//         parent_of[vertex] = find_set_root(parent_of, parent_of[vertex])
//     return parent_of[vertex]


// def union_sets(parent_of, rank_of, vertex_a, vertex_b):
//     """Merges the sets containing 'vertex_a' and 'vertex_b'. Returns False
//     if they were already in the same set (the edge would form a cycle)."""
//     root_a = find_set_root(parent_of, vertex_a)
//     root_b = find_set_root(parent_of, vertex_b)

//     if root_a == root_b:
//         return False  # already connected - adding this edge would create a cycle

//     # Union by rank: attach the smaller-rank tree under the larger one.
//     if rank_of[root_a] < rank_of[root_b]:
//         root_a, root_b = root_b, root_a
//     parent_of[root_b] = root_a
//     if rank_of[root_a] == rank_of[root_b]:
//         rank_of[root_a] += 1

//     return True


// def kruskal_mst(vertex_count, edge_list):
//     """
//     Computes a Minimum Spanning Tree of the graph described by 'edge_list'
//     using Kruskal's algorithm, and returns the list of edges included.

//     Each entry in edge_list is a (vertex_a, vertex_b, edge_weight) tuple.
//     """
//     sorted_edges = sorted(edge_list, key=lambda edge: edge[2])
//     parent_of, rank_of = initialize_disjoint_set(vertex_count)

//     minimum_spanning_tree = []
//     for vertex_a, vertex_b, edge_weight in sorted_edges:
//         if union_sets(parent_of, rank_of, vertex_a, vertex_b):
//             minimum_spanning_tree.append((vertex_a, vertex_b, edge_weight))
//             if len(minimum_spanning_tree) == vertex_count - 1:
//                 break  # a spanning tree on vertex_count vertices has exactly (vertex_count - 1) edges

//     return minimum_spanning_tree


// def main():
//     # Static demonstration data - an undirected weighted graph with 4 vertices.
//     vertex_count = 4
//     edge_list = [(0, 1, 10), (0, 2, 6), (0, 3, 5), (1, 3, 15), (2, 3, 4)]

//     minimum_spanning_tree = kruskal_mst(vertex_count, edge_list)

//     total_weight = 0
//     print("Minimum Spanning Tree edges:")
//     for vertex_a, vertex_b, edge_weight in minimum_spanning_tree:
//         print(f"  {vertex_a} -- {vertex_b} (weight {edge_weight})")
//         total_weight += edge_weight
//     print(f"Total MST weight: {total_weight}")


// if __name__ == "__main__":
//     main()
// `,
//         "java": `import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.List;

// public class Main {

//     // Simple structure representing one undirected, weighted edge.
//     static class Edge {
//         int vertexA;
//         int vertexB;
//         int edgeWeight;

//         Edge(int vertexA, int vertexB, int edgeWeight) {
//             this.vertexA = vertexA;
//             this.vertexB = vertexB;
//             this.edgeWeight = edgeWeight;
//         }
//     }

//     static int[] parentOf;
//     static int[] rankOf;

//     // Initialises the disjoint-set structure so every vertex starts as its
//     // own parent (i.e. its own singleton set).
//     static void initializeDisjointSet(int vertexCount) {
//         parentOf = new int[vertexCount];
//         rankOf = new int[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             parentOf[vertex] = vertex;
//         }
//     }

//     // Finds the representative ("root") of the set containing 'vertex',
//     // applying path compression so future lookups are faster.
//     static int findSetRoot(int vertex) {
//         if (parentOf[vertex] != vertex) {
//             parentOf[vertex] = findSetRoot(parentOf[vertex]);
//         }
//         return parentOf[vertex];
//     }

//     // Merges the sets containing 'vertexA' and 'vertexB'. Returns false if
//     // they were already in the same set (meaning the edge would form a cycle).
//     static boolean unionSets(int vertexA, int vertexB) {
//         int rootA = findSetRoot(vertexA);
//         int rootB = findSetRoot(vertexB);

//         if (rootA == rootB) {
//             return false; // already connected — adding this edge would create a cycle
//         }

//         // Union by rank: attach the smaller-rank tree under the larger one.
//         if (rankOf[rootA] < rankOf[rootB]) {
//             int temp = rootA;
//             rootA = rootB;
//             rootB = temp;
//         }
//         parentOf[rootB] = rootA;
//         if (rankOf[rootA] == rankOf[rootB]) {
//             rankOf[rootA]++;
//         }

//         return true;
//     }

//     // Computes a Minimum Spanning Tree of the graph described by 'edgeList'
//     // using Kruskal's algorithm, and returns the list of edges included.
//     static List<Edge> kruskalMST(int vertexCount, Edge[] edgeList) {
//         Edge[] sortedEdges = edgeList.clone();
//         Arrays.sort(sortedEdges, (first, second) -> first.edgeWeight - second.edgeWeight);

//         initializeDisjointSet(vertexCount);

//         List<Edge> minimumSpanningTree = new ArrayList<>();
//         for (Edge edge : sortedEdges) {
//             if (unionSets(edge.vertexA, edge.vertexB)) {
//                 minimumSpanningTree.add(edge);
//                 if (minimumSpanningTree.size() == vertexCount - 1) {
//                     break; // a spanning tree on vertexCount vertices has exactly (vertexCount - 1) edges
//                 }
//             }
//         }

//         return minimumSpanningTree;
//     }

//     public static void main(String[] args) {
//         // Static demonstration data — an undirected weighted graph with 4 vertices.
//         int vertexCount = 4;
//         Edge[] edgeList = {
//             new Edge(0, 1, 10), new Edge(0, 2, 6), new Edge(0, 3, 5),
//             new Edge(1, 3, 15), new Edge(2, 3, 4)
//         };

//         List<Edge> minimumSpanningTree = kruskalMST(vertexCount, edgeList);

//         int totalWeight = 0;
//         System.out.println("Minimum Spanning Tree edges:");
//         for (Edge edge : minimumSpanningTree) {
//             System.out.println("  " + edge.vertexA + " -- " + edge.vertexB + " (weight " + edge.edgeWeight + ")");
//             totalWeight += edge.edgeWeight;
//         }
//         System.out.println("Total MST weight: " + totalWeight);
//     }
// }
// `,
//         "js": `// Initialises the disjoint-set structure so every vertex starts as its
// // own parent (i.e. its own singleton set).
// function initializeDisjointSet(vertexCount) {
//     const parentOf = new Array(vertexCount);
//     const rankOf = new Array(vertexCount).fill(0);
//     for (let vertex = 0; vertex < vertexCount; vertex++) {
//         parentOf[vertex] = vertex;
//     }
//     return { parentOf, rankOf };
// }

// // Finds the representative ("root") of the set containing 'vertex',
// // applying path compression so future lookups are faster.
// function findSetRoot(parentOf, vertex) {
//     if (parentOf[vertex] !== vertex) {
//         parentOf[vertex] = findSetRoot(parentOf, parentOf[vertex]);
//     }
//     return parentOf[vertex];
// }

// // Merges the sets containing 'vertexA' and 'vertexB'. Returns false if
// // they were already in the same set (meaning the edge would form a cycle).
// function unionSets(parentOf, rankOf, vertexA, vertexB) {
//     let rootA = findSetRoot(parentOf, vertexA);
//     let rootB = findSetRoot(parentOf, vertexB);

//     if (rootA === rootB) {
//         return false; // already connected — adding this edge would create a cycle
//     }

//     // Union by rank: attach the smaller-rank tree under the larger one.
//     if (rankOf[rootA] < rankOf[rootB]) {
//         [rootA, rootB] = [rootB, rootA];
//     }
//     parentOf[rootB] = rootA;
//     if (rankOf[rootA] === rankOf[rootB]) {
//         rankOf[rootA]++;
//     }

//     return true;
// }

// // Computes a Minimum Spanning Tree of the graph described by 'edgeList'
// // using Kruskal's algorithm, and returns the list of edges included.
// // Each entry in edgeList is [vertexA, vertexB, edgeWeight].
// function kruskalMST(vertexCount, edgeList) {
//     const sortedEdges = [...edgeList].sort((first, second) => first[2] - second[2]);
//     const { parentOf, rankOf } = initializeDisjointSet(vertexCount);

//     const minimumSpanningTree = [];
//     for (const edge of sortedEdges) {
//         const [vertexA, vertexB, edgeWeight] = edge;
//         if (unionSets(parentOf, rankOf, vertexA, vertexB)) {
//             minimumSpanningTree.push(edge);
//             if (minimumSpanningTree.length === vertexCount - 1) {
//                 break; // a spanning tree on vertexCount vertices has exactly (vertexCount - 1) edges
//             }
//         }
//     }

//     return minimumSpanningTree;
// }

// function main() {
//     // Static demonstration data — an undirected weighted graph with 4 vertices.
//     const vertexCount = 4;
//     const edgeList = [
//         [0, 1, 10], [0, 2, 6], [0, 3, 5], [1, 3, 15], [2, 3, 4]
//     ];

//     const minimumSpanningTree = kruskalMST(vertexCount, edgeList);

//     let totalWeight = 0;
//     console.log("Minimum Spanning Tree edges:");
//     for (const [vertexA, vertexB, edgeWeight] of minimumSpanningTree) {
//         console.log(\`  \${vertexA} -- \${vertexB} (weight \${edgeWeight})\`);
//         totalWeight += edgeWeight;
//     }
//     console.log("Total MST weight:", totalWeight);
// }

// main();
// `,
//         "c": `#include <stdio.h>
// #include <stdlib.h>

// #define MAX_VERTICES 100
// #define MAX_EDGES 100

// typedef struct {
//     int vertexA;
//     int vertexB;
//     int edgeWeight;
// } Edge;

// int parentOf[MAX_VERTICES];
// int rankOf[MAX_VERTICES];

// // Initialises the disjoint-set structure so every vertex starts as its
// // own parent (i.e. its own singleton set).
// void initializeDisjointSet(int vertexCount) {
//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         parentOf[vertex] = vertex;
//         rankOf[vertex] = 0;
//     }
// }

// // Finds the representative ("root") of the set containing 'vertex',
// // applying path compression so future lookups are faster.
// int findSetRoot(int vertex) {
//     if (parentOf[vertex] != vertex) {
//         parentOf[vertex] = findSetRoot(parentOf[vertex]);
//     }
//     return parentOf[vertex];
// }

// // Merges the sets containing 'vertexA' and 'vertexB'. Returns 1 on
// // success, or 0 if they were already in the same set (the edge would
// // form a cycle).
// int unionSets(int vertexA, int vertexB) {
//     int rootA = findSetRoot(vertexA);
//     int rootB = findSetRoot(vertexB);

//     if (rootA == rootB) {
//         return 0; /* already connected - adding this edge would create a cycle */
//     }

//     if (rankOf[rootA] < rankOf[rootB]) {
//         int temp = rootA;
//         rootA = rootB;
//         rootB = temp;
//     }
//     parentOf[rootB] = rootA;
//     if (rankOf[rootA] == rankOf[rootB]) {
//         rankOf[rootA]++;
//     }

//     return 1;
// }

// // Comparison function used by qsort to sort edges by ascending weight.
// int compareEdgesByWeight(const void* first, const void* second) {
//     return ((Edge*)first)->edgeWeight - ((Edge*)second)->edgeWeight;
// }

// int main() {
//     /* Static demonstration data - an undirected weighted graph with 4 vertices. */
//     int vertexCount = 4;
//     Edge edgeList[MAX_EDGES] = {
//         {0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}
//     };
//     int edgeCount = 5;

//     qsort(edgeList, edgeCount, sizeof(Edge), compareEdgesByWeight);
//     initializeDisjointSet(vertexCount);

//     Edge minimumSpanningTree[MAX_VERTICES];
//     int mstEdgeCount = 0;
//     int totalWeight = 0;

//     for (int i = 0; i < edgeCount && mstEdgeCount < vertexCount - 1; i++) {
//         if (unionSets(edgeList[i].vertexA, edgeList[i].vertexB)) {
//             minimumSpanningTree[mstEdgeCount++] = edgeList[i];
//             totalWeight += edgeList[i].edgeWeight;
//         }
//     }

//     printf("Minimum Spanning Tree edges:\\n");
//     for (int i = 0; i < mstEdgeCount; i++) {
//         printf("  %d -- %d (weight %d)\\n",
//                minimumSpanningTree[i].vertexA,
//                minimumSpanningTree[i].vertexB,
//                minimumSpanningTree[i].edgeWeight);
//     }
//     printf("Total MST weight: %d\\n", totalWeight);

//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;
// using System.Linq;

// class Program {

//     // Simple structure representing one undirected, weighted edge.
//     struct Edge {
//         public int VertexA;
//         public int VertexB;
//         public int EdgeWeight;

//         public Edge(int vertexA, int vertexB, int edgeWeight) {
//             VertexA = vertexA;
//             VertexB = vertexB;
//             EdgeWeight = edgeWeight;
//         }
//     }

//     static int[] parentOf;
//     static int[] rankOf;

//     // Initialises the disjoint-set structure so every vertex starts as its
//     // own parent (i.e. its own singleton set).
//     static void InitializeDisjointSet(int vertexCount) {
//         parentOf = new int[vertexCount];
//         rankOf = new int[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             parentOf[vertex] = vertex;
//         }
//     }

//     // Finds the representative ("root") of the set containing 'vertex',
//     // applying path compression so future lookups are faster.
//     static int FindSetRoot(int vertex) {
//         if (parentOf[vertex] != vertex) {
//             parentOf[vertex] = FindSetRoot(parentOf[vertex]);
//         }
//         return parentOf[vertex];
//     }

//     // Merges the sets containing 'vertexA' and 'vertexB'. Returns false if
//     // they were already in the same set (meaning the edge would form a cycle).
//     static bool UnionSets(int vertexA, int vertexB) {
//         int rootA = FindSetRoot(vertexA);
//         int rootB = FindSetRoot(vertexB);

//         if (rootA == rootB) {
//             return false; // already connected — adding this edge would create a cycle
//         }

//         if (rankOf[rootA] < rankOf[rootB]) {
//             (rootA, rootB) = (rootB, rootA);
//         }
//         parentOf[rootB] = rootA;
//         if (rankOf[rootA] == rankOf[rootB]) {
//             rankOf[rootA]++;
//         }

//         return true;
//     }

//     // Computes a Minimum Spanning Tree of the graph described by 'edgeList'
//     // using Kruskal's algorithm, and returns the list of edges included.
//     static List<Edge> KruskalMST(int vertexCount, List<Edge> edgeList) {
//         List<Edge> sortedEdges = edgeList.OrderBy(edge => edge.EdgeWeight).ToList();
//         InitializeDisjointSet(vertexCount);

//         var minimumSpanningTree = new List<Edge>();
//         foreach (Edge edge in sortedEdges) {
//             if (UnionSets(edge.VertexA, edge.VertexB)) {
//                 minimumSpanningTree.Add(edge);
//                 if (minimumSpanningTree.Count == vertexCount - 1) {
//                     break; // a spanning tree on vertexCount vertices has exactly (vertexCount - 1) edges
//                 }
//             }
//         }

//         return minimumSpanningTree;
//     }

//     static void Main() {
//         // Static demonstration data — an undirected weighted graph with 4 vertices.
//         int vertexCount = 4;
//         var edgeList = new List<Edge> {
//             new Edge(0, 1, 10), new Edge(0, 2, 6), new Edge(0, 3, 5),
//             new Edge(1, 3, 15), new Edge(2, 3, 4)
//         };

//         List<Edge> minimumSpanningTree = KruskalMST(vertexCount, edgeList);

//         int totalWeight = 0;
//         Console.WriteLine("Minimum Spanning Tree edges:");
//         foreach (Edge edge in minimumSpanningTree) {
//             Console.WriteLine($"  {edge.VertexA} -- {edge.VertexB} (weight {edge.EdgeWeight})");
//             totalWeight += edge.EdgeWeight;
//         }
//         Console.WriteLine($"Total MST weight: {totalWeight}");
//     }
// }
// `,
//         "swift": `import Foundation

// // Simple structure representing one undirected, weighted edge.
// struct Edge {
//     let vertexA: Int
//     let vertexB: Int
//     let edgeWeight: Int
// }

// var parentOf: [Int] = []
// var rankOf: [Int] = []

// // Initialises the disjoint-set structure so every vertex starts as its
// // own parent (i.e. its own singleton set).
// func initializeDisjointSet(_ vertexCount: Int) {
//     parentOf = Array(0..<vertexCount)
//     rankOf = [Int](repeating: 0, count: vertexCount)
// }

// // Finds the representative ("root") of the set containing 'vertex',
// // applying path compression so future lookups are faster.
// func findSetRoot(_ vertex: Int) -> Int {
//     if parentOf[vertex] != vertex {
//         parentOf[vertex] = findSetRoot(parentOf[vertex])
//     }
//     return parentOf[vertex]
// }

// // Merges the sets containing 'vertexA' and 'vertexB'. Returns false if
// // they were already in the same set (meaning the edge would form a cycle).
// func unionSets(_ vertexA: Int, _ vertexB: Int) -> Bool {
//     var rootA = findSetRoot(vertexA)
//     var rootB = findSetRoot(vertexB)

//     if rootA == rootB {
//         return false // already connected — adding this edge would create a cycle
//     }

//     if rankOf[rootA] < rankOf[rootB] {
//         swap(&rootA, &rootB)
//     }
//     parentOf[rootB] = rootA
//     if rankOf[rootA] == rankOf[rootB] {
//         rankOf[rootA] += 1
//     }

//     return true
// }

// // Computes a Minimum Spanning Tree of the graph described by 'edgeList'
// // using Kruskal's algorithm, and returns the list of edges included.
// func kruskalMST(_ vertexCount: Int, _ edgeList: [Edge]) -> [Edge] {
//     let sortedEdges = edgeList.sorted { $0.edgeWeight < $1.edgeWeight }
//     initializeDisjointSet(vertexCount)

//     var minimumSpanningTree: [Edge] = []
//     for edge in sortedEdges {
//         if unionSets(edge.vertexA, edge.vertexB) {
//             minimumSpanningTree.append(edge)
//             if minimumSpanningTree.count == vertexCount - 1 {
//                 break // a spanning tree on vertexCount vertices has exactly (vertexCount - 1) edges
//             }
//         }
//     }

//     return minimumSpanningTree
// }

// // Static demonstration data — an undirected weighted graph with 4 vertices.
// let vertexCount = 4
// let edgeList = [
//     Edge(vertexA: 0, vertexB: 1, edgeWeight: 10),
//     Edge(vertexA: 0, vertexB: 2, edgeWeight: 6),
//     Edge(vertexA: 0, vertexB: 3, edgeWeight: 5),
//     Edge(vertexA: 1, vertexB: 3, edgeWeight: 15),
//     Edge(vertexA: 2, vertexB: 3, edgeWeight: 4)
// ]

// let minimumSpanningTree = kruskalMST(vertexCount, edgeList)

// var totalWeight = 0
// print("Minimum Spanning Tree edges:")
// for edge in minimumSpanningTree {
//     print("  \\(edge.vertexA) -- \\(edge.vertexB) (weight \\(edge.edgeWeight))")
//     totalWeight += edge.edgeWeight
// }
// print("Total MST weight: \\(totalWeight)")
// `,
//         "kotlin": `// Simple data class representing one undirected, weighted edge.
// data class Edge(val vertexA: Int, val vertexB: Int, val edgeWeight: Int)

// lateinit var parentOf: IntArray
// lateinit var rankOf: IntArray

// // Initialises the disjoint-set structure so every vertex starts as its
// // own parent (i.e. its own singleton set).
// fun initializeDisjointSet(vertexCount: Int) {
//     parentOf = IntArray(vertexCount) { it }
//     rankOf = IntArray(vertexCount)
// }

// // Finds the representative ("root") of the set containing 'vertex',
// // applying path compression so future lookups are faster.
// fun findSetRoot(vertex: Int): Int {
//     if (parentOf[vertex] != vertex) {
//         parentOf[vertex] = findSetRoot(parentOf[vertex])
//     }
//     return parentOf[vertex]
// }

// // Merges the sets containing 'vertexA' and 'vertexB'. Returns false if
// // they were already in the same set (meaning the edge would form a cycle).
// fun unionSets(vertexA: Int, vertexB: Int): Boolean {
//     var rootA = findSetRoot(vertexA)
//     var rootB = findSetRoot(vertexB)

//     if (rootA == rootB) {
//         return false // already connected — adding this edge would create a cycle
//     }

//     if (rankOf[rootA] < rankOf[rootB]) {
//         val temp = rootA; rootA = rootB; rootB = temp
//     }
//     parentOf[rootB] = rootA
//     if (rankOf[rootA] == rankOf[rootB]) {
//         rankOf[rootA]++
//     }

//     return true
// }

// // Computes a Minimum Spanning Tree of the graph described by 'edgeList'
// // using Kruskal's algorithm, and returns the list of edges included.
// fun kruskalMST(vertexCount: Int, edgeList: List<Edge>): List<Edge> {
//     val sortedEdges = edgeList.sortedBy { it.edgeWeight }
//     initializeDisjointSet(vertexCount)

//     val minimumSpanningTree = mutableListOf<Edge>()
//     for (edge in sortedEdges) {
//         if (unionSets(edge.vertexA, edge.vertexB)) {
//             minimumSpanningTree.add(edge)
//             if (minimumSpanningTree.size == vertexCount - 1) {
//                 break // a spanning tree on vertexCount vertices has exactly (vertexCount - 1) edges
//             }
//         }
//     }

//     return minimumSpanningTree
// }

// fun main() {
//     // Static demonstration data — an undirected weighted graph with 4 vertices.
//     val vertexCount = 4
//     val edgeList = listOf(
//         Edge(0, 1, 10), Edge(0, 2, 6), Edge(0, 3, 5), Edge(1, 3, 15), Edge(2, 3, 4)
//     )

//     val minimumSpanningTree = kruskalMST(vertexCount, edgeList)

//     var totalWeight = 0
//     println("Minimum Spanning Tree edges:")
//     for (edge in minimumSpanningTree) {
//         println("  \${edge.vertexA} -- \${edge.vertexB} (weight \${edge.edgeWeight})")
//         totalWeight += edge.edgeWeight
//     }
//     println("Total MST weight: $totalWeight")
// }
// `,
//         "scala": `// Simple case class representing one undirected, weighted edge.
// case class Edge(vertexA: Int, vertexB: Int, edgeWeight: Int)

// object Main extends App {

//   var parentOf: Array[Int] = Array()
//   var rankOf: Array[Int] = Array()

//   // Initialises the disjoint-set structure so every vertex starts as its
//   // own parent (i.e. its own singleton set).
//   def initializeDisjointSet(vertexCount: Int): Unit = {
//     parentOf = Array.tabulate(vertexCount)(identity)
//     rankOf = Array.fill(vertexCount)(0)
//   }

//   // Finds the representative ("root") of the set containing 'vertex',
//   // applying path compression so future lookups are faster.
//   def findSetRoot(vertex: Int): Int = {
//     if (parentOf(vertex) != vertex) {
//       parentOf(vertex) = findSetRoot(parentOf(vertex))
//     }
//     parentOf(vertex)
//   }

//   // Merges the sets containing 'vertexA' and 'vertexB'. Returns false if
//   // they were already in the same set (meaning the edge would form a cycle).
//   def unionSets(vertexA: Int, vertexB: Int): Boolean = {
//     var rootA = findSetRoot(vertexA)
//     var rootB = findSetRoot(vertexB)

//     if (rootA == rootB) {
//       return false // already connected — adding this edge would create a cycle
//     }

//     if (rankOf(rootA) < rankOf(rootB)) {
//       val temp = rootA; rootA = rootB; rootB = temp
//     }
//     parentOf(rootB) = rootA
//     if (rankOf(rootA) == rankOf(rootB)) {
//       rankOf(rootA) += 1
//     }

//     true
//   }

//   // Computes a Minimum Spanning Tree of the graph described by 'edgeList'
//   // using Kruskal's algorithm, and returns the list of edges included.
//   def kruskalMST(vertexCount: Int, edgeList: List[Edge]): List[Edge] = {
//     val sortedEdges = edgeList.sortBy(_.edgeWeight)
//     initializeDisjointSet(vertexCount)

//     val minimumSpanningTree = scala.collection.mutable.ListBuffer[Edge]()
//     for (edge <- sortedEdges) {
//       if (minimumSpanningTree.length < vertexCount - 1 && unionSets(edge.vertexA, edge.vertexB)) {
//         minimumSpanningTree += edge
//       }
//     }

//     minimumSpanningTree.toList
//   }

//   // Static demonstration data — an undirected weighted graph with 4 vertices.
//   val vertexCount = 4
//   val edgeList = List(
//     Edge(0, 1, 10), Edge(0, 2, 6), Edge(0, 3, 5), Edge(1, 3, 15), Edge(2, 3, 4)
//   )

//   val minimumSpanningTree = kruskalMST(vertexCount, edgeList)

//   var totalWeight = 0
//   println("Minimum Spanning Tree edges:")
//   minimumSpanningTree.foreach { edge =>
//     println(s"  \${edge.vertexA} -- \${edge.vertexB} (weight \${edge.edgeWeight})")
//     totalWeight += edge.edgeWeight
//   }
//   println(s"Total MST weight: $totalWeight")
// }
// `,
//         "go": `package main

// import (
// 	"fmt"
// 	"sort"
// )

// // Edge represents one undirected, weighted edge in the graph.
// type Edge struct {
// 	vertexA    int
// 	vertexB    int
// 	edgeWeight int
// }

// var parentOf []int
// var rankOf []int

// // initializeDisjointSet sets up the disjoint-set structure so every
// // vertex starts as its own parent (i.e. its own singleton set).
// func initializeDisjointSet(vertexCount int) {
// 	parentOf = make([]int, vertexCount)
// 	rankOf = make([]int, vertexCount)
// 	for vertex := 0; vertex < vertexCount; vertex++ {
// 		parentOf[vertex] = vertex
// 	}
// }

// // findSetRoot finds the representative ("root") of the set containing
// // vertex, applying path compression so future lookups are faster.
// func findSetRoot(vertex int) int {
// 	if parentOf[vertex] != vertex {
// 		parentOf[vertex] = findSetRoot(parentOf[vertex])
// 	}
// 	return parentOf[vertex]
// }

// // unionSets merges the sets containing vertexA and vertexB. Returns
// // false if they were already in the same set (the edge would form a cycle).
// func unionSets(vertexA int, vertexB int) bool {
// 	rootA := findSetRoot(vertexA)
// 	rootB := findSetRoot(vertexB)

// 	if rootA == rootB {
// 		return false // already connected — adding this edge would create a cycle
// 	}

// 	if rankOf[rootA] < rankOf[rootB] {
// 		rootA, rootB = rootB, rootA
// 	}
// 	parentOf[rootB] = rootA
// 	if rankOf[rootA] == rankOf[rootB] {
// 		rankOf[rootA]++
// 	}

// 	return true
// }

// // kruskalMST computes a Minimum Spanning Tree of the graph described by
// // edgeList using Kruskal's algorithm, and returns the list of edges included.
// func kruskalMST(vertexCount int, edgeList []Edge) []Edge {
// 	sortedEdges := make([]Edge, len(edgeList))
// 	copy(sortedEdges, edgeList)
// 	sort.Slice(sortedEdges, func(i, j int) bool {
// 		return sortedEdges[i].edgeWeight < sortedEdges[j].edgeWeight
// 	})

// 	initializeDisjointSet(vertexCount)

// 	minimumSpanningTree := []Edge{}
// 	for _, edge := range sortedEdges {
// 		if unionSets(edge.vertexA, edge.vertexB) {
// 			minimumSpanningTree = append(minimumSpanningTree, edge)
// 			if len(minimumSpanningTree) == vertexCount-1 {
// 				break // a spanning tree on vertexCount vertices has exactly (vertexCount - 1) edges
// 			}
// 		}
// 	}

// 	return minimumSpanningTree
// }

// func main() {
// 	// Static demonstration data - an undirected weighted graph with 4 vertices.
// 	vertexCount := 4
// 	edgeList := []Edge{
// 		{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4},
// 	}

// 	minimumSpanningTree := kruskalMST(vertexCount, edgeList)

// 	totalWeight := 0
// 	fmt.Println("Minimum Spanning Tree edges:")
// 	for _, edge := range minimumSpanningTree {
// 		fmt.Printf("  %d -- %d (weight %d)\n", edge.vertexA, edge.vertexB, edge.edgeWeight)
// 		totalWeight += edge.edgeWeight
// 	}
// 	fmt.Println("Total MST weight:", totalWeight)
// }
// `,
//         "rust": `// Represents one undirected, weighted edge in the graph.
// #[derive(Clone, Copy)]
// struct Edge {
//     vertex_a: usize,
//     vertex_b: usize,
//     edge_weight: i32,
// }

// // Finds the representative ("root") of the set containing 'vertex',
// // applying path compression so future lookups are faster.
// fn find_set_root(parent_of: &mut Vec<usize>, vertex: usize) -> usize {
//     if parent_of[vertex] != vertex {
//         parent_of[vertex] = find_set_root(parent_of, parent_of[vertex]);
//     }
//     parent_of[vertex]
// }

// // Merges the sets containing 'vertex_a' and 'vertex_b'. Returns false if
// // they were already in the same set (meaning the edge would form a cycle).
// fn union_sets(parent_of: &mut Vec<usize>, rank_of: &mut Vec<usize>, vertex_a: usize, vertex_b: usize) -> bool {
//     let mut root_a = find_set_root(parent_of, vertex_a);
//     let mut root_b = find_set_root(parent_of, vertex_b);

//     if root_a == root_b {
//         return false; // already connected — adding this edge would create a cycle
//     }

//     if rank_of[root_a] < rank_of[root_b] {
//         std::mem::swap(&mut root_a, &mut root_b);
//     }
//     parent_of[root_b] = root_a;
//     if rank_of[root_a] == rank_of[root_b] {
//         rank_of[root_a] += 1;
//     }

//     true
// }

// // Computes a Minimum Spanning Tree of the graph described by 'edge_list'
// // using Kruskal's algorithm, and returns the list of edges included.
// fn kruskal_mst(vertex_count: usize, edge_list: &[Edge]) -> Vec<Edge> {
//     let mut sorted_edges: Vec<Edge> = edge_list.to_vec();
//     sorted_edges.sort_by_key(|edge| edge.edge_weight);

//     let mut parent_of: Vec<usize> = (0..vertex_count).collect();
//     let mut rank_of: Vec<usize> = vec![0; vertex_count];

//     let mut minimum_spanning_tree: Vec<Edge> = Vec::new();
//     for edge in sorted_edges {
//         if union_sets(&mut parent_of, &mut rank_of, edge.vertex_a, edge.vertex_b) {
//             minimum_spanning_tree.push(edge);
//             if minimum_spanning_tree.len() == vertex_count - 1 {
//                 break; // a spanning tree on vertex_count vertices has exactly (vertex_count - 1) edges
//             }
//         }
//     }

//     minimum_spanning_tree
// }

// fn main() {
//     // Static demonstration data - an undirected weighted graph with 4 vertices.
//     let vertex_count = 4;
//     let edge_list = vec![
//         Edge { vertex_a: 0, vertex_b: 1, edge_weight: 10 },
//         Edge { vertex_a: 0, vertex_b: 2, edge_weight: 6 },
//         Edge { vertex_a: 0, vertex_b: 3, edge_weight: 5 },
//         Edge { vertex_a: 1, vertex_b: 3, edge_weight: 15 },
//         Edge { vertex_a: 2, vertex_b: 3, edge_weight: 4 },
//     ];

//     let minimum_spanning_tree = kruskal_mst(vertex_count, &edge_list);

//     let mut total_weight = 0;
//     println!("Minimum Spanning Tree edges:");
//     for edge in &minimum_spanning_tree {
//         println!("  {} -- {} (weight {})", edge.vertex_a, edge.vertex_b, edge.edge_weight);
//         total_weight += edge.edge_weight;
//     }
//     println!("Total MST weight: {}", total_weight);
// }
// `
//       }
//     },
//     /* ════════════════════════════════════════════════════════════════════
//        8. PRIM'S ALGORITHM
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Prim's Algorithm",
//       href: "/algorithms/graphs/prim",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "Prim's Algorithm" },
//         { tag: "p", text: "Prim's Algorithm, developed by Robert Prim in 1957 (and earlier by Vojtěch Jarník in 1930), also finds a Minimum Spanning Tree, but is vertex-centric rather than edge-centric: it grows a single tree outward from an arbitrary starting vertex, at each step adding the cheapest edge that connects the current tree to a vertex not yet in it." },
//         { tag: "p", text: "Structurally, Prim's is very similar to Dijkstra's Algorithm — both use a priority queue to greedily select the 'next best' vertex — but where Dijkstra's tracks cumulative path distance from the source, Prim's tracks the minimum single edge weight connecting a vertex to the growing tree, which is what makes it build a minimum spanning tree rather than a shortest-path tree." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "The graph is dense (E close to V²) — Prim's with a Fibonacci heap achieves O(E + V log V), beating Kruskal's E log E on dense graphs",
//           "You have efficient adjacency-list/neighbor access but not necessarily a sorted global edge list",
//           "Network design problems identical to Kruskal's use case (minimum cabling/connection cost) — the choice between the two is mostly about graph density and implementation convenience",
//           "Real-time/incremental MST construction where you're growing the tree from a fixed starting point"
//         ]},
//         { tag: "note", variant: "info", text: "Both Prim's and Kruskal's always produce a valid MST (the minimum total weight is unique even when the specific tree structure isn't), so the choice between them is purely about performance characteristics for the given graph density." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O((V + E) log V)",
//         best: [
//           { tag: "h2", text: "Best Case — O((V + E) log V)" },
//           { tag: "p", text: "Using a binary heap, every vertex extraction and edge relaxation costs O(log V), and the algorithm always processes every vertex and edge at least once to build the spanning tree — there's no early exit regardless of edge weight favourability." },
//           { tag: "ul", items: [
//             "V extract-min operations: O(V log V)",
//             "Up to E decrease-key/insert operations: O(E log V)",
//             "Total: O((V + E) log V), the standard binary-heap bound, identical to Dijkstra's structure"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O((V + E) log V)" },
//           { tag: "p", text: "The priority-queue-driven structure performs the same fixed sequence of operations (extract minimum, examine neighbors, possibly update priority) regardless of the specific edge weight values, only their relative order affects extraction sequence, not operation count." },
//           { tag: "ul", items: [
//             "V extractions × O(log V) + E potential updates × O(log V) = O((V + E) log V)",
//             "No input distribution changes this structural bound for the standard binary-heap implementation"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O((V + E) log V)" },
//           { tag: "p", text: "No graph structure increases the cost beyond the standard binary-heap bound — for a dense graph this becomes O(V² log V) with a binary heap, which is exactly why a Fibonacci heap implementation is preferred for dense graphs." },
//           { tag: "ul", items: [
//             "Binary heap: O((V + E) log V) worst case",
//             "Fibonacci heap: O(E + V log V) worst case — significantly better for dense graphs since decrease-key becomes O(1) amortised",
//             "Adjacency-matrix-based O(V²) implementation (no heap at all): competitive specifically for very dense graphs where E approaches V²"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(V)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(V)" },
//           { tag: "p", text: "Prim's maintains a key/weight array (cheapest edge weight connecting each vertex to the tree), an in-tree boolean array, and a priority queue, all sized to V." },
//           { tag: "ul", items: ["minEdgeWeight[] (min edge weight to tree): O(V)", "isInTree[] boolean array: O(V)", "priority queue: up to O(V) entries"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(V)" },
//           { tag: "p", text: "Space usage is fixed by vertex count, since the tracking arrays must accommodate every vertex regardless of how densely connected the graph is." },
//           { tag: "ul", items: ["minEdgeWeight[], isInTree[]: O(V) each, independent of E"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(V + E)" },
//           { tag: "p", text: "Lazy-deletion priority queue implementations (pushing a new entry on every key update rather than updating in place) can grow the queue to O(E) stale entries in the worst case." },
//           { tag: "ul", items: [
//             "minEdgeWeight[], isInTree[]: O(V)",
//             "Lazy-deletion priority queue: up to O(E) entries in the worst case",
//             "Decrease-key-based implementations keep this strictly at O(V)"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function primMST(graph, startVertex):
//     minEdgeWeight ← map of vertex → infinity, for all vertices
//     isInTree      ← map of vertex → false, for all vertices
//     minEdgeWeight[startVertex] ← 0
//     priorityQueue ← min-priority-queue, ordered by minEdgeWeight
//     priorityQueue.insert(startVertex, 0)
//     totalMSTWeight ← 0

//     while priorityQueue is not empty:
//         (currentVertex, currentWeight) ← priorityQueue.extractMin()
//         if isInTree[currentVertex]:
//             continue                    // stale entry, skip
//         isInTree[currentVertex] ← true
//         totalMSTWeight ← totalMSTWeight + currentWeight

//         for (neighborVertex, edgeWeight) in graph.adjacent(currentVertex):
//             if not isInTree[neighborVertex] and edgeWeight < minEdgeWeight[neighborVertex]:
//                 minEdgeWeight[neighborVertex] ← edgeWeight
//                 priorityQueue.insert(neighborVertex, edgeWeight)     // or decreaseKey

//     return totalMSTWeight` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Start with an arbitrary vertex; its minEdgeWeight (cheapest known edge to the growing tree) is set to 0 since it needs no edge to join itself.",
//           "Use a priority queue to always extract the not-yet-included vertex with the smallest minEdgeWeight — the cheapest way to connect a new vertex to the existing tree.",
//           "Once extracted, mark the vertex as part of the tree and add its minEdgeWeight value to the running total MST weight.",
//           "For each neighbor not yet in the tree, check if the direct edge to it is cheaper than the neighbor's currently known minEdgeWeight — if so, this edge is now the best known way to attach that neighbor to the tree.",
//           "Update the neighbor's minEdgeWeight and push the new value onto the priority queue.",
//           "Repeat until every vertex has been added to the tree."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "This also follows from the Cut Property: at every step, the current tree and the remaining unvisited vertices form a cut of the graph. The algorithm always selects the minimum-weight edge crossing that cut (the smallest minEdgeWeight among not-yet-included vertices), which the Cut Property guarantees is safe to add to some MST. Since this greedy choice is repeated for every vertex addition and is always provably safe, the final tree — having connected all V vertices with exactly V − 1 such safe edges — is guaranteed to be a true minimum spanning tree." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <queue>
// #include <climits>
// using namespace std;

// // Computes the total weight of a Minimum Spanning Tree of the graph
// // described by 'adjacencyList' using Prim's algorithm, starting from
// // 'startVertex'. Each adjacency entry is a (neighborVertex, edgeWeight) pair.
// int primMST(const vector<vector<pair<int, int>>>& adjacencyList, int vertexCount, int startVertex = 0) {
//     vector<int> minEdgeWeight(vertexCount, INT_MAX);
//     vector<bool> isInTree(vertexCount, false);

//     // Min-priority-queue of (edgeWeight, vertex) pairs, ordered by edgeWeight.
//     priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> priorityQueue;

//     minEdgeWeight[startVertex] = 0;
//     priorityQueue.push({0, startVertex});

//     int totalMSTWeight = 0;

//     while (!priorityQueue.empty()) {
//         int currentWeight = priorityQueue.top().first;
//         int currentVertex = priorityQueue.top().second;
//         priorityQueue.pop();

//         if (isInTree[currentVertex]) {
//             continue; // stale entry — this vertex was already added via a cheaper edge
//         }
//         isInTree[currentVertex] = true;
//         totalMSTWeight += currentWeight;

//         for (const pair<int, int>& neighbor : adjacencyList[currentVertex]) {
//             int neighborVertex = neighbor.first;
//             int edgeWeight = neighbor.second;

//             if (!isInTree[neighborVertex] && edgeWeight < minEdgeWeight[neighborVertex]) {
//                 minEdgeWeight[neighborVertex] = edgeWeight;
//                 priorityQueue.push({edgeWeight, neighborVertex});
//             }
//         }
//     }

//     return totalMSTWeight;
// }

// int main() {
//     // Static demonstration data — an undirected weighted graph with 5 vertices.
//     int vertexCount = 5;
//     vector<vector<pair<int, int>>> adjacencyList(vertexCount);

//     auto addUndirectedEdge = [&](int vertexA, int vertexB, int edgeWeight) {
//         adjacencyList[vertexA].push_back({vertexB, edgeWeight});
//         adjacencyList[vertexB].push_back({vertexA, edgeWeight});
//     };

//     addUndirectedEdge(0, 1, 2);
//     addUndirectedEdge(0, 3, 6);
//     addUndirectedEdge(1, 2, 3);
//     addUndirectedEdge(1, 3, 8);
//     addUndirectedEdge(1, 4, 5);
//     addUndirectedEdge(2, 4, 7);
//     addUndirectedEdge(3, 4, 9);

//     int totalMSTWeight = primMST(adjacencyList, vertexCount);

//     cout << "Minimum Spanning Tree total weight: " << totalMSTWeight << endl;

//     return 0;
// }
// `,
//         "python": `import heapq


// def prim_mst(adjacency_list, vertex_count, start_vertex=0):
//     """
//     Computes the total weight of a Minimum Spanning Tree of the graph
//     described by 'adjacency_list' using Prim's algorithm, starting from
//     'start_vertex'. Each adjacency entry is a (neighbor_vertex, edge_weight) tuple.
//     """
//     min_edge_weight = [float('inf')] * vertex_count
//     is_in_tree = [False] * vertex_count

//     # Min-priority-queue of (edge_weight, vertex) tuples, ordered by edge_weight.
//     priority_queue = [(0, start_vertex)]
//     min_edge_weight[start_vertex] = 0

//     total_mst_weight = 0

//     while priority_queue:
//         current_weight, current_vertex = heapq.heappop(priority_queue)

//         if is_in_tree[current_vertex]:
//             continue  # stale entry - this vertex was already added via a cheaper edge

//         is_in_tree[current_vertex] = True
//         total_mst_weight += current_weight

//         for neighbor_vertex, edge_weight in adjacency_list[current_vertex]:
//             if not is_in_tree[neighbor_vertex] and edge_weight < min_edge_weight[neighbor_vertex]:
//                 min_edge_weight[neighbor_vertex] = edge_weight
//                 heapq.heappush(priority_queue, (edge_weight, neighbor_vertex))

//     return total_mst_weight


// def main():
//     # Static demonstration data - an undirected weighted graph with 5 vertices.
//     vertex_count = 5
//     adjacency_list = [[] for _ in range(vertex_count)]

//     def add_undirected_edge(vertex_a, vertex_b, edge_weight):
//         adjacency_list[vertex_a].append((vertex_b, edge_weight))
//         adjacency_list[vertex_b].append((vertex_a, edge_weight))

//     add_undirected_edge(0, 1, 2)
//     add_undirected_edge(0, 3, 6)
//     add_undirected_edge(1, 2, 3)
//     add_undirected_edge(1, 3, 8)
//     add_undirected_edge(1, 4, 5)
//     add_undirected_edge(2, 4, 7)
//     add_undirected_edge(3, 4, 9)

//     total_mst_weight = prim_mst(adjacency_list, vertex_count)

//     print(f"Minimum Spanning Tree total weight: {total_mst_weight}")


// if __name__ == "__main__":
//     main()
// `,
//         "java": `import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.List;
// import java.util.PriorityQueue;

// public class Main {

//     // Computes the total weight of a Minimum Spanning Tree of the graph
//     // described by 'adjacencyList' using Prim's algorithm, starting from
//     // 'startVertex'. Each adjacency entry is {neighborVertex, edgeWeight}.
//     static int primMST(List<List<int[]>> adjacencyList, int vertexCount, int startVertex) {
//         int[] minEdgeWeight = new int[vertexCount];
//         Arrays.fill(minEdgeWeight, Integer.MAX_VALUE);
//         boolean[] isInTree = new boolean[vertexCount];

//         // Min-priority-queue of {edgeWeight, vertex} pairs, ordered by edgeWeight.
//         PriorityQueue<int[]> priorityQueue = new PriorityQueue<>((first, second) -> first[0] - second[0]);

//         minEdgeWeight[startVertex] = 0;
//         priorityQueue.offer(new int[]{0, startVertex});

//         int totalMSTWeight = 0;

//         while (!priorityQueue.isEmpty()) {
//             int[] entry = priorityQueue.poll();
//             int currentWeight = entry[0];
//             int currentVertex = entry[1];

//             if (isInTree[currentVertex]) {
//                 continue; // stale entry — this vertex was already added via a cheaper edge
//             }
//             isInTree[currentVertex] = true;
//             totalMSTWeight += currentWeight;

//             for (int[] neighbor : adjacencyList.get(currentVertex)) {
//                 int neighborVertex = neighbor[0];
//                 int edgeWeight = neighbor[1];

//                 if (!isInTree[neighborVertex] && edgeWeight < minEdgeWeight[neighborVertex]) {
//                     minEdgeWeight[neighborVertex] = edgeWeight;
//                     priorityQueue.offer(new int[]{edgeWeight, neighborVertex});
//                 }
//             }
//         }

//         return totalMSTWeight;
//     }

//     public static void main(String[] args) {
//         // Static demonstration data — an undirected weighted graph with 5 vertices.
//         int vertexCount = 5;
//         List<List<int[]>> adjacencyList = new ArrayList<>();
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             adjacencyList.add(new ArrayList<>());
//         }

//         int[][] undirectedEdges = {{0, 1, 2}, {0, 3, 6}, {1, 2, 3}, {1, 3, 8}, {1, 4, 5}, {2, 4, 7}, {3, 4, 9}};
//         for (int[] edge : undirectedEdges) {
//             adjacencyList.get(edge[0]).add(new int[]{edge[1], edge[2]});
//             adjacencyList.get(edge[1]).add(new int[]{edge[0], edge[2]});
//         }

//         int totalMSTWeight = primMST(adjacencyList, vertexCount, 0);

//         System.out.println("Minimum Spanning Tree total weight: " + totalMSTWeight);
//     }
// }
// `,
//         "js": `// Computes the total weight of a Minimum Spanning Tree of the graph
// // described by 'adjacencyList' using Prim's algorithm, starting from
// // 'startVertex'. Each adjacency entry is [neighborVertex, edgeWeight].
// // Uses a simple binary min-heap keyed on edge weight.
// function primMST(adjacencyList, vertexCount, startVertex = 0) {
//     const minEdgeWeight = new Array(vertexCount).fill(Infinity);
//     const isInTree = new Array(vertexCount).fill(false);

//     // heap entries are [edgeWeight, vertex] pairs, ordered by edgeWeight.
//     const heap = [];

//     const siftUp = () => {
//         let i = heap.length - 1;
//         while (i > 0) {
//             const parent = (i - 1) >> 1;
//             if (heap[parent][0] <= heap[i][0]) break;
//             [heap[parent], heap[i]] = [heap[i], heap[parent]];
//             i = parent;
//         }
//     };

//     const siftDown = () => {
//         let i = 0;
//         const n = heap.length;
//         while (true) {
//             let smallest = i;
//             const left = 2 * i + 1;
//             const right = 2 * i + 2;
//             if (left < n && heap[left][0] < heap[smallest][0]) smallest = left;
//             if (right < n && heap[right][0] < heap[smallest][0]) smallest = right;
//             if (smallest === i) break;
//             [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
//             i = smallest;
//         }
//     };

//     const pushEntry = (entry) => {
//         heap.push(entry);
//         siftUp();
//     };

//     const popEntry = () => {
//         const top = heap[0];
//         const last = heap.pop();
//         if (heap.length > 0) {
//             heap[0] = last;
//             siftDown();
//         }
//         return top;
//     };

//     minEdgeWeight[startVertex] = 0;
//     pushEntry([0, startVertex]);

//     let totalMSTWeight = 0;

//     while (heap.length > 0) {
//         const [currentWeight, currentVertex] = popEntry();

//         if (isInTree[currentVertex]) {
//             continue; // stale entry — this vertex was already added via a cheaper edge
//         }
//         isInTree[currentVertex] = true;
//         totalMSTWeight += currentWeight;

//         for (const [neighborVertex, edgeWeight] of adjacencyList[currentVertex]) {
//             if (!isInTree[neighborVertex] && edgeWeight < minEdgeWeight[neighborVertex]) {
//                 minEdgeWeight[neighborVertex] = edgeWeight;
//                 pushEntry([edgeWeight, neighborVertex]);
//             }
//         }
//     }

//     return totalMSTWeight;
// }

// function main() {
//     // Static demonstration data — an undirected weighted graph with 5 vertices.
//     const vertexCount = 5;
//     const adjacencyList = Array.from({ length: vertexCount }, () => []);

//     const addUndirectedEdge = (vertexA, vertexB, edgeWeight) => {
//         adjacencyList[vertexA].push([vertexB, edgeWeight]);
//         adjacencyList[vertexB].push([vertexA, edgeWeight]);
//     };

//     addUndirectedEdge(0, 1, 2);
//     addUndirectedEdge(0, 3, 6);
//     addUndirectedEdge(1, 2, 3);
//     addUndirectedEdge(1, 3, 8);
//     addUndirectedEdge(1, 4, 5);
//     addUndirectedEdge(2, 4, 7);
//     addUndirectedEdge(3, 4, 9);

//     const totalMSTWeight = primMST(adjacencyList, vertexCount);

//     console.log("Minimum Spanning Tree total weight:", totalMSTWeight);
// }

// main();
// `,
//         "c": `#include <stdio.h>
// #include <limits.h>
// #include <string.h>

// #define MAX_VERTICES 100

// int adjacencyMatrix[MAX_VERTICES][MAX_VERTICES];

// // Computes the total weight of a Minimum Spanning Tree of the graph
// // described by the global 'adjacencyMatrix' using Prim's algorithm
// // (the simple O(V^2) array-scanning variant, well suited to small graphs).
// // A matrix entry of 0 (other than the diagonal) means "no direct edge".
// int primMST(int vertexCount, int startVertex) {
//     int minEdgeWeight[MAX_VERTICES];
//     int isInTree[MAX_VERTICES];

//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         minEdgeWeight[vertex] = INT_MAX;
//         isInTree[vertex] = 0;
//     }
//     minEdgeWeight[startVertex] = 0;

//     int totalMSTWeight = 0;

//     for (int iteration = 0; iteration < vertexCount; iteration++) {
//         /* Find the not-yet-included vertex with the smallest minEdgeWeight. */
//         int currentVertex = -1;
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             if (!isInTree[vertex] && (currentVertex == -1 || minEdgeWeight[vertex] < minEdgeWeight[currentVertex])) {
//                 currentVertex = vertex;
//             }
//         }

//         isInTree[currentVertex] = 1;
//         totalMSTWeight += minEdgeWeight[currentVertex];

//         /* Relax every neighbor of currentVertex. */
//         for (int neighborVertex = 0; neighborVertex < vertexCount; neighborVertex++) {
//             int edgeWeight = adjacencyMatrix[currentVertex][neighborVertex];
//             if (edgeWeight != 0 && !isInTree[neighborVertex] && edgeWeight < minEdgeWeight[neighborVertex]) {
//                 minEdgeWeight[neighborVertex] = edgeWeight;
//             }
//         }
//     }

//     return totalMSTWeight;
// }

// int main() {
//     /* Static demonstration data - an undirected weighted graph with 5 vertices,
//        represented as an adjacency matrix (0 means no direct edge). */
//     int vertexCount = 5;
//     memset(adjacencyMatrix, 0, sizeof(adjacencyMatrix));

//     int undirectedEdges[][3] = {
//         {0, 1, 2}, {0, 3, 6}, {1, 2, 3}, {1, 3, 8}, {1, 4, 5}, {2, 4, 7}, {3, 4, 9}
//     };
//     int edgeCount = 7;
//     for (int i = 0; i < edgeCount; i++) {
//         int vertexA = undirectedEdges[i][0];
//         int vertexB = undirectedEdges[i][1];
//         int edgeWeight = undirectedEdges[i][2];
//         adjacencyMatrix[vertexA][vertexB] = edgeWeight;
//         adjacencyMatrix[vertexB][vertexA] = edgeWeight;
//     }

//     int totalMSTWeight = primMST(vertexCount, 0);

//     printf("Minimum Spanning Tree total weight: %d\\n", totalMSTWeight);

//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;

// class Program {

//     // Computes the total weight of a Minimum Spanning Tree of the graph
//     // described by 'adjacencyList' using Prim's algorithm, starting from
//     // 'startVertex'. Each adjacency entry is (neighborVertex, edgeWeight).
//     static int PrimMST(List<(int neighborVertex, int edgeWeight)>[] adjacencyList, int vertexCount, int startVertex) {
//         int[] minEdgeWeight = new int[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             minEdgeWeight[vertex] = int.MaxValue;
//         }
//         bool[] isInTree = new bool[vertexCount];

//         var priorityQueue = new SortedSet<(int edgeWeight, int vertex)>();

//         minEdgeWeight[startVertex] = 0;
//         priorityQueue.Add((0, startVertex));

//         int totalMSTWeight = 0;

//         while (priorityQueue.Count > 0) {
//             var currentEntry = priorityQueue.Min;
//             priorityQueue.Remove(currentEntry);

//             int currentWeight = currentEntry.edgeWeight;
//             int currentVertex = currentEntry.vertex;

//             if (isInTree[currentVertex]) {
//                 continue; // stale entry — this vertex was already added via a cheaper edge
//             }
//             isInTree[currentVertex] = true;
//             totalMSTWeight += currentWeight;

//             foreach (var (neighborVertex, edgeWeight) in adjacencyList[currentVertex]) {
//                 if (!isInTree[neighborVertex] && edgeWeight < minEdgeWeight[neighborVertex]) {
//                     priorityQueue.Remove((minEdgeWeight[neighborVertex], neighborVertex));
//                     minEdgeWeight[neighborVertex] = edgeWeight;
//                     priorityQueue.Add((edgeWeight, neighborVertex));
//                 }
//             }
//         }

//         return totalMSTWeight;
//     }

//     static void Main() {
//         // Static demonstration data — an undirected weighted graph with 5 vertices.
//         int vertexCount = 5;
//         var adjacencyList = new List<(int, int)>[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             adjacencyList[vertex] = new List<(int, int)>();
//         }

//         void AddUndirectedEdge(int vertexA, int vertexB, int edgeWeight) {
//             adjacencyList[vertexA].Add((vertexB, edgeWeight));
//             adjacencyList[vertexB].Add((vertexA, edgeWeight));
//         }

//         AddUndirectedEdge(0, 1, 2);
//         AddUndirectedEdge(0, 3, 6);
//         AddUndirectedEdge(1, 2, 3);
//         AddUndirectedEdge(1, 3, 8);
//         AddUndirectedEdge(1, 4, 5);
//         AddUndirectedEdge(2, 4, 7);
//         AddUndirectedEdge(3, 4, 9);

//         int totalMSTWeight = PrimMST(adjacencyList, vertexCount, 0);

//         Console.WriteLine($"Minimum Spanning Tree total weight: {totalMSTWeight}");
//     }
// }
// `,
//         "swift": `import Foundation

// // Computes the total weight of a Minimum Spanning Tree of the graph
// // described by 'adjacencyList' using Prim's algorithm, starting from
// // 'startVertex'. Each adjacency entry is (neighborVertex, edgeWeight).
// // Uses a simple linear-scan priority queue, well suited to small graphs.
// func primMST(_ adjacencyList: [[(Int, Int)]], _ vertexCount: Int, _ startVertex: Int = 0) -> Int {
//     var minEdgeWeight = [Int](repeating: Int.max, count: vertexCount)
//     var isInTree = [Bool](repeating: false, count: vertexCount)

//     var candidateQueue: [(edgeWeight: Int, vertex: Int)] = [(0, startVertex)]
//     minEdgeWeight[startVertex] = 0

//     var totalMSTWeight = 0

//     while !candidateQueue.isEmpty {
//         // Find and remove the entry with the smallest edge weight (linear scan).
//         var bestIndex = 0
//         for index in 1..<candidateQueue.count {
//             if candidateQueue[index].edgeWeight < candidateQueue[bestIndex].edgeWeight {
//                 bestIndex = index
//             }
//         }
//         let (currentWeight, currentVertex) = candidateQueue.remove(at: bestIndex)

//         if isInTree[currentVertex] {
//             continue // stale entry — this vertex was already added via a cheaper edge
//         }
//         isInTree[currentVertex] = true
//         totalMSTWeight += currentWeight

//         for (neighborVertex, edgeWeight) in adjacencyList[currentVertex] {
//             if !isInTree[neighborVertex] && edgeWeight < minEdgeWeight[neighborVertex] {
//                 minEdgeWeight[neighborVertex] = edgeWeight
//                 candidateQueue.append((edgeWeight, neighborVertex))
//             }
//         }
//     }

//     return totalMSTWeight
// }

// // Static demonstration data — an undirected weighted graph with 5 vertices.
// let vertexCount = 5
// var adjacencyList = [[(Int, Int)]](repeating: [], count: vertexCount)

// func addUndirectedEdge(_ vertexA: Int, _ vertexB: Int, _ edgeWeight: Int) {
//     adjacencyList[vertexA].append((vertexB, edgeWeight))
//     adjacencyList[vertexB].append((vertexA, edgeWeight))
// }

// addUndirectedEdge(0, 1, 2)
// addUndirectedEdge(0, 3, 6)
// addUndirectedEdge(1, 2, 3)
// addUndirectedEdge(1, 3, 8)
// addUndirectedEdge(1, 4, 5)
// addUndirectedEdge(2, 4, 7)
// addUndirectedEdge(3, 4, 9)

// let totalMSTWeight = primMST(adjacencyList, vertexCount)
// print("Minimum Spanning Tree total weight: \\(totalMSTWeight)")
// `,
//         "kotlin": `import java.util.PriorityQueue

// // Computes the total weight of a Minimum Spanning Tree of the graph
// // described by 'adjacencyList' using Prim's algorithm, starting from
// // 'startVertex'. Each adjacency entry is a Pair(neighborVertex, edgeWeight).
// fun primMST(adjacencyList: Array<MutableList<Pair<Int, Int>>>, vertexCount: Int, startVertex: Int = 0): Int {
//     val minEdgeWeight = IntArray(vertexCount) { Int.MAX_VALUE }
//     val isInTree = BooleanArray(vertexCount)

//     // Priority queue of Pair(edgeWeight, vertex), ordered by edgeWeight.
//     val priorityQueue = PriorityQueue<Pair<Int, Int>>(compareBy { it.first })

//     minEdgeWeight[startVertex] = 0
//     priorityQueue.add(0 to startVertex)

//     var totalMSTWeight = 0

//     while (priorityQueue.isNotEmpty()) {
//         val (currentWeight, currentVertex) = priorityQueue.poll()

//         if (isInTree[currentVertex]) {
//             continue // stale entry — this vertex was already added via a cheaper edge
//         }
//         isInTree[currentVertex] = true
//         totalMSTWeight += currentWeight

//         for ((neighborVertex, edgeWeight) in adjacencyList[currentVertex]) {
//             if (!isInTree[neighborVertex] && edgeWeight < minEdgeWeight[neighborVertex]) {
//                 minEdgeWeight[neighborVertex] = edgeWeight
//                 priorityQueue.add(edgeWeight to neighborVertex)
//             }
//         }
//     }

//     return totalMSTWeight
// }

// fun main() {
//     // Static demonstration data — an undirected weighted graph with 5 vertices.
//     val vertexCount = 5
//     val adjacencyList = Array(vertexCount) { mutableListOf<Pair<Int, Int>>() }

//     fun addUndirectedEdge(vertexA: Int, vertexB: Int, edgeWeight: Int) {
//         adjacencyList[vertexA].add(vertexB to edgeWeight)
//         adjacencyList[vertexB].add(vertexA to edgeWeight)
//     }

//     addUndirectedEdge(0, 1, 2)
//     addUndirectedEdge(0, 3, 6)
//     addUndirectedEdge(1, 2, 3)
//     addUndirectedEdge(1, 3, 8)
//     addUndirectedEdge(1, 4, 5)
//     addUndirectedEdge(2, 4, 7)
//     addUndirectedEdge(3, 4, 9)

//     val totalMSTWeight = primMST(adjacencyList, vertexCount)

//     println("Minimum Spanning Tree total weight: $totalMSTWeight")
// }
// `,
//         "scala": `import scala.collection.mutable

// object Main extends App {

//   // Computes the total weight of a Minimum Spanning Tree of the graph
//   // described by 'adjacencyList' using Prim's algorithm, starting from
//   // 'startVertex'. Each adjacency entry is (neighborVertex, edgeWeight).
//   def primMST(adjacencyList: Array[mutable.ListBuffer[(Int, Int)]], vertexCount: Int, startVertex: Int = 0): Int = {
//     val minEdgeWeight = Array.fill(vertexCount)(Int.MaxValue)
//     val isInTree = Array.fill(vertexCount)(false)

//     val ordering = Ordering.by[(Int, Int), Int](_._1).reverse // min on top
//     val priorityQueue = mutable.PriorityQueue[(Int, Int)]()(ordering)

//     minEdgeWeight(startVertex) = 0
//     priorityQueue.enqueue((0, startVertex))

//     var totalMSTWeight = 0

//     while (priorityQueue.nonEmpty) {
//       val (currentWeight, currentVertex) = priorityQueue.dequeue()

//       if (!isInTree(currentVertex)) {
//         isInTree(currentVertex) = true
//         totalMSTWeight += currentWeight

//         for ((neighborVertex, edgeWeight) <- adjacencyList(currentVertex)) {
//           if (!isInTree(neighborVertex) && edgeWeight < minEdgeWeight(neighborVertex)) {
//             minEdgeWeight(neighborVertex) = edgeWeight
//             priorityQueue.enqueue((edgeWeight, neighborVertex))
//           }
//         }
//       }
//     }

//     totalMSTWeight
//   }

//   // Static demonstration data — an undirected weighted graph with 5 vertices.
//   val vertexCount = 5
//   val adjacencyList: Array[mutable.ListBuffer[(Int, Int)]] = Array.fill(vertexCount)(mutable.ListBuffer[(Int, Int)]())

//   def addUndirectedEdge(vertexA: Int, vertexB: Int, edgeWeight: Int): Unit = {
//     adjacencyList(vertexA) += ((vertexB, edgeWeight))
//     adjacencyList(vertexB) += ((vertexA, edgeWeight))
//   }

//   addUndirectedEdge(0, 1, 2)
//   addUndirectedEdge(0, 3, 6)
//   addUndirectedEdge(1, 2, 3)
//   addUndirectedEdge(1, 3, 8)
//   addUndirectedEdge(1, 4, 5)
//   addUndirectedEdge(2, 4, 7)
//   addUndirectedEdge(3, 4, 9)

//   val totalMSTWeight = primMST(adjacencyList, vertexCount)
//   println(s"Minimum Spanning Tree total weight: $totalMSTWeight")
// }
// `,
//         "go": `package main

// import (
// 	"container/heap"
// 	"fmt"
// 	"math"
// )

// // heapEntry represents one candidate (vertex, edgeWeight) pair tracked
// // by the min-priority-queue during Prim's algorithm.
// type heapEntry struct {
// 	edgeWeight int
// 	vertex     int
// }

// type entryHeap []heapEntry

// func (h entryHeap) Len() int            { return len(h) }
// func (h entryHeap) Less(i, j int) bool  { return h[i].edgeWeight < h[j].edgeWeight }
// func (h entryHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
// func (h *entryHeap) Push(x interface{}) { *h = append(*h, x.(heapEntry)) }
// func (h *entryHeap) Pop() interface{} {
// 	old := *h
// 	n := len(old)
// 	x := old[n-1]
// 	*h = old[:n-1]
// 	return x
// }

// // neighborEdge represents one outgoing edge in the adjacency list.
// type neighborEdge struct {
// 	neighborVertex int
// 	edgeWeight     int
// }

// // primMST computes the total weight of a Minimum Spanning Tree of the
// // graph described by adjacencyList using Prim's algorithm, starting
// // from startVertex.
// func primMST(adjacencyList [][]neighborEdge, vertexCount int, startVertex int) int {
// 	minEdgeWeight := make([]int, vertexCount)
// 	for vertex := range minEdgeWeight {
// 		minEdgeWeight[vertex] = math.MaxInt32
// 	}
// 	isInTree := make([]bool, vertexCount)

// 	priorityQueue := &entryHeap{}
// 	heap.Init(priorityQueue)

// 	minEdgeWeight[startVertex] = 0
// 	heap.Push(priorityQueue, heapEntry{0, startVertex})

// 	totalMSTWeight := 0

// 	for priorityQueue.Len() > 0 {
// 		current := heap.Pop(priorityQueue).(heapEntry)
// 		currentWeight := current.edgeWeight
// 		currentVertex := current.vertex

// 		if isInTree[currentVertex] {
// 			continue // stale entry — this vertex was already added via a cheaper edge
// 		}
// 		isInTree[currentVertex] = true
// 		totalMSTWeight += currentWeight

// 		for _, neighbor := range adjacencyList[currentVertex] {
// 			if !isInTree[neighbor.neighborVertex] && neighbor.edgeWeight < minEdgeWeight[neighbor.neighborVertex] {
// 				minEdgeWeight[neighbor.neighborVertex] = neighbor.edgeWeight
// 				heap.Push(priorityQueue, heapEntry{neighbor.edgeWeight, neighbor.neighborVertex})
// 			}
// 		}
// 	}

// 	return totalMSTWeight
// }

// func main() {
// 	// Static demonstration data - an undirected weighted graph with 5 vertices.
// 	vertexCount := 5
// 	adjacencyList := make([][]neighborEdge, vertexCount)

// 	addUndirectedEdge := func(vertexA int, vertexB int, edgeWeight int) {
// 		adjacencyList[vertexA] = append(adjacencyList[vertexA], neighborEdge{vertexB, edgeWeight})
// 		adjacencyList[vertexB] = append(adjacencyList[vertexB], neighborEdge{vertexA, edgeWeight})
// 	}

// 	addUndirectedEdge(0, 1, 2)
// 	addUndirectedEdge(0, 3, 6)
// 	addUndirectedEdge(1, 2, 3)
// 	addUndirectedEdge(1, 3, 8)
// 	addUndirectedEdge(1, 4, 5)
// 	addUndirectedEdge(2, 4, 7)
// 	addUndirectedEdge(3, 4, 9)

// 	totalMSTWeight := primMST(adjacencyList, vertexCount, 0)

// 	fmt.Println("Minimum Spanning Tree total weight:", totalMSTWeight)
// }
// `,
//         "rust": `use std::cmp::Reverse;
// use std::collections::BinaryHeap;

// // Computes the total weight of a Minimum Spanning Tree of the graph
// // described by 'adjacency_list' using Prim's algorithm, starting from
// // 'start_vertex'. Each adjacency entry is (neighbor_vertex, edge_weight).
// fn prim_mst(adjacency_list: &Vec<Vec<(usize, i32)>>, vertex_count: usize, start_vertex: usize) -> i32 {
//     let mut min_edge_weight: Vec<i32> = vec![i32::MAX; vertex_count];
//     let mut is_in_tree: Vec<bool> = vec![false; vertex_count];

//     // Min-priority-queue of (edge_weight, vertex) pairs, via Reverse to
//     // turn Rust's max-heap BinaryHeap into a min-heap.
//     let mut priority_queue: BinaryHeap<Reverse<(i32, usize)>> = BinaryHeap::new();

//     min_edge_weight[start_vertex] = 0;
//     priority_queue.push(Reverse((0, start_vertex)));

//     let mut total_mst_weight = 0;

//     while let Some(Reverse((current_weight, current_vertex))) = priority_queue.pop() {
//         if is_in_tree[current_vertex] {
//             continue; // stale entry — this vertex was already added via a cheaper edge
//         }
//         is_in_tree[current_vertex] = true;
//         total_mst_weight += current_weight;

//         for &(neighbor_vertex, edge_weight) in &adjacency_list[current_vertex] {
//             if !is_in_tree[neighbor_vertex] && edge_weight < min_edge_weight[neighbor_vertex] {
//                 min_edge_weight[neighbor_vertex] = edge_weight;
//                 priority_queue.push(Reverse((edge_weight, neighbor_vertex)));
//             }
//         }
//     }

//     total_mst_weight
// }

// fn main() {
//     // Static demonstration data - an undirected weighted graph with 5 vertices.
//     let vertex_count = 5;
//     let mut adjacency_list: Vec<Vec<(usize, i32)>> = vec![Vec::new(); vertex_count];

//     let mut add_undirected_edge = |vertex_a: usize, vertex_b: usize, edge_weight: i32, list: &mut Vec<Vec<(usize, i32)>>| {
//         list[vertex_a].push((vertex_b, edge_weight));
//         list[vertex_b].push((vertex_a, edge_weight));
//     };

//     add_undirected_edge(0, 1, 2, &mut adjacency_list);
//     add_undirected_edge(0, 3, 6, &mut adjacency_list);
//     add_undirected_edge(1, 2, 3, &mut adjacency_list);
//     add_undirected_edge(1, 3, 8, &mut adjacency_list);
//     add_undirected_edge(1, 4, 5, &mut adjacency_list);
//     add_undirected_edge(2, 4, 7, &mut adjacency_list);
//     add_undirected_edge(3, 4, 9, &mut adjacency_list);

//     let total_mst_weight = prim_mst(&adjacency_list, vertex_count, 0);

//     println!("Minimum Spanning Tree total weight: {}", total_mst_weight);
// }
// `
//       }
//     },
//     /* ════════════════════════════════════════════════════════════════════
//        9. TARJAN'S STRONGLY CONNECTED COMPONENTS (SCC) ALGORITHM
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Tarjan's SCC",
//       href: "/algorithms/graphs/tarjans-scc",
//       type: "Hard",

//       about: [
//         { tag: "h1", text: "Tarjan's Strongly Connected Components Algorithm" },
//         { tag: "p", text: "A Strongly Connected Component (SCC) of a directed graph is a maximal set of vertices where every vertex can reach every other vertex within that set via directed edges. Tarjan's algorithm, published by Robert Tarjan in 1972, finds ALL SCCs of a directed graph in a single depth-first traversal — a notable improvement over Kosaraju's alternative algorithm, which requires two full traversals (one on the original graph, one on its transpose)." },
//         { tag: "p", text: "The algorithm tracks two values per vertex during the DFS: a discoveryIndex (the order in which the vertex was first visited) and a lowLinkValue (the smallest discoveryIndex reachable from that vertex's DFS subtree, including via at most one 'back edge' to an ancestor still on the traversal stack). A vertex is the root of an SCC exactly when its lowLinkValue equals its own discoveryIndex — at that point, every vertex still on the stack above it belongs to the same SCC and can be popped off together." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Finding all strongly connected components in a directed graph in a single traversal, avoiding the second pass (and graph transpose) that Kosaraju's algorithm requires",
//           "Detecting cycles in a directed graph — any SCC containing more than one vertex necessarily contains a cycle",
//           "Building a condensation graph (collapsing each SCC into a single 'super-vertex'), which turns any directed graph into a DAG — a common preprocessing step before running Topological Sort or dependency analysis",
//           "2-SAT satisfiability solving, dead-code elimination in compilers, and detecting deadlock cycles in resource-allocation graphs"
//         ]},
//         { tag: "note", variant: "info", text: "Every vertex on the traversal stack at the moment its DFS call returns represents an 'unfinished' SCC candidate — the lowLinkValue comparison is what determines exactly when it's safe to finalise (pop) a complete SCC without accidentally splitting or merging components." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(V + E)",
//         best: [
//           { tag: "h2", text: "Best Case — O(V + E)" },
//           { tag: "p", text: "The algorithm performs a single depth-first traversal that visits every vertex and edge exactly once regardless of the graph's SCC structure — there's no early-exit shortcut, since every vertex must be assigned a discoveryIndex and lowLinkValue to correctly determine SCC membership." },
//           { tag: "ul", items: [
//             "Every vertex is visited exactly once (standard DFS property): O(V)",
//             "Every edge is examined exactly once: O(E)",
//             "Total: O(V + E), even in the most favourable graph structure"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(V + E)" },
//           { tag: "p", text: "The lowLinkValue propagation and stack-based SCC extraction perform the same fixed amount of work per vertex and edge regardless of how many SCCs the graph actually contains or their sizes." },
//           { tag: "ul", items: [
//             "Each vertex is pushed onto and popped from the traversal stack exactly once: O(V)",
//             "Each edge triggers exactly one lowLinkValue comparison/update: O(E)",
//             "Combined: O(V + E), matching standard DFS's structural cost exactly"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(V + E)" },
//           { tag: "p", text: "No graph structure increases the cost beyond the standard single-DFS-pass bound — this holds whether the graph is a single giant SCC, entirely acyclic (every vertex its own trivial SCC), or any structure in between." },
//           { tag: "ul", items: [
//             "Worst case matches best/average exactly: O(V + E)",
//             "This is a genuine improvement over Kosaraju's algorithm, which also achieves O(V + E) but requires TWO full traversals plus building the graph's transpose — Tarjan's constant factor is smaller"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(V)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(V)" },
//           { tag: "p", text: "The algorithm needs a discoveryIndex array, a lowLinkValue array, an onStack boolean array, and an explicit traversal stack, all sized to the number of vertices." },
//           { tag: "ul", items: ["discoveryIndex[], lowLinkValue[], onStack[]: O(V) each", "traversal stack: up to O(V) entries"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(V)" },
//           { tag: "p", text: "Space usage is fixed by vertex count alone, since every tracking array must accommodate every vertex regardless of the graph's SCC structure or edge density." },
//           { tag: "ul", items: ["Same O(V) bound regardless of how many SCCs exist or their relative sizes"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(V)" },
//           { tag: "p", text: "The recursive DFS call stack can also reach depth O(V) in the worst case (a single long chain of vertices), but this doesn't change the overall asymptotic space bound, since it's still linear in V." },
//           { tag: "ul", items: [
//             "Explicit traversal stack: O(V)",
//             "Recursive call stack depth: O(V) in the worst case of a long dependency chain",
//             "Total: O(V), identical across all cases"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function tarjanSCC(graph):
//     discoveryIndex ← map of vertex → undefined, for all vertices
//     lowLinkValue   ← map of vertex → undefined, for all vertices
//     onStack        ← map of vertex → false, for all vertices
//     traversalStack ← empty stack
//     nextIndex      ← 0
//     allComponents  ← empty list

//     function strongConnect(currentVertex):
//         discoveryIndex[currentVertex] ← nextIndex
//         lowLinkValue[currentVertex]   ← nextIndex
//         nextIndex ← nextIndex + 1
//         push(traversalStack, currentVertex)
//         onStack[currentVertex] ← true

//         for neighborVertex in graph.adjacent(currentVertex):
//             if discoveryIndex[neighborVertex] is undefined:
//                 // neighborVertex has not yet been visited — recurse into it
//                 strongConnect(neighborVertex)
//                 lowLinkValue[currentVertex] ← min(lowLinkValue[currentVertex], lowLinkValue[neighborVertex])
//             else if onStack[neighborVertex]:
//                 // neighborVertex is an ancestor still on the stack — a back edge
//                 lowLinkValue[currentVertex] ← min(lowLinkValue[currentVertex], discoveryIndex[neighborVertex])

//         // If currentVertex is the root of an SCC, pop the whole component off the stack
//         if lowLinkValue[currentVertex] == discoveryIndex[currentVertex]:
//             newComponent ← empty list
//             loop:
//                 poppedVertex ← pop(traversalStack)
//                 onStack[poppedVertex] ← false
//                 newComponent.append(poppedVertex)
//                 if poppedVertex == currentVertex:
//                     break
//             allComponents.append(newComponent)

//     for vertex in graph.vertices:
//         if discoveryIndex[vertex] is undefined:
//             strongConnect(vertex)

//     return allComponents` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Perform a standard DFS, but assign each vertex a discoveryIndex (the order it was first visited) and initialise its lowLinkValue to that same discoveryIndex.",
//           "Push each vertex onto an explicit traversal stack as soon as it's discovered, marking it as onStack.",
//           "For each edge to an unvisited neighbor, recurse into it first, then update the current vertex's lowLinkValue using the CHILD's resulting lowLinkValue — this propagates 'how far back' the subtree can reach.",
//           "For each edge to an already-visited neighbor that's STILL on the stack (a back edge to an ancestor, indicating a cycle), update the current vertex's lowLinkValue using the neighbor's discoveryIndex directly.",
//           "After processing all outgoing edges, check whether the current vertex's lowLinkValue equals its own discoveryIndex — if so, it's the root of a complete SCC. Pop vertices off the stack (marking each as no longer onStack) until the current vertex itself is popped; everything popped together forms one SCC."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "The lowLinkValue of a vertex, by construction, represents the smallest discoveryIndex reachable from that vertex's DFS subtree via tree edges plus at most one back edge to a vertex still on the stack (i.e. still part of an unfinished SCC). A vertex is the root of its SCC exactly when lowLinkValue equals discoveryIndex — meaning no vertex in its subtree can reach back to an ancestor of it, so its subtree (restricted to still-on-stack vertices) cannot be merged with any SCC further up the DFS tree. Popping the stack down to and including that vertex therefore yields exactly the set of vertices mutually reachable through it, which is by definition its complete strongly connected component, and this argument applies recursively to every SCC root encountered during the traversal — guaranteeing every vertex ends up in exactly one correctly-identified SCC." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <stack>
// #include <algorithm>
// using namespace std;

// vector<int> discoveryIndex;
// vector<int> lowLinkValue;
// vector<bool> onStack;
// stack<int> traversalStack;
// vector<vector<int>> allComponents;
// int nextIndex = 0;

// // Recursively explores 'currentVertex', computing discoveryIndex and
// // lowLinkValue, and finalises (pops) a complete SCC whenever
// // 'currentVertex' turns out to be that SCC's root.
// void strongConnect(int currentVertex, const vector<vector<int>>& adjacencyList) {
//     discoveryIndex[currentVertex] = nextIndex;
//     lowLinkValue[currentVertex] = nextIndex;
//     nextIndex++;

//     traversalStack.push(currentVertex);
//     onStack[currentVertex] = true;

//     for (int neighborVertex : adjacencyList[currentVertex]) {
//         if (discoveryIndex[neighborVertex] == -1) {
//             // neighborVertex has not yet been visited — recurse into it.
//             strongConnect(neighborVertex, adjacencyList);
//             lowLinkValue[currentVertex] = min(lowLinkValue[currentVertex], lowLinkValue[neighborVertex]);
//         } else if (onStack[neighborVertex]) {
//             // neighborVertex is an ancestor still on the stack — a back edge.
//             lowLinkValue[currentVertex] = min(lowLinkValue[currentVertex], discoveryIndex[neighborVertex]);
//         }
//     }

//     // If currentVertex is the root of an SCC, pop the whole component off the stack.
//     if (lowLinkValue[currentVertex] == discoveryIndex[currentVertex]) {
//         vector<int> newComponent;
//         while (true) {
//             int poppedVertex = traversalStack.top();
//             traversalStack.pop();
//             onStack[poppedVertex] = false;
//             newComponent.push_back(poppedVertex);
//             if (poppedVertex == currentVertex) {
//                 break;
//             }
//         }
//         allComponents.push_back(newComponent);
//     }
// }

// // Finds every Strongly Connected Component of the graph described by
// // 'adjacencyList', returning them as a list of vertex-lists.
// vector<vector<int>> tarjanSCC(const vector<vector<int>>& adjacencyList, int vertexCount) {
//     discoveryIndex.assign(vertexCount, -1);
//     lowLinkValue.assign(vertexCount, 0);
//     onStack.assign(vertexCount, false);
//     allComponents.clear();
//     nextIndex = 0;

//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         if (discoveryIndex[vertex] == -1) {
//             strongConnect(vertex, adjacencyList);
//         }
//     }

//     return allComponents;
// }

// int main() {
//     // Static demonstration data — a directed graph with 8 vertices,
//     // containing two 3-vertex cycles and one 2-vertex cycle.
//     int vertexCount = 8;
//     vector<vector<int>> adjacencyList(vertexCount);

//     adjacencyList[0].push_back(1);
//     adjacencyList[1].push_back(2);
//     adjacencyList[2].push_back(0);
//     adjacencyList[1].push_back(3);
//     adjacencyList[3].push_back(4);
//     adjacencyList[4].push_back(5);
//     adjacencyList[5].push_back(3);
//     adjacencyList[4].push_back(6);
//     adjacencyList[6].push_back(7);
//     adjacencyList[7].push_back(6);

//     vector<vector<int>> components = tarjanSCC(adjacencyList, vertexCount);

//     cout << "Strongly Connected Components:" << endl;
//     for (const vector<int>& component : components) {
//         cout << "  { ";
//         for (int vertex : component) {
//             cout << vertex << " ";
//         }
//         cout << "}" << endl;
//     }

//     return 0;
// }
// `,
//         "python": `import sys


// def tarjan_scc(adjacency_list, vertex_count):
//     """
//     Finds every Strongly Connected Component of the graph described by
//     'adjacency_list', returning them as a list of vertex-lists.
//     """
//     discovery_index = [-1] * vertex_count
//     low_link_value = [0] * vertex_count
//     on_stack = [False] * vertex_count
//     traversal_stack = []
//     all_components = []
//     next_index = [0]  # boxed in a list so the nested function can mutate it

//     def strong_connect(current_vertex):
//         discovery_index[current_vertex] = next_index[0]
//         low_link_value[current_vertex] = next_index[0]
//         next_index[0] += 1

//         traversal_stack.append(current_vertex)
//         on_stack[current_vertex] = True

//         for neighbor_vertex in adjacency_list[current_vertex]:
//             if discovery_index[neighbor_vertex] == -1:
//                 # neighbor_vertex has not yet been visited - recurse into it.
//                 strong_connect(neighbor_vertex)
//                 low_link_value[current_vertex] = min(low_link_value[current_vertex], low_link_value[neighbor_vertex])
//             elif on_stack[neighbor_vertex]:
//                 # neighbor_vertex is an ancestor still on the stack - a back edge.
//                 low_link_value[current_vertex] = min(low_link_value[current_vertex], discovery_index[neighbor_vertex])

//         # If current_vertex is the root of an SCC, pop the whole component off the stack.
//         if low_link_value[current_vertex] == discovery_index[current_vertex]:
//             new_component = []
//             while True:
//                 popped_vertex = traversal_stack.pop()
//                 on_stack[popped_vertex] = False
//                 new_component.append(popped_vertex)
//                 if popped_vertex == current_vertex:
//                     break
//             all_components.append(new_component)

//     for vertex in range(vertex_count):
//         if discovery_index[vertex] == -1:
//             strong_connect(vertex)

//     return all_components


// def main():
//     # Recursion depth can exceed Python's default limit on deep graphs;
//     # raised here purely for this static demonstration's safety margin.
//     sys.setrecursionlimit(10000)

//     # Static demonstration data - a directed graph with 8 vertices,
//     # containing two 3-vertex cycles and one 2-vertex cycle.
//     vertex_count = 8
//     adjacency_list = [[] for _ in range(vertex_count)]

//     edges = [(0, 1), (1, 2), (2, 0), (1, 3), (3, 4), (4, 5), (5, 3), (4, 6), (6, 7), (7, 6)]
//     for from_vertex, to_vertex in edges:
//         adjacency_list[from_vertex].append(to_vertex)

//     components = tarjan_scc(adjacency_list, vertex_count)

//     print("Strongly Connected Components:")
//     for component in components:
//         print(f"  {component}")


// if __name__ == "__main__":
//     main()
// `,
//         "java": `import java.util.ArrayList;
// import java.util.List;

// public class Main {

//     static int[] discoveryIndex;
//     static int[] lowLinkValue;
//     static boolean[] onStack;
//     static java.util.Deque<Integer> traversalStack;
//     static List<List<Integer>> allComponents;
//     static int nextIndex;

//     // Recursively explores 'currentVertex', computing discoveryIndex and
//     // lowLinkValue, and finalises (pops) a complete SCC whenever
//     // 'currentVertex' turns out to be that SCC's root.
//     static void strongConnect(int currentVertex, List<List<Integer>> adjacencyList) {
//         discoveryIndex[currentVertex] = nextIndex;
//         lowLinkValue[currentVertex] = nextIndex;
//         nextIndex++;

//         traversalStack.push(currentVertex);
//         onStack[currentVertex] = true;

//         for (int neighborVertex : adjacencyList.get(currentVertex)) {
//             if (discoveryIndex[neighborVertex] == -1) {
//                 // neighborVertex has not yet been visited — recurse into it.
//                 strongConnect(neighborVertex, adjacencyList);
//                 lowLinkValue[currentVertex] = Math.min(lowLinkValue[currentVertex], lowLinkValue[neighborVertex]);
//             } else if (onStack[neighborVertex]) {
//                 // neighborVertex is an ancestor still on the stack — a back edge.
//                 lowLinkValue[currentVertex] = Math.min(lowLinkValue[currentVertex], discoveryIndex[neighborVertex]);
//             }
//         }

//         // If currentVertex is the root of an SCC, pop the whole component off the stack.
//         if (lowLinkValue[currentVertex] == discoveryIndex[currentVertex]) {
//             List<Integer> newComponent = new ArrayList<>();
//             while (true) {
//                 int poppedVertex = traversalStack.pop();
//                 onStack[poppedVertex] = false;
//                 newComponent.add(poppedVertex);
//                 if (poppedVertex == currentVertex) {
//                     break;
//                 }
//             }
//             allComponents.add(newComponent);
//         }
//     }

//     // Finds every Strongly Connected Component of the graph described by
//     // 'adjacencyList', returning them as a list of vertex-lists.
//     static List<List<Integer>> tarjanSCC(List<List<Integer>> adjacencyList, int vertexCount) {
//         discoveryIndex = new int[vertexCount];
//         lowLinkValue = new int[vertexCount];
//         onStack = new boolean[vertexCount];
//         java.util.Arrays.fill(discoveryIndex, -1);
//         traversalStack = new java.util.ArrayDeque<>();
//         allComponents = new ArrayList<>();
//         nextIndex = 0;

//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             if (discoveryIndex[vertex] == -1) {
//                 strongConnect(vertex, adjacencyList);
//             }
//         }

//         return allComponents;
//     }

//     public static void main(String[] args) {
//         // Static demonstration data — a directed graph with 8 vertices,
//         // containing two 3-vertex cycles and one 2-vertex cycle.
//         int vertexCount = 8;
//         List<List<Integer>> adjacencyList = new ArrayList<>();
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             adjacencyList.add(new ArrayList<>());
//         }

//         int[][] edges = {{0, 1}, {1, 2}, {2, 0}, {1, 3}, {3, 4}, {4, 5}, {5, 3}, {4, 6}, {6, 7}, {7, 6}};
//         for (int[] edge : edges) {
//             adjacencyList.get(edge[0]).add(edge[1]);
//         }

//         List<List<Integer>> components = tarjanSCC(adjacencyList, vertexCount);

//         System.out.println("Strongly Connected Components:");
//         for (List<Integer> component : components) {
//             System.out.println("  " + component);
//         }
//     }
// }
// `,
//         "js": `// Finds every Strongly Connected Component of the graph described by
// // 'adjacencyList', returning them as an array of vertex-arrays.
// function tarjanSCC(adjacencyList, vertexCount) {
//     const discoveryIndex = new Array(vertexCount).fill(-1);
//     const lowLinkValue = new Array(vertexCount).fill(0);
//     const onStack = new Array(vertexCount).fill(false);
//     const traversalStack = [];
//     const allComponents = [];
//     let nextIndex = 0;

//     // Recursively explores 'currentVertex', computing discoveryIndex and
//     // lowLinkValue, and finalises (pops) a complete SCC whenever
//     // 'currentVertex' turns out to be that SCC's root.
//     function strongConnect(currentVertex) {
//         discoveryIndex[currentVertex] = nextIndex;
//         lowLinkValue[currentVertex] = nextIndex;
//         nextIndex++;

//         traversalStack.push(currentVertex);
//         onStack[currentVertex] = true;

//         for (const neighborVertex of adjacencyList[currentVertex]) {
//             if (discoveryIndex[neighborVertex] === -1) {
//                 // neighborVertex has not yet been visited — recurse into it.
//                 strongConnect(neighborVertex);
//                 lowLinkValue[currentVertex] = Math.min(lowLinkValue[currentVertex], lowLinkValue[neighborVertex]);
//             } else if (onStack[neighborVertex]) {
//                 // neighborVertex is an ancestor still on the stack — a back edge.
//                 lowLinkValue[currentVertex] = Math.min(lowLinkValue[currentVertex], discoveryIndex[neighborVertex]);
//             }
//         }

//         // If currentVertex is the root of an SCC, pop the whole component off the stack.
//         if (lowLinkValue[currentVertex] === discoveryIndex[currentVertex]) {
//             const newComponent = [];
//             while (true) {
//                 const poppedVertex = traversalStack.pop();
//                 onStack[poppedVertex] = false;
//                 newComponent.push(poppedVertex);
//                 if (poppedVertex === currentVertex) {
//                     break;
//                 }
//             }
//             allComponents.push(newComponent);
//         }
//     }

//     for (let vertex = 0; vertex < vertexCount; vertex++) {
//         if (discoveryIndex[vertex] === -1) {
//             strongConnect(vertex);
//         }
//     }

//     return allComponents;
// }

// function main() {
//     // Static demonstration data — a directed graph with 8 vertices,
//     // containing two 3-vertex cycles and one 2-vertex cycle.
//     const vertexCount = 8;
//     const adjacencyList = Array.from({ length: vertexCount }, () => []);

//     const edges = [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4], [4, 5], [5, 3], [4, 6], [6, 7], [7, 6]];
//     for (const [fromVertex, toVertex] of edges) {
//         adjacencyList[fromVertex].push(toVertex);
//     }

//     const components = tarjanSCC(adjacencyList, vertexCount);

//     console.log("Strongly Connected Components:");
//     for (const component of components) {
//         console.log("  " + JSON.stringify(component));
//     }
// }

// main();
// `,
//         "c": `#include <stdio.h>
// #include <string.h>

// #define MAX_VERTICES 100

// int adjacencyList[MAX_VERTICES][MAX_VERTICES];
// int neighborCount[MAX_VERTICES];

// int discoveryIndex[MAX_VERTICES];
// int lowLinkValue[MAX_VERTICES];
// int onStack[MAX_VERTICES];
// int traversalStack[MAX_VERTICES];
// int stackTop = -1;
// int nextIndex = 0;

// int componentMembers[MAX_VERTICES][MAX_VERTICES];
// int componentSize[MAX_VERTICES];
// int componentCount = 0;

// // Records a directed edge fromVertex -> toVertex in the fixed-size
// // adjacency list.
// void addDirectedEdge(int fromVertex, int toVertex) {
//     adjacencyList[fromVertex][neighborCount[fromVertex]++] = toVertex;
// }

// int minOfTwo(int first, int second) {
//     return first < second ? first : second;
// }

// // Recursively explores 'currentVertex', computing discoveryIndex and
// // lowLinkValue, and finalises (pops) a complete SCC whenever
// // 'currentVertex' turns out to be that SCC's root.
// void strongConnect(int currentVertex) {
//     discoveryIndex[currentVertex] = nextIndex;
//     lowLinkValue[currentVertex] = nextIndex;
//     nextIndex++;

//     traversalStack[++stackTop] = currentVertex;
//     onStack[currentVertex] = 1;

//     for (int i = 0; i < neighborCount[currentVertex]; i++) {
//         int neighborVertex = adjacencyList[currentVertex][i];

//         if (discoveryIndex[neighborVertex] == -1) {
//             /* neighborVertex has not yet been visited - recurse into it. */
//             strongConnect(neighborVertex);
//             lowLinkValue[currentVertex] = minOfTwo(lowLinkValue[currentVertex], lowLinkValue[neighborVertex]);
//         } else if (onStack[neighborVertex]) {
//             /* neighborVertex is an ancestor still on the stack - a back edge. */
//             lowLinkValue[currentVertex] = minOfTwo(lowLinkValue[currentVertex], discoveryIndex[neighborVertex]);
//         }
//     }

//     /* If currentVertex is the root of an SCC, pop the whole component off the stack. */
//     if (lowLinkValue[currentVertex] == discoveryIndex[currentVertex]) {
//         int size = 0;
//         while (1) {
//             int poppedVertex = traversalStack[stackTop--];
//             onStack[poppedVertex] = 0;
//             componentMembers[componentCount][size++] = poppedVertex;
//             if (poppedVertex == currentVertex) {
//                 break;
//             }
//         }
//         componentSize[componentCount] = size;
//         componentCount++;
//     }
// }

// int main() {
//     /* Static demonstration data - a directed graph with 8 vertices,
//        containing two 3-vertex cycles and one 2-vertex cycle. */
//     int vertexCount = 8;
//     memset(neighborCount, 0, sizeof(neighborCount));
//     memset(discoveryIndex, -1, sizeof(discoveryIndex));
//     memset(onStack, 0, sizeof(onStack));

//     addDirectedEdge(0, 1);
//     addDirectedEdge(1, 2);
//     addDirectedEdge(2, 0);
//     addDirectedEdge(1, 3);
//     addDirectedEdge(3, 4);
//     addDirectedEdge(4, 5);
//     addDirectedEdge(5, 3);
//     addDirectedEdge(4, 6);
//     addDirectedEdge(6, 7);
//     addDirectedEdge(7, 6);

//     for (int vertex = 0; vertex < vertexCount; vertex++) {
//         if (discoveryIndex[vertex] == -1) {
//             strongConnect(vertex);
//         }
//     }

//     printf("Strongly Connected Components:\\n");
//     for (int component = 0; component < componentCount; component++) {
//         printf("  { ");
//         for (int i = 0; i < componentSize[component]; i++) {
//             printf("%d ", componentMembers[component][i]);
//         }
//         printf("}\\n");
//     }

//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;

// class Program {

//     static int[] discoveryIndex;
//     static int[] lowLinkValue;
//     static bool[] onStack;
//     static Stack<int> traversalStack;
//     static List<List<int>> allComponents;
//     static int nextIndex;

//     // Recursively explores 'currentVertex', computing discoveryIndex and
//     // lowLinkValue, and finalises (pops) a complete SCC whenever
//     // 'currentVertex' turns out to be that SCC's root.
//     static void StrongConnect(int currentVertex, List<int>[] adjacencyList) {
//         discoveryIndex[currentVertex] = nextIndex;
//         lowLinkValue[currentVertex] = nextIndex;
//         nextIndex++;

//         traversalStack.Push(currentVertex);
//         onStack[currentVertex] = true;

//         foreach (int neighborVertex in adjacencyList[currentVertex]) {
//             if (discoveryIndex[neighborVertex] == -1) {
//                 // neighborVertex has not yet been visited — recurse into it.
//                 StrongConnect(neighborVertex, adjacencyList);
//                 lowLinkValue[currentVertex] = Math.Min(lowLinkValue[currentVertex], lowLinkValue[neighborVertex]);
//             } else if (onStack[neighborVertex]) {
//                 // neighborVertex is an ancestor still on the stack — a back edge.
//                 lowLinkValue[currentVertex] = Math.Min(lowLinkValue[currentVertex], discoveryIndex[neighborVertex]);
//             }
//         }

//         // If currentVertex is the root of an SCC, pop the whole component off the stack.
//         if (lowLinkValue[currentVertex] == discoveryIndex[currentVertex]) {
//             var newComponent = new List<int>();
//             while (true) {
//                 int poppedVertex = traversalStack.Pop();
//                 onStack[poppedVertex] = false;
//                 newComponent.Add(poppedVertex);
//                 if (poppedVertex == currentVertex) {
//                     break;
//                 }
//             }
//             allComponents.Add(newComponent);
//         }
//     }

//     // Finds every Strongly Connected Component of the graph described by
//     // 'adjacencyList', returning them as a list of vertex-lists.
//     static List<List<int>> TarjanSCC(List<int>[] adjacencyList, int vertexCount) {
//         discoveryIndex = new int[vertexCount];
//         lowLinkValue = new int[vertexCount];
//         onStack = new bool[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             discoveryIndex[vertex] = -1;
//         }
//         traversalStack = new Stack<int>();
//         allComponents = new List<List<int>>();
//         nextIndex = 0;

//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             if (discoveryIndex[vertex] == -1) {
//                 StrongConnect(vertex, adjacencyList);
//             }
//         }

//         return allComponents;
//     }

//     static void Main() {
//         // Static demonstration data — a directed graph with 8 vertices,
//         // containing two 3-vertex cycles and one 2-vertex cycle.
//         int vertexCount = 8;
//         var adjacencyList = new List<int>[vertexCount];
//         for (int vertex = 0; vertex < vertexCount; vertex++) {
//             adjacencyList[vertex] = new List<int>();
//         }

//         int[][] edges = {
//             new[] {0, 1}, new[] {1, 2}, new[] {2, 0}, new[] {1, 3}, new[] {3, 4},
//             new[] {4, 5}, new[] {5, 3}, new[] {4, 6}, new[] {6, 7}, new[] {7, 6}
//         };
//         foreach (int[] edge in edges) {
//             adjacencyList[edge[0]].Add(edge[1]);
//         }

//         List<List<int>> components = TarjanSCC(adjacencyList, vertexCount);

//         Console.WriteLine("Strongly Connected Components:");
//         foreach (List<int> component in components) {
//             Console.WriteLine("  [" + string.Join(", ", component) + "]");
//         }
//     }
// }
// `,
//         "swift": `import Foundation

// var discoveryIndex: [Int] = []
// var lowLinkValue: [Int] = []
// var onStack: [Bool] = []
// var traversalStack: [Int] = []
// var allComponents: [[Int]] = []
// var nextIndex = 0

// // Recursively explores 'currentVertex', computing discoveryIndex and
// // lowLinkValue, and finalises (pops) a complete SCC whenever
// // 'currentVertex' turns out to be that SCC's root.
// func strongConnect(_ currentVertex: Int, _ adjacencyList: [[Int]]) {
//     discoveryIndex[currentVertex] = nextIndex
//     lowLinkValue[currentVertex] = nextIndex
//     nextIndex += 1

//     traversalStack.append(currentVertex)
//     onStack[currentVertex] = true

//     for neighborVertex in adjacencyList[currentVertex] {
//         if discoveryIndex[neighborVertex] == -1 {
//             // neighborVertex has not yet been visited — recurse into it.
//             strongConnect(neighborVertex, adjacencyList)
//             lowLinkValue[currentVertex] = min(lowLinkValue[currentVertex], lowLinkValue[neighborVertex])
//         } else if onStack[neighborVertex] {
//             // neighborVertex is an ancestor still on the stack — a back edge.
//             lowLinkValue[currentVertex] = min(lowLinkValue[currentVertex], discoveryIndex[neighborVertex])
//         }
//     }

//     // If currentVertex is the root of an SCC, pop the whole component off the stack.
//     if lowLinkValue[currentVertex] == discoveryIndex[currentVertex] {
//         var newComponent: [Int] = []
//         while true {
//             let poppedVertex = traversalStack.removeLast()
//             onStack[poppedVertex] = false
//             newComponent.append(poppedVertex)
//             if poppedVertex == currentVertex {
//                 break
//             }
//         }
//         allComponents.append(newComponent)
//     }
// }

// // Finds every Strongly Connected Component of the graph described by
// // 'adjacencyList', returning them as an array of vertex-arrays.
// func tarjanSCC(_ adjacencyList: [[Int]], _ vertexCount: Int) -> [[Int]] {
//     discoveryIndex = [Int](repeating: -1, count: vertexCount)
//     lowLinkValue = [Int](repeating: 0, count: vertexCount)
//     onStack = [Bool](repeating: false, count: vertexCount)
//     traversalStack = []
//     allComponents = []
//     nextIndex = 0

//     for vertex in 0..<vertexCount {
//         if discoveryIndex[vertex] == -1 {
//             strongConnect(vertex, adjacencyList)
//         }
//     }

//     return allComponents
// }

// // Static demonstration data — a directed graph with 8 vertices,
// // containing two 3-vertex cycles and one 2-vertex cycle.
// let vertexCount = 8
// var adjacencyList = [[Int]](repeating: [], count: vertexCount)

// let edges = [(0, 1), (1, 2), (2, 0), (1, 3), (3, 4), (4, 5), (5, 3), (4, 6), (6, 7), (7, 6)]
// for (fromVertex, toVertex) in edges {
//     adjacencyList[fromVertex].append(toVertex)
// }

// let components = tarjanSCC(adjacencyList, vertexCount)

// print("Strongly Connected Components:")
// for component in components {
//     print("  \\(component)")
// }
// `,
//         "kotlin": `lateinit var discoveryIndex: IntArray
// lateinit var lowLinkValue: IntArray
// lateinit var onStack: BooleanArray
// val traversalStack: java.util.ArrayDeque<Int> = java.util.ArrayDeque()
// val allComponents: MutableList<List<Int>> = mutableListOf()
// var nextIndex = 0

// // Recursively explores 'currentVertex', computing discoveryIndex and
// // lowLinkValue, and finalises (pops) a complete SCC whenever
// // 'currentVertex' turns out to be that SCC's root.
// fun strongConnect(currentVertex: Int, adjacencyList: Array<MutableList<Int>>) {
//     discoveryIndex[currentVertex] = nextIndex
//     lowLinkValue[currentVertex] = nextIndex
//     nextIndex++

//     traversalStack.push(currentVertex)
//     onStack[currentVertex] = true

//     for (neighborVertex in adjacencyList[currentVertex]) {
//         if (discoveryIndex[neighborVertex] == -1) {
//             // neighborVertex has not yet been visited — recurse into it.
//             strongConnect(neighborVertex, adjacencyList)
//             lowLinkValue[currentVertex] = minOf(lowLinkValue[currentVertex], lowLinkValue[neighborVertex])
//         } else if (onStack[neighborVertex]) {
//             // neighborVertex is an ancestor still on the stack — a back edge.
//             lowLinkValue[currentVertex] = minOf(lowLinkValue[currentVertex], discoveryIndex[neighborVertex])
//         }
//     }

//     // If currentVertex is the root of an SCC, pop the whole component off the stack.
//     if (lowLinkValue[currentVertex] == discoveryIndex[currentVertex]) {
//         val newComponent = mutableListOf<Int>()
//         while (true) {
//             val poppedVertex = traversalStack.pop()
//             onStack[poppedVertex] = false
//             newComponent.add(poppedVertex)
//             if (poppedVertex == currentVertex) {
//                 break
//             }
//         }
//         allComponents.add(newComponent)
//     }
// }

// // Finds every Strongly Connected Component of the graph described by
// // 'adjacencyList', returning them as a list of vertex-lists.
// fun tarjanSCC(adjacencyList: Array<MutableList<Int>>, vertexCount: Int): List<List<Int>> {
//     discoveryIndex = IntArray(vertexCount) { -1 }
//     lowLinkValue = IntArray(vertexCount)
//     onStack = BooleanArray(vertexCount)
//     nextIndex = 0

//     for (vertex in 0 until vertexCount) {
//         if (discoveryIndex[vertex] == -1) {
//             strongConnect(vertex, adjacencyList)
//         }
//     }

//     return allComponents
// }

// fun main() {
//     // Static demonstration data — a directed graph with 8 vertices,
//     // containing two 3-vertex cycles and one 2-vertex cycle.
//     val vertexCount = 8
//     val adjacencyList = Array(vertexCount) { mutableListOf<Int>() }

//     val edges = listOf(0 to 1, 1 to 2, 2 to 0, 1 to 3, 3 to 4, 4 to 5, 5 to 3, 4 to 6, 6 to 7, 7 to 6)
//     for ((fromVertex, toVertex) in edges) {
//         adjacencyList[fromVertex].add(toVertex)
//     }

//     val components = tarjanSCC(adjacencyList, vertexCount)

//     println("Strongly Connected Components:")
//     for (component in components) {
//         println("  $component")
//     }
// }
// `,
//         "scala": `import scala.collection.mutable

// object Main extends App {

//   val discoveryIndex = mutable.ArrayBuffer[Int]()
//   val lowLinkValue = mutable.ArrayBuffer[Int]()
//   val onStack = mutable.ArrayBuffer[Boolean]()
//   val traversalStack = mutable.Stack[Int]()
//   val allComponents = mutable.ListBuffer[List[Int]]()
//   var nextIndex = 0

//   // Recursively explores 'currentVertex', computing discoveryIndex and
//   // lowLinkValue, and finalises (pops) a complete SCC whenever
//   // 'currentVertex' turns out to be that SCC's root.
//   def strongConnect(currentVertex: Int, adjacencyList: Array[mutable.ListBuffer[Int]]): Unit = {
//     discoveryIndex(currentVertex) = nextIndex
//     lowLinkValue(currentVertex) = nextIndex
//     nextIndex += 1

//     traversalStack.push(currentVertex)
//     onStack(currentVertex) = true

//     for (neighborVertex <- adjacencyList(currentVertex)) {
//       if (discoveryIndex(neighborVertex) == -1) {
//         // neighborVertex has not yet been visited — recurse into it.
//         strongConnect(neighborVertex, adjacencyList)
//         lowLinkValue(currentVertex) = lowLinkValue(currentVertex) min lowLinkValue(neighborVertex)
//       } else if (onStack(neighborVertex)) {
//         // neighborVertex is an ancestor still on the stack — a back edge.
//         lowLinkValue(currentVertex) = lowLinkValue(currentVertex) min discoveryIndex(neighborVertex)
//       }
//     }

//     // If currentVertex is the root of an SCC, pop the whole component off the stack.
//     if (lowLinkValue(currentVertex) == discoveryIndex(currentVertex)) {
//       val newComponent = mutable.ListBuffer[Int]()
//       var continueLoop = true
//       while (continueLoop) {
//         val poppedVertex = traversalStack.pop()
//         onStack(poppedVertex) = false
//         newComponent += poppedVertex
//         if (poppedVertex == currentVertex) {
//           continueLoop = false
//         }
//       }
//       allComponents += newComponent.toList
//     }
//   }

//   // Finds every Strongly Connected Component of the graph described by
//   // 'adjacencyList', returning them as a list of vertex-lists.
//   def tarjanSCC(adjacencyList: Array[mutable.ListBuffer[Int]], vertexCount: Int): List[List[Int]] = {
//     discoveryIndex.clear(); discoveryIndex ++= Array.fill(vertexCount)(-1)
//     lowLinkValue.clear(); lowLinkValue ++= Array.fill(vertexCount)(0)
//     onStack.clear(); onStack ++= Array.fill(vertexCount)(false)
//     nextIndex = 0

//     for (vertex <- 0 until vertexCount) {
//       if (discoveryIndex(vertex) == -1) {
//         strongConnect(vertex, adjacencyList)
//       }
//     }

//     allComponents.toList
//   }

//   // Static demonstration data — a directed graph with 8 vertices,
//   // containing two 3-vertex cycles and one 2-vertex cycle.
//   val vertexCount = 8
//   val adjacencyList: Array[mutable.ListBuffer[Int]] = Array.fill(vertexCount)(mutable.ListBuffer[Int]())

//   val edges = List((0, 1), (1, 2), (2, 0), (1, 3), (3, 4), (4, 5), (5, 3), (4, 6), (6, 7), (7, 6))
//   for ((fromVertex, toVertex) <- edges) {
//     adjacencyList(fromVertex) += toVertex
//   }

//   val components = tarjanSCC(adjacencyList, vertexCount)

//   println("Strongly Connected Components:")
//   components.foreach(component => println(s"  $component"))
// }
// `,
//         "go": `package main

// import "fmt"

// var discoveryIndex []int
// var lowLinkValue []int
// var onStack []bool
// var traversalStack []int
// var allComponents [][]int
// var nextIndex int

// // minOfTwo returns the smaller of two integers.
// func minOfTwo(first int, second int) int {
// 	if first < second {
// 		return first
// 	}
// 	return second
// }

// // strongConnect recursively explores currentVertex, computing
// // discoveryIndex and lowLinkValue, and finalises (pops) a complete SCC
// // whenever currentVertex turns out to be that SCC's root.
// func strongConnect(currentVertex int, adjacencyList [][]int) {
// 	discoveryIndex[currentVertex] = nextIndex
// 	lowLinkValue[currentVertex] = nextIndex
// 	nextIndex++

// 	traversalStack = append(traversalStack, currentVertex)
// 	onStack[currentVertex] = true

// 	for _, neighborVertex := range adjacencyList[currentVertex] {
// 		if discoveryIndex[neighborVertex] == -1 {
// 			// neighborVertex has not yet been visited — recurse into it.
// 			strongConnect(neighborVertex, adjacencyList)
// 			lowLinkValue[currentVertex] = minOfTwo(lowLinkValue[currentVertex], lowLinkValue[neighborVertex])
// 		} else if onStack[neighborVertex] {
// 			// neighborVertex is an ancestor still on the stack — a back edge.
// 			lowLinkValue[currentVertex] = minOfTwo(lowLinkValue[currentVertex], discoveryIndex[neighborVertex])
// 		}
// 	}

// 	// If currentVertex is the root of an SCC, pop the whole component off the stack.
// 	if lowLinkValue[currentVertex] == discoveryIndex[currentVertex] {
// 		newComponent := []int{}
// 		for {
// 			lastIndex := len(traversalStack) - 1
// 			poppedVertex := traversalStack[lastIndex]
// 			traversalStack = traversalStack[:lastIndex]
// 			onStack[poppedVertex] = false
// 			newComponent = append(newComponent, poppedVertex)
// 			if poppedVertex == currentVertex {
// 				break
// 			}
// 		}
// 		allComponents = append(allComponents, newComponent)
// 	}
// }

// // tarjanSCC finds every Strongly Connected Component of the graph
// // described by adjacencyList, returning them as a slice of vertex-slices.
// func tarjanSCC(adjacencyList [][]int, vertexCount int) [][]int {
// 	discoveryIndex = make([]int, vertexCount)
// 	lowLinkValue = make([]int, vertexCount)
// 	onStack = make([]bool, vertexCount)
// 	for vertex := range discoveryIndex {
// 		discoveryIndex[vertex] = -1
// 	}
// 	traversalStack = []int{}
// 	allComponents = [][]int{}
// 	nextIndex = 0

// 	for vertex := 0; vertex < vertexCount; vertex++ {
// 		if discoveryIndex[vertex] == -1 {
// 			strongConnect(vertex, adjacencyList)
// 		}
// 	}

// 	return allComponents
// }

// func main() {
// 	// Static demonstration data - a directed graph with 8 vertices,
// 	// containing two 3-vertex cycles and one 2-vertex cycle.
// 	vertexCount := 8
// 	adjacencyList := make([][]int, vertexCount)

// 	edges := [][2]int{{0, 1}, {1, 2}, {2, 0}, {1, 3}, {3, 4}, {4, 5}, {5, 3}, {4, 6}, {6, 7}, {7, 6}}
// 	for _, edge := range edges {
// 		fromVertex, toVertex := edge[0], edge[1]
// 		adjacencyList[fromVertex] = append(adjacencyList[fromVertex], toVertex)
// 	}

// 	components := tarjanSCC(adjacencyList, vertexCount)

// 	fmt.Println("Strongly Connected Components:")
// 	for _, component := range components {
// 		fmt.Println(" ", component)
// 	}
// }
// `,
//         "rust": `// Recursively explores 'current_vertex', computing discovery_index and
// // low_link_value, and finalises (pops) a complete SCC whenever
// // 'current_vertex' turns out to be that SCC's root.
// fn strong_connect(
//     current_vertex: usize,
//     adjacency_list: &Vec<Vec<usize>>,
//     discovery_index: &mut Vec<i32>,
//     low_link_value: &mut Vec<i32>,
//     on_stack: &mut Vec<bool>,
//     traversal_stack: &mut Vec<usize>,
//     all_components: &mut Vec<Vec<usize>>,
//     next_index: &mut i32,
// ) {
//     discovery_index[current_vertex] = *next_index;
//     low_link_value[current_vertex] = *next_index;
//     *next_index += 1;

//     traversal_stack.push(current_vertex);
//     on_stack[current_vertex] = true;

//     for &neighbor_vertex in &adjacency_list[current_vertex] {
//         if discovery_index[neighbor_vertex] == -1 {
//             // neighbor_vertex has not yet been visited — recurse into it.
//             strong_connect(
//                 neighbor_vertex,
//                 adjacency_list,
//                 discovery_index,
//                 low_link_value,
//                 on_stack,
//                 traversal_stack,
//                 all_components,
//                 next_index,
//             );
//             low_link_value[current_vertex] = low_link_value[current_vertex].min(low_link_value[neighbor_vertex]);
//         } else if on_stack[neighbor_vertex] {
//             // neighbor_vertex is an ancestor still on the stack — a back edge.
//             low_link_value[current_vertex] = low_link_value[current_vertex].min(discovery_index[neighbor_vertex]);
//         }
//     }

//     // If current_vertex is the root of an SCC, pop the whole component off the stack.
//     if low_link_value[current_vertex] == discovery_index[current_vertex] {
//         let mut new_component: Vec<usize> = Vec::new();
//         loop {
//             let popped_vertex = traversal_stack.pop().unwrap();
//             on_stack[popped_vertex] = false;
//             new_component.push(popped_vertex);
//             if popped_vertex == current_vertex {
//                 break;
//             }
//         }
//         all_components.push(new_component);
//     }
// }

// // Finds every Strongly Connected Component of the graph described by
// // 'adjacency_list', returning them as a vector of vertex-vectors.
// fn tarjan_scc(adjacency_list: &Vec<Vec<usize>>, vertex_count: usize) -> Vec<Vec<usize>> {
//     let mut discovery_index: Vec<i32> = vec![-1; vertex_count];
//     let mut low_link_value: Vec<i32> = vec![0; vertex_count];
//     let mut on_stack: Vec<bool> = vec![false; vertex_count];
//     let mut traversal_stack: Vec<usize> = Vec::new();
//     let mut all_components: Vec<Vec<usize>> = Vec::new();
//     let mut next_index: i32 = 0;

//     for vertex in 0..vertex_count {
//         if discovery_index[vertex] == -1 {
//             strong_connect(
//                 vertex,
//                 adjacency_list,
//                 &mut discovery_index,
//                 &mut low_link_value,
//                 &mut on_stack,
//                 &mut traversal_stack,
//                 &mut all_components,
//                 &mut next_index,
//             );
//         }
//     }

//     all_components
// }

// fn main() {
//     // Static demonstration data - a directed graph with 8 vertices,
//     // containing two 3-vertex cycles and one 2-vertex cycle.
//     let vertex_count = 8;
//     let mut adjacency_list: Vec<Vec<usize>> = vec![Vec::new(); vertex_count];

//     let edges = vec![(0, 1), (1, 2), (2, 0), (1, 3), (3, 4), (4, 5), (5, 3), (4, 6), (6, 7), (7, 6)];
//     for (from_vertex, to_vertex) in edges {
//         adjacency_list[from_vertex].push(to_vertex);
//     }

//     let components = tarjan_scc(&adjacency_list, vertex_count);

//     println!("Strongly Connected Components:");
//     for component in &components {
//         println!("  {:?}", component);
//     }
// }
// `
//       }
//     }

//   ],
//   desc: "BFS, DFS, Dijkstra, Bellman-Ford, Floyd",
//   complexity: "O(V + E)",
//   featured: true,
// };



const GRAPHS_SECTION = {
  name: "Graphs",
  href: "/algorithms/graphs",
    iconId: "Graph",
    hoverIconId: "Graph",

  about: [
    { tag: "h1", text: "Graphs" },
    { tag: "p", text: "A graph is a collection of vertices (nodes) connected by edges, used to model anything with relationships: road networks, social connections, dependency chains, computer networks, and state-transition systems. Unlike trees, graphs can contain cycles and don't require a single root, which is why graph algorithms must explicitly track visited state to avoid infinite loops." },
    { tag: "p", text: "Most graph algorithms fall into a handful of families: traversal (BFS, DFS — visit every reachable node), shortest path (Dijkstra, Bellman-Ford, Floyd-Warshall — find minimum-cost routes), minimum spanning tree (Kruskal, Prim — connect all nodes at minimum total edge cost), and structural analysis (Topological Sort, Tarjan's SCC — extract ordering or connectivity structure)." },
    { tag: "h2", text: "Representation matters" },
    { tag: "p", text: "Almost every complexity bound below is expressed in terms of V (vertices) and E (edges), and which representation you use changes the constants involved. An adjacency list (array of neighbor lists per vertex) takes O(V + E) space and is the standard choice for sparse graphs. An adjacency matrix (V×V grid of edge weights/booleans) takes O(V²) space but gives O(1) edge-existence checks, which matters for dense graphs and for Floyd-Warshall specifically." },
    { tag: "table",
      headers: ["Algorithm", "Problem Solved", "Time", "Handles Negative Weights?"],
      rows: [
        ["BFS", "Shortest path by edge count (unweighted)", "O(V + E)", "N/A (unweighted)"],
        ["DFS", "Reachability, cycle detection, ordering", "O(V + E)", "N/A (unweighted)"],
        ["Topological Sort", "Linear ordering respecting DAG dependencies", "O(V + E)", "N/A"],
        ["Dijkstra's Algorithm", "Single-source shortest path, non-negative weights", "O((V+E) log V)", "No"],
        ["Bellman-Ford Algorithm", "Single-source shortest path, detects negative cycles", "O(VE)", "Yes"],
        ["Floyd-Warshall Algorithm", "All-pairs shortest path", "O(V³)", "Yes (no negative cycles)"],
        ["Kruskal's Algorithm", "Minimum spanning tree, edge-driven", "O(E log E)", "N/A (MST, not shortest path)"],
        ["Prim's Algorithm", "Minimum spanning tree, vertex-driven", "O((V+E) log V)", "N/A (MST, not shortest path)"],
        ["Tarjan's SCC", "Strongly connected components (directed graphs)", "O(V + E)", "N/A"]
      ]
    },
    { tag: "note", variant: "tip", text: "If edge weights can be negative, Dijkstra silently produces wrong answers without warning — always reach for Bellman-Ford instead when negative weights are possible." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. BREADTH-FIRST SEARCH (BFS)
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Breadth-First Search (BFS)",
      href: "/algorithms/graphs/bfs",
      type: "Easy",

      about: [
        { tag: "h1", text: "Breadth-First Search (BFS)" },
        { tag: "p", text: "BFS explores a graph level by level: it visits all neighbors of the starting node first, then all neighbors of those neighbors, and so on — expanding outward in concentric 'rings' from the source. It uses a queue (FIFO) to ensure nodes are processed in the order they were discovered, which is exactly what produces the level-by-level expansion pattern." },
        { tag: "p", text: "Its single most important property is that on an unweighted graph, the first time BFS reaches a node is guaranteed to be via a shortest path (fewest edges) from the source — this is why BFS is the standard algorithm for shortest-path-by-hop-count problems, not just generic traversal." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "You need the shortest path in terms of number of edges (unweighted graph)",
          "You need to find the minimum number of 'moves' or 'steps' in a state-space search (puzzle solving, word ladders, maze shortest path)",
          "You want to process a graph level-by-level (e.g. finding all nodes within k hops of a source)",
          "You need to check bipartiteness (BFS with 2-coloring) or find connected components"
        ]},
        { tag: "note", variant: "info", text: "BFS and DFS share the same O(V + E) time complexity — the choice between them is about what property you need (shortest unweighted path vs. simpler stack-based exploration), not about speed." }
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          { tag: "p", text: "Even if the target node is the very first neighbor discovered, BFS as a full traversal still visits every vertex and edge to maintain the queue-based invariant and avoid revisiting nodes — there's no asymptotic shortcut, though early-exit search variants can stop sooner in practice." },
          { tag: "ul", items: [
            "Every vertex is enqueued and dequeued at most once: O(V)",
            "Every edge is examined exactly once (or twice for undirected graphs, a constant factor): O(E)",
            "Total: O(V + E), even in the most favourable input"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          { tag: "p", text: "BFS performs the same fixed sequence of operations (enqueue, mark visited, examine neighbors) regardless of graph shape — the total work is structurally determined by V and E, not by the specific arrangement of edges." },
          { tag: "ul", items: [
            "Each vertex transitions through queue states exactly once: enqueued, then dequeued and processed — O(V) total",
            "Each edge is inspected exactly once per direction it represents — O(E) total",
            "Combined: O(V + E), regardless of graph topology"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          { tag: "p", text: "There's no adversarial graph structure that increases BFS's cost beyond visiting every vertex and edge exactly once — a dense graph with E close to V² simply makes the E term dominate, but the bound itself doesn't change form." },
          { tag: "ul", items: [
            "Worst case is identical to best/average in asymptotic form: O(V + E)",
            "For a dense graph (E ≈ V²), this becomes O(V²), but that's purely a consequence of the input's edge count, not algorithmic degeneration",
            "This matches the trivial lower bound: any correct traversal must examine every reachable vertex and edge at least once"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "BFS needs a visited-set and a queue, both of which can hold up to V vertices in the worst layer-width scenario, even in the most favourable graph shape." },
          { tag: "ul", items: ["visited set/array: O(V)", "queue: up to O(V) entries at its widest point"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage scales with the number of vertices regardless of edge density, since the visited-tracking structure must accommodate every vertex." },
          { tag: "ul", items: ["visited array: O(V)", "queue: bounded by O(V) since each vertex enters at most once"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          { tag: "p", text: "In a 'star' or very wide graph, an entire layer of the BFS frontier can contain almost all V vertices simultaneously in the queue, but this still stays bounded by O(V) — it never exceeds the vertex count." },
          { tag: "ul", items: [
            "Maximum queue size: O(V) (bounded by total vertex count, can't exceed it)",
            "visited set: O(V)",
            "Total: O(V), independent of E"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function bfs(graph, source):
    visited ← set containing source
    queue   ← empty queue
    enqueue(queue, source)
    distance[source] ← 0

    while queue is not empty:
        current ← dequeue(queue)

        for neighbor in graph.adjacent(current):
            if neighbor not in visited:
                visited.add(neighbor)
                distance[neighbor] ← distance[current] + 1
                parent[neighbor] ← current
                enqueue(queue, neighbor)

    return distance, parent` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Mark the source as visited and enqueue it with distance 0.",
          "Repeatedly dequeue the front of the queue (the 'oldest' discovered, not-yet-expanded node).",
          "For each of its neighbors, if not already visited, mark it visited immediately upon discovery (critical: mark visited at enqueue time, not dequeue time, to avoid duplicate enqueues), record its distance as one more than the current node's, and enqueue it.",
          "Repeat until the queue is empty — every reachable vertex has now been visited exactly once, with the shortest hop-distance recorded."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: the queue, at any point, contains vertices from at most two consecutive 'distance layers' (distance d and d+1), and the queue is ordered so all distance-d vertices are dequeued before any distance-(d+1) vertex. By induction on distance d, this guarantees the first time any vertex is discovered, it's discovered via a path of length equal to its true shortest distance from the source — a vertex at true distance d cannot be discovered before all distance-(d-1) vertices have been fully processed, since it can only be reached through one of them." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
using namespace std;

void bfs(vector<vector<int>>& graph_adj, int source, int n) {
    vector<int> distance(n, -1);
    vector<int> parent(n, -1);
    queue<int> q;

    distance[source] = 0;
    q.push(source);

    while (!q.empty()) {
        int current = q.front(); q.pop();
        cout << "Visiting: " << current << " (dist=" << distance[current] << ")\\n";

        for (int neighbor : graph_adj[current]) {
            if (distance[neighbor] == -1) {
                distance[neighbor] = distance[current] + 1;
                parent[neighbor] = current;
                q.push(neighbor);
            }
        }
    }

    cout << "\\nDistances from source " << source << ":\\n";
    for (int i = 0; i < n; i++)
        cout << "  Node " << i << ": " << distance[i] << "\\n";
}

int main() {
    int n = 6;
    vector<vector<int>> graph_adj(n);
    // Add undirected edges
    auto addEdge = [&](int u, int v) {
        graph_adj[u].push_back(v);
        graph_adj[v].push_back(u);
    };
    addEdge(0, 1); addEdge(0, 2);
    addEdge(1, 3); addEdge(1, 4);
    addEdge(2, 5);

    bfs(graph_adj, 0, n);
    return 0;
}`,

  "python": `from collections import deque

def bfs(graph_adj, source, n):
    distance = [-1] * n
    parent = [-1] * n
    distance[source] = 0
    q = deque([source])

    while q:
        current = q.popleft()
        print(f"Visiting: {current} (dist={distance[current]})")

        for neighbor in graph_adj[current]:
            if distance[neighbor] == -1:
                distance[neighbor] = distance[current] + 1
                parent[neighbor] = current
                q.append(neighbor)

    print(f"\\nDistances from source {source}:")
    for i in range(n):
        print(f"  Node {i}: {distance[i]}")

if __name__ == "__main__":
    n = 6
    graph_adj = [[] for _ in range(n)]
    def add_edge(u, v):
        graph_adj[u].append(v)
        graph_adj[v].append(u)
    add_edge(0, 1); add_edge(0, 2)
    add_edge(1, 3); add_edge(1, 4)
    add_edge(2, 5)
    bfs(graph_adj, 0, n)`,

  "java": `import java.util.*;

public class Main {
    static void bfs(List<List<Integer>> graphAdj, int source, int n) {
        int[] distance = new int[n];
        int[] parent = new int[n];
        Arrays.fill(distance, -1);
        Arrays.fill(parent, -1);

        Queue<Integer> queue = new LinkedList<>();
        distance[source] = 0;
        queue.add(source);

        while (!queue.isEmpty()) {
            int current = queue.poll();
            System.out.println("Visiting: " + current + " (dist=" + distance[current] + ")");

            for (int neighbor : graphAdj.get(current)) {
                if (distance[neighbor] == -1) {
                    distance[neighbor] = distance[current] + 1;
                    parent[neighbor] = current;
                    queue.add(neighbor);
                }
            }
        }

        System.out.println("\\nDistances from source " + source + ":");
        for (int i = 0; i < n; i++)
            System.out.println("  Node " + i + ": " + distance[i]);
    }

    public static void main(String[] args) {
        int n = 6;
        List<List<Integer>> graphAdj = new ArrayList<>();
        for (int i = 0; i < n; i++) graphAdj.add(new ArrayList<>());

        int[][] edges = {{0,1},{0,2},{1,3},{1,4},{2,5}};
        for (int[] e : edges) {
            graphAdj.get(e[0]).add(e[1]);
            graphAdj.get(e[1]).add(e[0]);
        }
        bfs(graphAdj, 0, n);
    }
}`,

  "js": `function bfs(graphAdj, source, n) {
    const distance = new Array(n).fill(-1);
    const parent = new Array(n).fill(-1);
    const queue = [];

    distance[source] = 0;
    queue.push(source);

    while (queue.length > 0) {
        const current = queue.shift();
        console.log(\`Visiting: \${current} (dist=\${distance[current]})\`);

        for (const neighbor of graphAdj[current]) {
            if (distance[neighbor] === -1) {
                distance[neighbor] = distance[current] + 1;
                parent[neighbor] = current;
                queue.push(neighbor);
            }
        }
    }

    console.log(\`\\nDistances from source \${source}:\`);
    for (let i = 0; i < n; i++)
        console.log(\`  Node \${i}: \${distance[i]}\`);
}

const n = 6;
const graphAdj = Array.from({length: n}, () => []);
const addEdge = (u, v) => { graphAdj[u].push(v); graphAdj[v].push(u); };
addEdge(0,1); addEdge(0,2); addEdge(1,3); addEdge(1,4); addEdge(2,5);
bfs(graphAdj, 0, n);`,

  "c": `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define MAXN 100

int graph_adj[MAXN][MAXN], deg[MAXN];
int distance[MAXN], parent[MAXN];
int queue[MAXN];

void addEdge(int u, int v) {
    graph_adj[u][deg[u]++] = v;
    graph_adj[v][deg[v]++] = u;
}

void bfs(int source, int n) {
    memset(distance, -1, sizeof(distance));
    memset(parent, -1, sizeof(parent));
    int front = 0, back = 0;
    distance[source] = 0;
    queue[back++] = source;

    while (front < back) {
        int current = queue[front++];
        printf("Visiting: %d (dist=%d)\\n", current, distance[current]);
        for (int i = 0; i < deg[current]; i++) {
            int neighbor = graph_adj[current][i];
            if (distance[neighbor] == -1) {
                distance[neighbor] = distance[current] + 1;
                parent[neighbor] = current;
                queue[back++] = neighbor;
            }
        }
    }

    printf("\\nDistances from source %d:\\n", source);
    for (int i = 0; i < n; i++)
        printf("  Node %d: %d\\n", i, distance[i]);
}

int main() {
    int n = 6;
    memset(deg, 0, sizeof(deg));
    addEdge(0,1); addEdge(0,2); addEdge(1,3); addEdge(1,4); addEdge(2,5);
    bfs(0, n);
    return 0;
}`,

  "c#": `using System;
using System.Collections.Generic;

class Program {
    static void Bfs(List<int>[] graphAdj, int source, int n) {
        int[] distance = new int[n];
        int[] parent = new int[n];
        Array.Fill(distance, -1);
        Array.Fill(parent, -1);

        var queue = new Queue<int>();
        distance[source] = 0;
        queue.Enqueue(source);

        while (queue.Count > 0) {
            int current = queue.Dequeue();
            Console.WriteLine($"Visiting: {current} (dist={distance[current]})");

            foreach (int neighbor in graphAdj[current]) {
                if (distance[neighbor] == -1) {
                    distance[neighbor] = distance[current] + 1;
                    parent[neighbor] = current;
                    queue.Enqueue(neighbor);
                }
            }
        }

        Console.WriteLine($"\\nDistances from source {source}:");
        for (int i = 0; i < n; i++)
            Console.WriteLine($"  Node {i}: {distance[i]}");
    }

    static void Main() {
        int n = 6;
        var graphAdj = new List<int>[n];
        for (int i = 0; i < n; i++) graphAdj[i] = new List<int>();
        int[][] edges = {{0,1},{0,2},{1,3},{1,4},{2,5}};
        foreach (var e in edges) {
            graphAdj[e[0]].Add(e[1]);
            graphAdj[e[1]].Add(e[0]);
        }
        Bfs(graphAdj, 0, n);
    }
}`,

  "swift": `import Foundation

func bfs(graphAdj: [[Int]], source: Int, n: Int) {
    var distance = Array(repeating: -1, count: n)
    var parent = Array(repeating: -1, count: n)
    var queue = [Int]()

    distance[source] = 0
    queue.append(source)
    var front = 0

    while front < queue.count {
        let current = queue[front]; front += 1
        print("Visiting: \\(current) (dist=\\(distance[current]))")

        for neighbor in graphAdj[current] {
            if distance[neighbor] == -1 {
                distance[neighbor] = distance[current] + 1
                parent[neighbor] = current
                queue.append(neighbor)
            }
        }
    }

    print("\\nDistances from source \\(source):")
    for i in 0..<n { print("  Node \\(i): \\(distance[i])") }
}

var graphAdj = [[Int]](repeating: [], count: 6)
let edges = [(0,1),(0,2),(1,3),(1,4),(2,5)]
for (u, v) in edges {
    graphAdj[u].append(v); graphAdj[v].append(u)
}
bfs(graphAdj: graphAdj, source: 0, n: 6)`,

  "kotlin": `import java.util.LinkedList

fun bfs(graphAdj: Array<MutableList<Int>>, source: Int, n: Int) {
    val distance = IntArray(n) { -1 }
    val parent = IntArray(n) { -1 }
    val queue = LinkedList<Int>()

    distance[source] = 0
    queue.add(source)

    while (queue.isNotEmpty()) {
        val current = queue.poll()
        println("Visiting: $current (dist=\${distance[current]})")

        for (neighbor in graphAdj[current]) {
            if (distance[neighbor] == -1) {
                distance[neighbor] = distance[current] + 1
                parent[neighbor] = current
                queue.add(neighbor)
            }
        }
    }

    println("\\nDistances from source $source:")
    for (i in 0 until n) println("  Node $i: \${distance[i]}")
}

fun main() {
    val n = 6
    val graphAdj = Array(n) { mutableListOf<Int>() }
    val edges = listOf(0 to 1, 0 to 2, 1 to 3, 1 to 4, 2 to 5)
    for ((u, v) in edges) { graphAdj[u].add(v); graphAdj[v].add(u) }
    bfs(graphAdj, 0, n)
}`,

  "scala": `import scala.collection.mutable

object Main extends App {
    def bfs(graphAdj: Array[mutable.ListBuffer[Int]], source: Int, n: Int): Unit = {
        val distance = Array.fill(n)(-1)
        val parent = Array.fill(n)(-1)
        val queue = mutable.Queue[Int]()

        distance(source) = 0
        queue.enqueue(source)

        while (queue.nonEmpty) {
            val current = queue.dequeue()
            println(s"Visiting: $current (dist=\${distance(current)})")

            for (neighbor <- graphAdj(current)) {
                if (distance(neighbor) == -1) {
                    distance(neighbor) = distance(current) + 1
                    parent(neighbor) = current
                    queue.enqueue(neighbor)
                }
            }
        }

        println(s"\\nDistances from source $source:")
        for (i <- 0 until n) println(s"  Node $i: \${distance(i)}")
    }

    val n = 6
    val graphAdj = Array.fill(n)(mutable.ListBuffer[Int]())
    val edges = List((0,1),(0,2),(1,3),(1,4),(2,5))
    for ((u, v) <- edges) { graphAdj(u) += v; graphAdj(v) += u }
    bfs(graphAdj, 0, n)
}`,

  "go": `package main

import "fmt"

func bfs(graphAdj [][]int, source, n int) {
    distance := make([]int, n)
    parent := make([]int, n)
    for i := range distance { distance[i] = -1; parent[i] = -1 }

    queue := []int{source}
    distance[source] = 0

    for len(queue) > 0 {
        current := queue[0]; queue = queue[1:]
        fmt.Printf("Visiting: %d (dist=%d)\\n", current, distance[current])

        for _, neighbor := range graphAdj[current] {
            if distance[neighbor] == -1 {
                distance[neighbor] = distance[current] + 1
                parent[neighbor] = current
                queue = append(queue, neighbor)
            }
        }
    }

    fmt.Printf("\\nDistances from source %d:\\n", source)
    for i := 0; i < n; i++ {
        fmt.Printf("  Node %d: %d\\n", i, distance[i])
    }
}

func main() {
    n := 6
    graphAdj := make([][]int, n)
    addEdge := func(u, v int) {
        graphAdj[u] = append(graphAdj[u], v)
        graphAdj[v] = append(graphAdj[v], u)
    }
    addEdge(0,1); addEdge(0,2); addEdge(1,3); addEdge(1,4); addEdge(2,5)
    bfs(graphAdj, 0, n)
}`,

  "rust": `use std::collections::VecDeque;

fn bfs(graph_adj: &Vec<Vec<usize>>, source: usize, n: usize) {
    let mut distance = vec![-1i32; n];
    let mut parent = vec![-1i32; n];
    let mut queue = VecDeque::new();

    distance[source] = 0;
    queue.push_back(source);

    while let Some(current) = queue.pop_front() {
        println!("Visiting: {} (dist={})", current, distance[current]);

        for &neighbor in &graph_adj[current] {
            if distance[neighbor] == -1 {
                distance[neighbor] = distance[current] + 1;
                parent[neighbor] = current as i32;
                queue.push_back(neighbor);
            }
        }
    }

    println!("\\nDistances from source {}:", source);
    for i in 0..n {
        println!("  Node {}: {}", i, distance[i]);
    }
}

fn main() {
    let n = 6;
    let mut graph_adj = vec![vec![]; n];
    let edges = vec![(0,1),(0,2),(1,3),(1,4),(2,5)];
    for (u, v) in edges {
        graph_adj[u].push(v);
        graph_adj[v].push(u);
    }
    bfs(&graph_adj, 0, n);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       2. TOPOLOGICAL SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Topological Sort",
      href: "/algorithms/graphs/topological-sort",
      type: "Medium",

      about: [
        { tag: "h1", text: "Topological Sort" },
        { tag: "p", text: "Topological Sort produces a linear ordering of the vertices of a Directed Acyclic Graph (DAG) such that for every directed edge u → v, u appears before v in the ordering. It only makes sense for DAGs — a graph with a cycle has no valid topological order, since cyclic dependencies create a contradiction (A must come before B, but B must also come before A)." },
        { tag: "p", text: "Two standard approaches exist: Kahn's algorithm (BFS-based, repeatedly removing nodes with in-degree zero) and DFS-based (post-order traversal, reversed). Both run in O(V + E) and both naturally detect cycles as a side effect — Kahn's by failing to process all vertices, DFS-based by detecting a back-edge." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Build/task scheduling where some tasks depend on others completing first (build systems, package managers, course prerequisite ordering)",
          "Detecting circular dependencies (the algorithm fails or reports a cycle if one exists)",
          "Compiler/spreadsheet dependency resolution — determining the order to evaluate expressions",
          "As a preprocessing step for dynamic programming on DAGs (process nodes in topological order so all dependencies are already resolved)"
        ]},
        { tag: "note", variant: "warning", text: "A topological order is not necessarily unique — any graph with vertices that have no dependency relationship between them admits multiple valid orderings." }
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          { tag: "p", text: "Kahn's algorithm always processes every vertex once and every edge once while decrementing in-degrees, regardless of the DAG's specific shape — there's no early-exit shortcut." },
          { tag: "ul", items: [
            "Initial in-degree computation: scan all edges once — O(E)",
            "Each vertex is enqueued and dequeued exactly once when its in-degree hits zero: O(V)",
            "Each edge is examined exactly once to decrement a neighbor's in-degree: O(E)",
            "Total: O(V + E)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          { tag: "p", text: "Both Kahn's and DFS-based approaches perform a fixed, structurally-determined amount of work per vertex and edge — there's no value-dependent branching that changes the iteration count." },
          { tag: "ul", items: [
            "DFS-based: standard DFS traversal cost, O(V + E), plus O(V) to reverse the post-order result",
            "Kahn's: O(V + E) as above",
            "Both approaches are asymptotically identical regardless of graph shape, as long as it's a valid DAG"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          { tag: "p", text: "No DAG structure increases the cost beyond visiting every vertex and edge exactly once — even a graph that is 'almost' a total order (a single long chain) costs the same asymptotic O(V + E)." },
          { tag: "ul", items: [
            "Worst case matches best/average exactly: O(V + E)",
            "Cycle detection (when the graph is not actually a DAG) also completes in O(V + E) — Kahn's simply terminates with fewer than V vertices processed",
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "Kahn's algorithm needs an in-degree array and a queue, both sized to V; the DFS-based approach needs a visited set and a result stack, also both O(V)." },
          { tag: "ul", items: ["in-degree array: O(V)", "queue: up to O(V)", "result list: O(V)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage is fixed by the number of vertices, regardless of edge density or graph shape (the adjacency list itself is typically counted as O(V + E) input, not algorithm overhead)." },
          { tag: "ul", items: ["in-degree / visited tracking: O(V)", "output ordering: O(V)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          { tag: "p", text: "Even a graph where the entire vertex set is simultaneously 'ready' (in-degree zero) at the start keeps the queue bounded by O(V) — it can never exceed the total vertex count." },
          { tag: "ul", items: ["Maximum queue size: O(V)", "DFS recursion stack (DFS-based variant): up to O(V) in the worst case of a single long chain"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Kahn's algorithm (BFS-based):" },
        { tag: "code", language: "text", text:
`function topologicalSort(graph):
    inDegree ← map of vertex → 0, for all vertices
    for u in graph.vertices:
        for v in graph.adjacent(u):
            inDegree[v] ← inDegree[v] + 1

    queue ← all vertices with inDegree == 0
    result ← empty list

    while queue is not empty:
        u ← dequeue(queue)
        append u to result

        for v in graph.adjacent(u):
            inDegree[v] ← inDegree[v] − 1
            if inDegree[v] == 0:
                enqueue(queue, v)

    if length(result) != number of vertices:
        return CYCLE_DETECTED       // graph is not a DAG

    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Compute the in-degree (number of incoming edges) for every vertex by scanning all edges once.",
          "Initialise a queue with every vertex that has in-degree zero — these have no unresolved dependencies and can be processed first.",
          "Repeatedly dequeue a vertex, append it to the result ordering, and 'remove' it from the graph by decrementing the in-degree of each of its neighbors.",
          "Whenever a neighbor's in-degree drops to zero, all its dependencies have now been satisfied — enqueue it.",
          "If the final result contains all V vertices, it's a valid topological order. If fewer vertices were processed, the remaining vertices form a cycle (their in-degree never reaches zero because they depend on each other)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: a vertex is only enqueued once all of its prerequisite vertices (everything with an edge pointing to it) have already been added to the result. This directly enforces the topological-order requirement: every edge u → v has u processed (and removed from consideration) before v's in-degree can reach zero. If the graph has a cycle, every vertex in that cycle perpetually has at least one unresolved incoming edge from within the cycle, so none of them can ever reach in-degree zero — correctly signalling that no valid topological order exists." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

vector<int> topologicalSort(vector<vector<int>>& graph_adj, int n) {
    vector<int> inDegree(n, 0);
    for (int u = 0; u < n; u++)
        for (int v : graph_adj[u])
            inDegree[v]++;

    queue<int> q;
    for (int i = 0; i < n; i++)
        if (inDegree[i] == 0) q.push(i);

    vector<int> result;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        result.push_back(u);
        for (int v : graph_adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }

    if ((int)result.size() != n) {
        cout << "Cycle detected — not a DAG\\n";
        return {};
    }
    return result;
}

int main() {
    int n = 6;
    vector<vector<int>> graph_adj(n);
    graph_adj[5].push_back(2); graph_adj[5].push_back(0);
    graph_adj[4].push_back(0); graph_adj[4].push_back(1);
    graph_adj[2].push_back(3); graph_adj[3].push_back(1);

    vector<int> order = topologicalSort(graph_adj, n);
    cout << "Topological Order: ";
    for (int v : order) cout << v << " ";
    cout << endl;
    return 0;
}`,

  "python": `from collections import deque

def topological_sort(graph_adj, n):
    in_degree = [0] * n
    for u in range(n):
        for v in graph_adj[u]:
            in_degree[v] += 1

    queue = deque(i for i in range(n) if in_degree[i] == 0)
    result = []

    while queue:
        u = queue.popleft()
        result.append(u)
        for v in graph_adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    if len(result) != n:
        print("Cycle detected — not a DAG")
        return []
    return result

if __name__ == "__main__":
    n = 6
    graph_adj = [[] for _ in range(n)]
    graph_adj[5].extend([2, 0])
    graph_adj[4].extend([0, 1])
    graph_adj[2].append(3)
    graph_adj[3].append(1)

    order = topological_sort(graph_adj, n)
    print("Topological Order:", order)`,

  "java": `import java.util.*;

public class Main {
    static int[] topologicalSort(List<List<Integer>> graphAdj, int n) {
        int[] inDegree = new int[n];
        for (int u = 0; u < n; u++)
            for (int v : graphAdj.get(u)) inDegree[v]++;

        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < n; i++)
            if (inDegree[i] == 0) queue.add(i);

        int[] result = new int[n];
        int idx = 0;
        while (!queue.isEmpty()) {
            int u = queue.poll();
            result[idx++] = u;
            for (int v : graphAdj.get(u))
                if (--inDegree[v] == 0) queue.add(v);
        }

        if (idx != n) { System.out.println("Cycle detected"); return new int[]{}; }
        return result;
    }

    public static void main(String[] args) {
        int n = 6;
        List<List<Integer>> graphAdj = new ArrayList<>();
        for (int i = 0; i < n; i++) graphAdj.add(new ArrayList<>());
        graphAdj.get(5).addAll(Arrays.asList(2, 0));
        graphAdj.get(4).addAll(Arrays.asList(0, 1));
        graphAdj.get(2).add(3);
        graphAdj.get(3).add(1);

        int[] order = topologicalSort(graphAdj, n);
        System.out.print("Topological Order: ");
        for (int v : order) System.out.print(v + " ");
        System.out.println();
    }
}`,

  "js": `function topologicalSort(graphAdj, n) {
    const inDegree = new Array(n).fill(0);
    for (let u = 0; u < n; u++)
        for (const v of graphAdj[u]) inDegree[v]++;

    const queue = [];
    for (let i = 0; i < n; i++)
        if (inDegree[i] === 0) queue.push(i);

    const result = [];
    let front = 0;
    while (front < queue.length) {
        const u = queue[front++];
        result.push(u);
        for (const v of graphAdj[u])
            if (--inDegree[v] === 0) queue.push(v);
    }

    if (result.length !== n) { console.log("Cycle detected"); return []; }
    return result;
}

const n = 6;
const graphAdj = Array.from({length: n}, () => []);
graphAdj[5].push(2, 0); graphAdj[4].push(0, 1);
graphAdj[2].push(3); graphAdj[3].push(1);
console.log("Topological Order:", topologicalSort(graphAdj, n));`,

  "c": `#include <stdio.h>
#include <string.h>
#define MAXN 100

int graph_adj[MAXN][MAXN], deg[MAXN], inDegree[MAXN];
int queue[MAXN], result[MAXN];

void addEdge(int u, int v) { graph_adj[u][deg[u]++] = v; inDegree[v]++; }

int topologicalSort(int n) {
    int front = 0, back = 0, idx = 0;
    for (int i = 0; i < n; i++)
        if (inDegree[i] == 0) queue[back++] = i;

    while (front < back) {
        int u = queue[front++];
        result[idx++] = u;
        for (int i = 0; i < deg[u]; i++) {
            int v = graph_adj[u][i];
            if (--inDegree[v] == 0) queue[back++] = v;
        }
    }
    return idx == n;
}

int main() {
    int n = 6;
    memset(deg, 0, sizeof(deg));
    memset(inDegree, 0, sizeof(inDegree));
    addEdge(5,2); addEdge(5,0); addEdge(4,0);
    addEdge(4,1); addEdge(2,3); addEdge(3,1);

    if (topologicalSort(n)) {
        printf("Topological Order: ");
        for (int i = 0; i < n; i++) printf("%d ", result[i]);
        printf("\\n");
    } else printf("Cycle detected\\n");
    return 0;
}`,

  "c#": `using System;
using System.Collections.Generic;

class Program {
    static int[] TopologicalSort(List<int>[] graphAdj, int n) {
        int[] inDegree = new int[n];
        for (int u = 0; u < n; u++)
            foreach (int v in graphAdj[u]) inDegree[v]++;

        var queue = new Queue<int>();
        for (int i = 0; i < n; i++)
            if (inDegree[i] == 0) queue.Enqueue(i);

        var result = new List<int>();
        while (queue.Count > 0) {
            int u = queue.Dequeue();
            result.Add(u);
            foreach (int v in graphAdj[u])
                if (--inDegree[v] == 0) queue.Enqueue(v);
        }

        if (result.Count != n) { Console.WriteLine("Cycle detected"); return new int[]{}; }
        return result.ToArray();
    }

    static void Main() {
        int n = 6;
        var graphAdj = new List<int>[n];
        for (int i = 0; i < n; i++) graphAdj[i] = new List<int>();
        graphAdj[5].AddRange(new[]{2,0}); graphAdj[4].AddRange(new[]{0,1});
        graphAdj[2].Add(3); graphAdj[3].Add(1);

        int[] order = TopologicalSort(graphAdj, n);
        Console.WriteLine("Topological Order: " + string.Join(" ", order));
    }
}`,

  "swift": `func topologicalSort(graphAdj: [[Int]], n: Int) -> [Int] {
    var inDegree = Array(repeating: 0, count: n)
    for u in 0..<n { for v in graphAdj[u] { inDegree[v] += 1 } }

    var queue = (0..<n).filter { inDegree[$0] == 0 }
    var result = [Int]()
    var front = 0

    while front < queue.count {
        let u = queue[front]; front += 1
        result.append(u)
        for v in graphAdj[u] {
            inDegree[v] -= 1
            if inDegree[v] == 0 { queue.append(v) }
        }
    }

    if result.count != n { print("Cycle detected"); return [] }
    return result
}

var graphAdj = [[Int]](repeating: [], count: 6)
graphAdj[5] = [2, 0]; graphAdj[4] = [0, 1]
graphAdj[2] = [3]; graphAdj[3] = [1]
print("Topological Order:", topologicalSort(graphAdj: graphAdj, n: 6))`,

  "kotlin": `import java.util.LinkedList

fun topologicalSort(graphAdj: Array<MutableList<Int>>, n: Int): List<Int> {
    val inDegree = IntArray(n)
    for (u in 0 until n) for (v in graphAdj[u]) inDegree[v]++

    val queue = LinkedList<Int>()
    for (i in 0 until n) if (inDegree[i] == 0) queue.add(i)

    val result = mutableListOf<Int>()
    while (queue.isNotEmpty()) {
        val u = queue.poll()
        result.add(u)
        for (v in graphAdj[u])
            if (--inDegree[v] == 0) queue.add(v)
    }

    if (result.size != n) { println("Cycle detected"); return emptyList() }
    return result
}

fun main() {
    val n = 6
    val graphAdj = Array(n) { mutableListOf<Int>() }
    graphAdj[5].addAll(listOf(2, 0)); graphAdj[4].addAll(listOf(0, 1))
    graphAdj[2].add(3); graphAdj[3].add(1)
    println("Topological Order: \${topologicalSort(graphAdj, n)}")
}`,

  "scala": `import scala.collection.mutable

object Main extends App {
    def topologicalSort(graphAdj: Array[mutable.ListBuffer[Int]], n: Int): List[Int] = {
        val inDegree = Array.fill(n)(0)
        for (u <- 0 until n; v <- graphAdj(u)) inDegree(v) += 1

        val queue = mutable.Queue[Int]()
        for (i <- 0 until n if inDegree(i) == 0) queue.enqueue(i)

        val result = mutable.ListBuffer[Int]()
        while (queue.nonEmpty) {
            val u = queue.dequeue()
            result += u
            for (v <- graphAdj(u)) {
                inDegree(v) -= 1
                if (inDegree(v) == 0) queue.enqueue(v)
            }
        }

        if (result.length != n) { println("Cycle detected"); return List() }
        result.toList
    }

    val n = 6
    val graphAdj = Array.fill(n)(mutable.ListBuffer[Int]())
    graphAdj(5) ++= List(2, 0); graphAdj(4) ++= List(0, 1)
    graphAdj(2) += 3; graphAdj(3) += 1
    println(s"Topological Order: \${topologicalSort(graphAdj, n)}")
}`,

  "go": `package main

import "fmt"

func topologicalSort(graphAdj [][]int, n int) []int {
    inDegree := make([]int, n)
    for u := 0; u < n; u++ {
        for _, v := range graphAdj[u] { inDegree[v]++ }
    }

    queue := []int{}
    for i := 0; i < n; i++ {
        if inDegree[i] == 0 { queue = append(queue, i) }
    }

    result := []int{}
    for len(queue) > 0 {
        u := queue[0]; queue = queue[1:]
        result = append(result, u)
        for _, v := range graphAdj[u] {
            inDegree[v]--
            if inDegree[v] == 0 { queue = append(queue, v) }
        }
    }

    if len(result) != n { fmt.Println("Cycle detected"); return nil }
    return result
}

func main() {
    n := 6
    graphAdj := make([][]int, n)
    graphAdj[5] = []int{2, 0}; graphAdj[4] = []int{0, 1}
    graphAdj[2] = []int{3}; graphAdj[3] = []int{1}
    fmt.Println("Topological Order:", topologicalSort(graphAdj, n))
}`,

  "rust": `use std::collections::VecDeque;

fn topological_sort(graph_adj: &Vec<Vec<usize>>, n: usize) -> Option<Vec<usize>> {
    let mut in_degree = vec![0usize; n];
    for u in 0..n {
        for &v in &graph_adj[u] { in_degree[v] += 1; }
    }

    let mut queue = VecDeque::new();
    for i in 0..n { if in_degree[i] == 0 { queue.push_back(i); } }

    let mut result = Vec::new();
    while let Some(u) = queue.pop_front() {
        result.push(u);
        for &v in &graph_adj[u] {
            in_degree[v] -= 1;
            if in_degree[v] == 0 { queue.push_back(v); }
        }
    }

    if result.len() != n { println!("Cycle detected"); return None; }
    Some(result)
}

fn main() {
    let n = 6;
    let mut graph_adj = vec![vec![]; n];
    graph_adj[5] = vec![2, 0]; graph_adj[4] = vec![0, 1];
    graph_adj[2] = vec![3]; graph_adj[3] = vec![1];
    if let Some(order) = topological_sort(&graph_adj, n) {
        println!("Topological Order: {:?}", order);
    }
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       3. DIJKSTRA'S ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Dijkstra's Algorithm",
      href: "/algorithms/graphs/dijkstra",
      type: "Medium",

      about: [
        { tag: "h1", text: "Dijkstra's Algorithm" },
        { tag: "p", text: "Dijkstra's Algorithm, devised by Edsger Dijkstra in 1956, finds the shortest path from a single source vertex to every other vertex in a weighted graph with non-negative edge weights. It greedily expands outward from the source, always finalising the closest not-yet-finalised vertex next, using a priority queue (min-heap) to efficiently find that closest vertex at every step." },
        { tag: "p", text: "It can be thought of as a weighted generalisation of BFS: where BFS uses a plain queue and treats every edge as cost 1, Dijkstra uses a priority queue ordered by cumulative path cost, allowing it to correctly handle edges of different weights while still guaranteeing the first-finalised distance for each vertex is its true shortest distance." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Single-source shortest path on a weighted graph with all non-negative edge weights",
          "Routing/navigation problems (e.g. road networks where edge weight = distance or time)",
          "Network routing protocols (e.g. OSPF uses a Dijkstra-based approach)",
          "Any problem reducible to 'minimum cost to reach state X from state Y' where costs are non-negative"
        ]},
        { tag: "note", variant: "warning", text: "Dijkstra produces silently incorrect results in the presence of negative edge weights — it does not raise an error, it just returns a wrong shortest-path value, since its greedy finalisation assumes distances only ever increase." }
      ],

      timeComplexityCalculation: {
        notation: "O((V + E) log V)",
        best: [
          { tag: "h2", text: "Best Case — O((V + E) log V)" },
          { tag: "p", text: "Using a binary heap priority queue, every vertex extraction and every edge relaxation costs O(log V), and the algorithm always processes every reachable vertex and edge at least once — there's no shortcut even for the most favourable weight distribution." },
          { tag: "ul", items: [
            "Each of the V vertices is extracted from the priority queue exactly once: O(V log V)",
            "Each of the E edges can trigger at most one decrease-key/insert operation: O(E log V)",
            "Combined: O((V + E) log V)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O((V + E) log V)" },
          { tag: "p", text: "The binary-heap-based implementation performs the same structural sequence of extract-min and insert/decrease-key operations regardless of the specific edge weight values, only their relative ordering affects which vertex gets extracted when, not the asymptotic operation count." },
          { tag: "ul", items: [
            "V extract-min operations: O(V log V)",
            "Up to E insert/decrease-key operations (one potential relaxation per edge): O(E log V)",
            "Total: O((V + E) log V), the standard binary-heap bound"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O((V + E) log V)" },
          { tag: "p", text: "No edge-weight configuration increases Dijkstra's asymptotic cost beyond the standard bound — even a fully dense graph where every edge triggers a relaxation still fits within this envelope." },
          { tag: "ul", items: [
            "Worst case matches best/average: O((V + E) log V) with a binary heap",
            "Using a Fibonacci heap instead, this improves to O(E + V log V), since decrease-key becomes O(1) amortised — relevant for very dense graphs",
            "For a dense graph (E ≈ V²), an adjacency-matrix-based O(V²) implementation (without a heap) can actually outperform the heap-based version, since the heap overhead isn't worth it when nearly every edge exists"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "Dijkstra maintains a distance array, a visited/finalised set, and a priority queue, all sized proportional to the number of vertices." },
          { tag: "ul", items: ["distance array: O(V)", "priority queue: up to O(V) entries", "visited/finalised set: O(V)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage is fixed by vertex count, since the distance and visited tracking structures must accommodate every vertex regardless of how the priority queue churns through insertions." },
          { tag: "ul", items: ["distance[], visited[]: O(V) each", "priority queue contents: bounded by O(V) distinct vertices (with decrease-key) or O(E) lazy entries (with lazy deletion)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V + E)" },
          { tag: "p", text: "Implementations using 'lazy deletion' (inserting a new priority queue entry on every relaxation instead of updating in place) can grow the queue to O(E) entries in the worst case, though logical vertex-tracking arrays remain O(V)." },
          { tag: "ul", items: [
            "distance[], visited[]: O(V)",
            "Lazy-deletion priority queue: up to O(E) stale entries in the worst case",
            "True decrease-key-based implementations keep the queue strictly at O(V), trading implementation complexity for tighter space"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function dijkstra(graph_adj, source):
    arr_dist ← array of size V, set to infinity
    arr_visit ← array of size V, set to 0
    arr_dist[source] ← 0
    pq ← min-priority-queue, ordered by distance
    pq.insert(source, 0)

    while pq is not empty:
        (d, u) ← pq.extractMin()
        current ← u                    // isolates the active node

        if d > arr_dist[current]:
            continue                   // stale entry, skip

        arr_visit[current] ← 1         // mark as finalised

        for (weight, v) in graph_adj[current]:
            if arr_dist[current] + weight < arr_dist[v]:
                arr_dist[v] ← arr_dist[current] + weight
                pq.insert(v, arr_dist[v])

    return arr_dist` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise every vertex's distance (`arr_dist`) to infinity except the source, which is 0.",
          "Use a priority queue to always extract the not-yet-finalised vertex with the smallest known distance.",
          "Set the extracted vertex to `current`. Once a vertex is finalised, its distance is guaranteed correct and will never be updated again — mark it in `arr_visit`.",
          "For each neighbor of `current`, check if reaching it through the current vertex gives a shorter path than previously known — this is called 'relaxing' the edge.",
          "If a shorter path is found, update the neighbor's distance and push the new, better distance onto the priority queue.",
          "Repeat until the priority queue is empty — every reachable vertex has been finalised with its true shortest distance."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The key invariant relies on non-negative weights: when a vertex `current` is extracted from the priority queue, its current distance value is provably its true shortest distance from the source. This holds because every vertex still in the queue has a distance ≥ `current`'s distance (by the min-heap property), and since all edge weights are non-negative, any path through a not-yet-finalised vertex could only be longer or equal — never shorter — than the direct path already found. This greedy 'finalise the closest vertex first' strategy therefore never needs to revisit or correct an already-finalised vertex, which is exactly what breaks down if negative weights are allowed." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <queue>
#include <climits>
using namespace std;

typedef pair<int,int> pii;

vector<int> dijkstra(vector<vector<pii>>& graph_adj, int source, int n) {
    vector<int> arr_dist(n, INT_MAX);
    vector<int> arr_visit(n, 0);
    priority_queue<pii, vector<pii>, greater<pii>> pq;

    arr_dist[source] = 0;
    pq.push({0, source});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        int current = u; // Visualizer active node highlight

        if (d > arr_dist[current]) continue;
        arr_visit[current] = 1; // Visualizer visit pulse

        for (auto [weight, v] : graph_adj[current]) {
            if (arr_dist[current] + weight < arr_dist[v]) {
                arr_dist[v] = arr_dist[current] + weight;
                pq.push({arr_dist[v], v});
            }
        }
    }
    return arr_dist;
}

int main() {
    int n = 5;
    vector<vector<pii>> graph_adj(n);
    auto addEdge = [&](int u, int v, int w) {
        graph_adj[u].push_back({w, v});
        graph_adj[v].push_back({w, u});
    };
    addEdge(0,1,10); addEdge(0,2,3); addEdge(1,2,1);
    addEdge(1,3,2);  addEdge(2,3,8); addEdge(2,4,2);
    addEdge(3,4,7);

    vector<int> arr_dist = dijkstra(graph_adj, 0, n);
    cout << "Shortest distances from node 0:\\n";
    for (int i = 0; i < n; i++)
        cout << "  Node " << i << ": " << arr_dist[i] << "\\n";
    return 0;
}`,

  "python": `import heapq

def dijkstra(graph_adj, source, n):
    arr_dist = [float('inf')] * n
    arr_visit = [0] * n
    arr_dist[source] = 0
    pq = [(0, source)]

    while pq:
        d, u = heapq.heappop(pq)
        current = u

        if d > arr_dist[current]:
            continue
            
        arr_visit[current] = 1

        for weight, v in graph_adj[current]:
            if arr_dist[current] + weight < arr_dist[v]:
                arr_dist[v] = arr_dist[current] + weight
                heapq.heappush(pq, (arr_dist[v], v))

    return arr_dist

if __name__ == "__main__":
    n = 5
    graph_adj = [[] for _ in range(n)]
    def add_edge(u, v, w):
        graph_adj[u].append((w, v))
        graph_adj[v].append((w, u))
    add_edge(0,1,10); add_edge(0,2,3); add_edge(1,2,1)
    add_edge(1,3,2);  add_edge(2,3,8); add_edge(2,4,2)
    add_edge(3,4,7)

    arr_dist = dijkstra(graph_adj, 0, n)
    print("Shortest distances from node 0:")
    for i, d in enumerate(arr_dist):
        print(f"  Node {i}: {d}")`,

  "java": `import java.util.*;

public class Main {
    static int[] dijkstra(List<int[]>[] graphAdj, int source, int n) {
        int[] arr_dist = new int[n];
        int[] arr_visit = new int[n];
        Arrays.fill(arr_dist, Integer.MAX_VALUE);
        arr_dist[source] = 0;

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        pq.offer(new int[]{0, source});

        while (!pq.isEmpty()) {
            int[] nodeData = pq.poll();
            int d = nodeData[0];
            int current = nodeData[1];
            
            if (d > arr_dist[current]) continue;
            arr_visit[current] = 1;

            for (int[] edge : graphAdj[current]) {
                int v = edge[0], w = edge[1];
                if (arr_dist[current] + w < arr_dist[v]) {
                    arr_dist[v] = arr_dist[current] + w;
                    pq.offer(new int[]{arr_dist[v], v});
                }
            }
        }
        return arr_dist;
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        int n = 5;
        List<int[]>[] graphAdj = new ArrayList[n];
        for (int i = 0; i < n; i++) graphAdj[i] = new ArrayList<>();
        int[][] edges = {{0,1,10},{0,2,3},{1,2,1},{1,3,2},{2,3,8},{2,4,2},{3,4,7}};
        for (int[] e : edges) {
            graphAdj[e[0]].add(new int[]{e[1], e[2]});
            graphAdj[e[1]].add(new int[]{e[0], e[2]});
        }

        int[] arr_dist = dijkstra(graphAdj, 0, n);
        System.out.println("Shortest distances from node 0:");
        for (int i = 0; i < n; i++)
            System.out.println("  Node " + i + ": " + arr_dist[i]);
    }
}`,

  "js": `function dijkstra(graph_adj, source, n) {
    const arr_dist = new Array(n).fill(Infinity);
    const arr_visit = new Array(n).fill(0);
    arr_dist[source] = 0;
    const pq = [[0, source]];

    while (pq.length > 0) {
        pq.sort((a, b) => a[0] - b[0]);
        const [d, u] = pq.shift();
        const current = u;

        if (d > arr_dist[current]) continue;
        arr_visit[current] = 1;

        for (const [v, w] of graph_adj[current]) {
            if (arr_dist[current] + w < arr_dist[v]) {
                arr_dist[v] = arr_dist[current] + w;
                pq.push([arr_dist[v], v]);
            }
        }
    }
    return arr_dist;
}

const n = 5;
const graph_adj = Array.from({length: n}, () => []);
const addEdge = (u, v, w) => { graph_adj[u].push([v,w]); graph_adj[v].push([u,w]); };
addEdge(0,1,10); addEdge(0,2,3); addEdge(1,2,1);
addEdge(1,3,2);  addEdge(2,3,8); addEdge(2,4,2); addEdge(3,4,7);

const arr_dist = dijkstra(graph_adj, 0, n);
console.log("Shortest distances from node 0:");
arr_dist.forEach((d, i) => console.log(\`  Node \${i}: \${d}\`));`,

  "c": `#include <stdio.h>
#include <limits.h>
#include <string.h>
#define MAXN 100
#define INF INT_MAX

int graph_adj[MAXN][MAXN], weight[MAXN][MAXN], deg[MAXN];
int arr_dist[MAXN];
int arr_visit[MAXN];

void addEdge(int u, int v, int w) {
    graph_adj[u][deg[u]] = v; weight[u][deg[u]++] = w;
    graph_adj[v][deg[v]] = u; weight[v][deg[v]++] = w;
}

void dijkstra(int source, int n) {
    for (int i = 0; i < n; i++) { arr_dist[i] = INF; arr_visit[i] = 0; }
    arr_dist[source] = 0;

    for (int iter = 0; iter < n; iter++) {
        int u = -1;
        for (int i = 0; i < n; i++) {
            if (!arr_visit[i] && (u == -1 || arr_dist[i] < arr_dist[u])) u = i;
        }
        
        int current = u;
        if (arr_dist[current] == INF) break;
        arr_visit[current] = 1;

        for (int i = 0; i < deg[current]; i++) {
            int v = graph_adj[current][i], w = weight[current][i];
            if (arr_dist[current] + w < arr_dist[v]) {
                arr_dist[v] = arr_dist[current] + w;
            }
        }
    }
}

int main() {
    int n = 5;
    memset(deg, 0, sizeof(deg));
    addEdge(0,1,10); addEdge(0,2,3); addEdge(1,2,1);
    addEdge(1,3,2);  addEdge(2,3,8); addEdge(2,4,2); addEdge(3,4,7);
    dijkstra(0, n);
    printf("Shortest distances from node 0:\\n");
    for (int i = 0; i < n; i++)
        printf("  Node %d: %d\\n", i, arr_dist[i]);
    return 0;
}`,

  "c#": `using System;
using System.Collections.Generic;

class Program {
    static int[] Dijkstra(List<(int v, int w)>[] graph_adj, int source, int n) {
        int[] arr_dist = new int[n];
        int[] arr_visit = new int[n];
        Array.Fill(arr_dist, int.MaxValue);
        arr_dist[source] = 0;

        var pq = new SortedSet<(int d, int u)>(Comparer<(int,int)>.Create((a,b) =>
            a.d != b.d ? a.d.CompareTo(b.d) : a.u.CompareTo(b.u)));
        pq.Add((0, source));

        while (pq.Count > 0) {
            var (d, u) = pq.Min; pq.Remove(pq.Min);
            int current = u;

            if (d > arr_dist[current]) continue;
            arr_visit[current] = 1;

            foreach (var (v, w) in graph_adj[current]) {
                if (arr_dist[current] + w < arr_dist[v]) {
                    pq.Remove((arr_dist[v], v));
                    arr_dist[v] = arr_dist[current] + w;
                    pq.Add((arr_dist[v], v));
                }
            }
        }
        return arr_dist;
    }

    static void Main() {
        int n = 5;
        var graph_adj = new List<(int,int)>[n];
        for (int i = 0; i < n; i++) graph_adj[i] = new List<(int,int)>();
        int[][] edges = {{0,1,10},{0,2,3},{1,2,1},{1,3,2},{2,3,8},{2,4,2},{3,4,7}};
        foreach (var e in edges) {
            graph_adj[e[0]].Add((e[1], e[2]));
            graph_adj[e[1]].Add((e[0], e[2]));
        }

        int[] arr_dist = Dijkstra(graph_adj, 0, n);
        Console.WriteLine("Shortest distances from node 0:");
        for (int i = 0; i < n; i++)
            Console.WriteLine($"  Node {i}: {arr_dist[i]}");
    }
}`,

  "swift": `func dijkstra(graph_adj: [[(Int, Int)]], source: Int, n: Int) -> [Int] {
    var arr_dist = Array(repeating: Int.max, count: n)
    var arr_visit = Array(repeating: 0, count: n)
    arr_dist[source] = 0
    var pq: [(Int, Int)] = [(0, source)]

    while !pq.isEmpty {
        pq.sort { $0.0 < $1.0 }
        let (d, u) = pq.removeFirst()
        let current = u

        if d > arr_dist[current] { continue }
        arr_visit[current] = 1

        for (v, w) in graph_adj[current] {
            if arr_dist[current] + w < arr_dist[v] {
                arr_dist[v] = arr_dist[current] + w
                pq.append((arr_dist[v], v))
            }
        }
    }
    return arr_dist
}

var graph_adj = [[(Int, Int)]](repeating: [], count: 5)
let edges = [(0,1,10),(0,2,3),(1,2,1),(1,3,2),(2,3,8),(2,4,2),(3,4,7)]
for (u, v, w) in edges {
    graph_adj[u].append((v, w)); graph_adj[v].append((u, w))
}
let arr_dist = dijkstra(graph_adj: graph_adj, source: 0, n: 5)
print("Shortest distances from node 0:")
for (i, d) in arr_dist.enumerated() { print("  Node \\(i): \\(d)") }`,

  "kotlin": `import java.util.PriorityQueue

fun dijkstra(graph_adj: Array<MutableList<Pair<Int,Int>>>, source: Int, n: Int): IntArray {
    val arr_dist = IntArray(n) { Int.MAX_VALUE }
    val arr_visit = IntArray(n) { 0 }
    arr_dist[source] = 0
    val pq = PriorityQueue<Pair<Int,Int>>(compareBy { it.first })
    pq.add(0 to source)

    while (pq.isNotEmpty()) {
        val (d, u) = pq.poll()
        val current = u

        if (d > arr_dist[current]) continue
        arr_visit[current] = 1

        for ((v, w) in graph_adj[current]) {
            if (arr_dist[current] + w < arr_dist[v]) {
                arr_dist[v] = arr_dist[current] + w
                pq.add(arr_dist[v] to v)
            }
        }
    }
    return arr_dist
}

fun main() {
    val n = 5
    val graph_adj = Array(n) { mutableListOf<Pair<Int,Int>>() }
    val edges = listOf(0 to Pair(1,10), 0 to Pair(2,3), 1 to Pair(2,1),
                       1 to Pair(3,2), 2 to Pair(3,8), 2 to Pair(4,2), 3 to Pair(4,7))
    for ((u, vw) in edges) {
        graph_adj[u].add(vw); graph_adj[vw.first].add(u to vw.second)
    }

    val arr_dist = dijkstra(graph_adj, 0, n)
    println("Shortest distances from node 0:")
    arr_dist.forEachIndexed { i, d -> println("  Node $i: $d") }
}`,

  "scala": `import scala.collection.mutable

object Main extends App {
    def dijkstra(graph_adj: Array[mutable.ListBuffer[(Int,Int)]], source: Int, n: Int): Array[Int] = {
        val arr_dist = Array.fill(n)(Int.MaxValue)
        val arr_visit = Array.fill(n)(0)
        arr_dist(source) = 0
        val pq = mutable.PriorityQueue[(Int,Int)]()(Ordering.by(-_._1))
        pq.enqueue((0, source))

        while (pq.nonEmpty) {
            val (d, u) = pq.dequeue()
            val current = u

            if (d <= arr_dist(current)) {
                arr_visit(current) = 1
                for ((v, w) <- graph_adj(current)) {
                    if (arr_dist(current) + w < arr_dist(v)) {
                        arr_dist(v) = arr_dist(current) + w
                        pq.enqueue((arr_dist(v), v))
                    }
                }
            }
        }
        arr_dist
    }

    val n = 5
    val graph_adj = Array.fill(n)(mutable.ListBuffer[(Int,Int)]())
    val edges = List((0,1,10),(0,2,3),(1,2,1),(1,3,2),(2,3,8),(2,4,2),(3,4,7))
    for ((u, v, w) <- edges) { graph_adj(u) += ((v,w)); graph_adj(v) += ((u,w)) }

    val arr_dist = dijkstra(graph_adj, 0, n)
    println("Shortest distances from node 0:")
    arr_dist.zipWithIndex.foreach { case (d, i) => println(s"  Node $i: $d") }
}`,

  "go": `package main

import (
    "container/heap"
    "fmt"
    "math"
)

type Item struct { dist, node int }
type PQ []Item
func (pq PQ) Len() int            { return len(pq) }
func (pq PQ) Less(i, j int) bool  { return pq[i].dist < pq[j].dist }
func (pq PQ) Swap(i, j int)       { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PQ) Push(x interface{}) { *pq = append(*pq, x.(Item)) }
func (pq *PQ) Pop() interface{}   { old := *pq; n := len(old); x := old[n-1]; *pq = old[:n-1]; return x }

func dijkstra(graph_adj [][][2]int, source, n int) []int {
    arr_dist := make([]int, n)
    arr_visit := make([]int, n)
    for i := range arr_dist { arr_dist[i] = math.MaxInt32 }
    arr_dist[source] = 0

    pq := &PQ{{0, source}}
    heap.Init(pq)

    for pq.Len() > 0 {
        curr := heap.Pop(pq).(Item)
        d, u := curr.dist, curr.node
        current := u

        if d > arr_dist[current] { continue }
        arr_visit[current] = 1

        for _, edge := range graph_adj[current] {
            v, w := edge[0], edge[1]
            if arr_dist[current]+w < arr_dist[v] {
                arr_dist[v] = arr_dist[current] + w
                heap.Push(pq, Item{arr_dist[v], v})
            }
        }
    }
    return arr_dist
}

func main() {
    n := 5
    graph_adj := make([][][2]int, n)
    addEdge := func(u, v, w int) {
        graph_adj[u] = append(graph_adj[u], [2]int{v, w})
        graph_adj[v] = append(graph_adj[v], [2]int{u, w})
    }
    addEdge(0,1,10); addEdge(0,2,3); addEdge(1,2,1)
    addEdge(1,3,2);  addEdge(2,3,8); addEdge(2,4,2); addEdge(3,4,7)

    arr_dist := dijkstra(graph_adj, 0, n)
    fmt.Println("Shortest distances from node 0:")
    for i, d := range arr_dist { fmt.Printf("  Node %d: %d\\n", i, d) }
}`,

  "rust": `use std::collections::BinaryHeap;
use std::cmp::Reverse;

fn dijkstra(graph_adj: &Vec<Vec<(usize, i32)>>, source: usize, n: usize) -> Vec<i32> {
    let mut arr_dist = vec![i32::MAX; n];
    let mut arr_visit = vec![0; n];
    arr_dist[source] = 0;
    let mut pq = BinaryHeap::new();
    pq.push(Reverse((0i32, source)));

    while let Some(Reverse((d, u))) = pq.pop() {
        let current = u;
        
        if d > arr_dist[current] { continue; }
        arr_visit[current] = 1;

        for &(v, w) in &graph_adj[current] {
            if arr_dist[current] + w < arr_dist[v] {
                arr_dist[v] = arr_dist[current] + w;
                pq.push(Reverse((arr_dist[v], v)));
            }
        }
    }
    arr_dist
}

fn main() {
    let n = 5;
    let mut graph_adj = vec![vec![]; n];
    let edges = vec![(0,1,10),(0,2,3),(1,2,1),(1,3,2),(2,3,8),(2,4,2),(3,4,7)];
    for (u, v, w) in edges {
        graph_adj[u].push((v, w));
        graph_adj[v].push((u, w));
    }

    let arr_dist = dijkstra(&graph_adj, 0, n);
    println!("Shortest distances from node 0:");
    for (i, d) in arr_dist.iter().enumerate() {
        println!("  Node {}: {}", i, d);
    }
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       4. BELLMAN-FORD ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Bellman-Ford Algorithm",
      href: "/algorithms/graphs/bellman-ford",
      type: "Hard",

      about: [
        { tag: "h1", text: "Bellman-Ford Algorithm" },
        { tag: "p", text: "Bellman-Ford, independently developed by Richard Bellman and Lester Ford in the 1950s, finds the shortest path from a single source to all other vertices, and unlike Dijkstra's, it correctly handles negative edge weights. It works by relaxing every edge in the graph, repeated V − 1 times — a brute-force but provably sufficient strategy for propagating correct shortest distances through the graph." },
        { tag: "p", text: "Its second crucial capability is negative cycle detection: after the standard V − 1 rounds of relaxation, a single additional round is run — if any edge can still be relaxed (i.e. distance further decreases), the graph contains a negative-weight cycle reachable from the source, meaning no shortest path is well-defined (you could loop the cycle forever to decrease the path cost indefinitely)." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The graph may contain negative edge weights (e.g. financial models with costs and gains, or arbitrage detection in currency exchange graphs)",
          "You need to detect whether a negative-weight cycle exists",
          "Distributed routing protocols where path computation must tolerate cost decreases (the basis of the original distance-vector routing protocols)",
          "When Dijkstra's non-negative-weight assumption can't be guaranteed for the problem domain"
        ]},
        { tag: "note", variant: "tip", text: "Bellman-Ford's V−1-round relaxation is exactly the number of edges in the longest possible simple shortest path (a path visits at most V vertices, hence at most V−1 edges) — that's why exactly V−1 rounds always suffice when no negative cycle exists." }
      ],

      timeComplexityCalculation: {
        notation: "O(VE)",
        best: [
          { tag: "h2", text: "Best Case — O(VE)" },
          { tag: "p", text: "The standard implementation always performs the full V − 1 rounds of relaxing every edge, regardless of how quickly distances actually converge — there's no structural early exit in the basic version, though an optimised variant can detect early convergence." },
          { tag: "ul", items: [
            "V − 1 rounds, each examining all E edges: (V−1) × E = O(VE)",
            "An early-exit optimisation (stop if a full round makes no changes) can reduce this in practice, but the worst-case asymptotic bound remains O(VE)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(VE)" },
          { tag: "p", text: "Every round performs the same fixed amount of work — examining every edge once — regardless of the specific weight values or graph topology, as long as the round count (V−1) is fixed." },
          { tag: "ul", items: [
            "(V − 1) rounds × E edge examinations per round = O(VE)",
            "Each edge relaxation is O(1) — one addition and one comparison",
            "No input distribution changes this structural bound"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(VE)" },
          { tag: "p", text: "The worst case matches the average exactly — there's no graph structure that increases the cost beyond the fixed (V−1) × E relaxation rounds, plus one additional round for negative-cycle detection." },
          { tag: "ul", items: [
            "(V − 1) relaxation rounds + 1 detection round, each O(E): O(VE)",
            "For a dense graph (E ≈ V²), this becomes O(V³), notably worse than Dijkstra's O((V+E) log V) — the price paid for tolerating negative weights"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "Only a distance array (and optionally a predecessor array for path reconstruction) is needed, both sized to the number of vertices." },
          { tag: "ul", items: ["distance array: O(V)", "predecessor array (optional): O(V)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage is fixed by vertex count alone — there's no auxiliary structure that grows with edge count or specific weight values." },
          { tag: "ul", items: ["No priority queue or heap needed, unlike Dijkstra — just two flat arrays of size V"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          { tag: "p", text: "No graph configuration increases memory usage beyond the fixed distance and predecessor arrays — even maximal edge density doesn't change this." },
          { tag: "ul", items: ["distance[], predecessor[]: O(V) each, regardless of E", "The edge list itself (input, not auxiliary) is O(E)"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function bellmanFord(graph, source):
    distance ← map of vertex → infinity, for all vertices
    distance[source] ← 0

    // Relax all edges V − 1 times
    for i from 1 to numVertices − 1:
        for (u, v, weight) in graph.edges:
            if distance[u] + weight < distance[v]:
                distance[v] ← distance[u] + weight

    // One more pass to detect negative cycles
    for (u, v, weight) in graph.edges:
        if distance[u] + weight < distance[v]:
            return NEGATIVE_CYCLE_DETECTED

    return distance` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise every vertex's distance to infinity except the source, which starts at 0.",
          "Repeat exactly V − 1 times: for every edge (u, v) with weight w, check if going through u gives a shorter path to v than currently known, and update if so. This is 'relaxation'.",
          "After V − 1 full rounds, every shortest path (which can have at most V − 1 edges, since a simple path visits at most V vertices) has been fully propagated, assuming no negative cycle exists.",
          "Run one final round: if any edge can still be relaxed, that means there's a path that keeps getting shorter even after V − 1 rounds — which is only possible if a negative-weight cycle is reachable from the source.",
          "If no further relaxation is possible, the distance array holds the correct shortest path to every vertex."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Inductive claim: after k rounds of relaxing all edges, distance[v] is correct for every vertex v whose true shortest path from the source uses at most k edges. The base case (k=0) holds trivially (only the source, at distance 0, has a 0-edge path). The inductive step holds because if the true shortest path to v uses exactly k edges and ends with edge (u, v), then by the inductive hypothesis distance[u] is already correct after k−1 rounds, so round k's relaxation of edge (u,v) correctly sets distance[v]. Since any simple shortest path has at most V−1 edges, V−1 rounds guarantee correctness for all vertices — and if a valid relaxation is still possible after that, the only explanation is a negative cycle, since no simple shortest path can have more than V−1 edges." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <climits>
using namespace std;

struct Edge { int u, v, w; };

vector<int> bellmanFord(int n, vector<Edge>& graph_edges, int source) {
    vector<int> dist(n, INT_MAX);
    dist[source] = 0;

    for (int i = 1; i < n; i++) {
        for (auto& [u, v, w] : graph_edges) {
            if (dist[u] != INT_MAX && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;
        }
    }

    for (auto& [u, v, w] : graph_edges) {
        if (dist[u] != INT_MAX && dist[u] + w < dist[v]) {
            cout << "Negative cycle detected!\\n";
            return {};
        }
    }
    return dist;
}

int main() {
    int n = 5;
    vector<Edge> graph_edges = {
        {0,1,-1},{0,2,4},{1,2,3},{1,3,2},{1,4,2},{3,2,5},{3,1,1},{4,3,-3}
    };

    vector<int> dist = bellmanFord(n, graph_edges, 0);
    if (!dist.empty()) {
        cout << "Shortest distances from node 0:\\n";
        for (int i = 0; i < n; i++)
            cout << "  Node " << i << ": " << dist[i] << "\\n";
    }
    return 0;
}`,

  "python": `def bellman_ford(n, graph_edges, source):
    dist = [float('inf')] * n
    dist[source] = 0

    for _ in range(n - 1):
        for u, v, w in graph_edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w

    for u, v, w in graph_edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            print("Negative cycle detected!")
            return None

    return dist

if __name__ == "__main__":
    n = 5
    graph_edges = [(0,1,-1),(0,2,4),(1,2,3),(1,3,2),(1,4,2),(3,2,5),(3,1,1),(4,3,-3)]
    dist = bellman_ford(n, graph_edges, 0)
    if dist:
        print("Shortest distances from node 0:")
        for i, d in enumerate(dist):
            print(f"  Node {i}: {d}")`,

  "java": `import java.util.*;

public class Main {
    static int[] bellmanFord(int n, int[][] graphEdges, int source) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[source] = 0;

        for (int i = 1; i < n; i++) {
            for (int[] e : graphEdges) {
                int u = e[0], v = e[1], w = e[2];
                if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v])
                    dist[v] = dist[u] + w;
            }
        }

        for (int[] e : graphEdges) {
            if (dist[e[0]] != Integer.MAX_VALUE && dist[e[0]] + e[2] < dist[e[1]]) {
                System.out.println("Negative cycle detected!");
                return new int[]{};
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        int n = 5;
        int[][] graphEdges = {{0,1,-1},{0,2,4},{1,2,3},{1,3,2},{1,4,2},{3,2,5},{3,1,1},{4,3,-3}};
        int[] dist = bellmanFord(n, graphEdges, 0);
        if (dist.length > 0) {
            System.out.println("Shortest distances from node 0:");
            for (int i = 0; i < n; i++)
                System.out.println("  Node " + i + ": " + dist[i]);
        }
    }
}`,

  "js": `function bellmanFord(n, graphEdges, source) {
    const dist = new Array(n).fill(Infinity);
    dist[source] = 0;

    for (let i = 1; i < n; i++) {
        for (const [u, v, w] of graphEdges) {
            if (dist[u] !== Infinity && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;
        }
    }

    for (const [u, v, w] of graphEdges) {
        if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
            console.log("Negative cycle detected!");
            return null;
        }
    }
    return dist;
}

const n = 5;
const graphEdges = [[0,1,-1],[0,2,4],[1,2,3],[1,3,2],[1,4,2],[3,2,5],[3,1,1],[4,3,-3]];
const dist = bellmanFord(n, graphEdges, 0);
if (dist) {
    console.log("Shortest distances from node 0:");
    dist.forEach((d, i) => console.log(\`  Node \${i}: \${d}\`));
}`,

  "c": `#include <stdio.h>
#include <limits.h>

typedef struct { int u, v, w; } Edge;

void bellmanFord(int n, Edge* graph_edges, int m, int source) {
    int dist[100];
    for (int i = 0; i < n; i++) dist[i] = INT_MAX;
    dist[source] = 0;

    for (int i = 1; i < n; i++)
        for (int j = 0; j < m; j++)
            if (dist[graph_edges[j].u] != INT_MAX &&
                dist[graph_edges[j].u] + graph_edges[j].w < dist[graph_edges[j].v])
                dist[graph_edges[j].v] = dist[graph_edges[j].u] + graph_edges[j].w;

    for (int j = 0; j < m; j++)
        if (dist[graph_edges[j].u] != INT_MAX &&
            dist[graph_edges[j].u] + graph_edges[j].w < dist[graph_edges[j].v]) {
            printf("Negative cycle detected!\\n"); return;
        }

    printf("Shortest distances from node %d:\\n", source);
    for (int i = 0; i < n; i++) printf("  Node %d: %d\\n", i, dist[i]);
}

int main() {
    Edge graph_edges[] = {{0,1,-1},{0,2,4},{1,2,3},{1,3,2},{1,4,2},{3,2,5},{3,1,1},{4,3,-3}};
    bellmanFord(5, graph_edges, 8, 0);
    return 0;
}`,

  "c#": `using System;

class Program {
    static int[] BellmanFord(int n, int[][] graphEdges, int source) {
        int[] dist = new int[n];
        Array.Fill(dist, int.MaxValue);
        dist[source] = 0;

        for (int i = 1; i < n; i++)
            foreach (var e in graphEdges)
                if (dist[e[0]] != int.MaxValue && dist[e[0]] + e[2] < dist[e[1]])
                    dist[e[1]] = dist[e[0]] + e[2];

        foreach (var e in graphEdges)
            if (dist[e[0]] != int.MaxValue && dist[e[0]] + e[2] < dist[e[1]]) {
                Console.WriteLine("Negative cycle detected!"); return new int[]{};
            }
        return dist;
    }

    static void Main() {
        int n = 5;
        int[][] graphEdges = {{0,1,-1},{0,2,4},{1,2,3},{1,3,2},{1,4,2},{3,2,5},{3,1,1},{4,3,-3}};
        int[] dist = BellmanFord(n, graphEdges, 0);
        if (dist.Length > 0) {
            Console.WriteLine("Shortest distances from node 0:");
            for (int i = 0; i < n; i++)
                Console.WriteLine($"  Node {i}: {dist[i]}");
        }
    }
}`,

  "swift": `func bellmanFord(n: Int, graphEdges: [(Int,Int,Int)], source: Int) -> [Int]? {
    var dist = Array(repeating: Int.max, count: n)
    dist[source] = 0

    for _ in 1..<n {
        for (u, v, w) in graphEdges {
            if dist[u] != Int.max && dist[u] + w < dist[v] {
                dist[v] = dist[u] + w
            }
        }
    }

    for (u, v, w) in graphEdges {
        if dist[u] != Int.max && dist[u] + w < dist[v] {
            print("Negative cycle detected!"); return nil
        }
    }
    return dist
}

let graphEdges = [(0,1,-1),(0,2,4),(1,2,3),(1,3,2),(1,4,2),(3,2,5),(3,1,1),(4,3,-3)]
if let dist = bellmanFord(n: 5, graphEdges: graphEdges, source: 0) {
    print("Shortest distances from node 0:")
    for (i, d) in dist.enumerated() { print("  Node \\(i): \\(d)") }
}`,

  "kotlin": `fun bellmanFord(n: Int, graphEdges: List<Triple<Int,Int,Int>>, source: Int): IntArray? {
    val dist = IntArray(n) { Int.MAX_VALUE }
    dist[source] = 0

    repeat(n - 1) {
        for ((u, v, w) in graphEdges)
            if (dist[u] != Int.MAX_VALUE && dist[u] + w < dist[v])
                dist[v] = dist[u] + w
    }

    for ((u, v, w) in graphEdges)
        if (dist[u] != Int.MAX_VALUE && dist[u] + w < dist[v]) {
            println("Negative cycle detected!"); return null
        }
    return dist
}

fun main() {
    val graphEdges = listOf(
        Triple(0,1,-1), Triple(0,2,4), Triple(1,2,3), Triple(1,3,2),
        Triple(1,4,2), Triple(3,2,5), Triple(3,1,1), Triple(4,3,-3)
    )
    bellmanFord(5, graphEdges, 0)?.let { dist ->
        println("Shortest distances from node 0:")
        dist.forEachIndexed { i, d -> println("  Node $i: $d") }
    }
}`,

  "scala": `object Main extends App {
    def bellmanFord(n: Int, graphEdges: List[(Int,Int,Int)], source: Int): Option[Array[Int]] = {
        val dist = Array.fill(n)(Int.MaxValue)
        dist(source) = 0

        for (_ <- 1 until n; (u, v, w) <- graphEdges)
            if (dist(u) != Int.MaxValue && dist(u) + w < dist(v))
                dist(v) = dist(u) + w

        for ((u, v, w) <- graphEdges)
            if (dist(u) != Int.MaxValue && dist(u) + w < dist(v)) {
                println("Negative cycle detected!"); return None
            }
        Some(dist)
    }

    val graphEdges = List((0,1,-1),(0,2,4),(1,2,3),(1,3,2),(1,4,2),(3,2,5),(3,1,1),(4,3,-3))
    bellmanFord(5, graphEdges, 0).foreach { dist =>
        println("Shortest distances from node 0:")
        dist.zipWithIndex.foreach { case (d, i) => println(s"  Node $i: $d") }
    }
}`,

  "go": `package main

import (
    "fmt"
    "math"
)

type Edge struct{ u, v, w int }

func bellmanFord(n int, graphEdges []Edge, source int) []int {
    dist := make([]int, n)
    for i := range dist { dist[i] = math.MaxInt32 }
    dist[source] = 0

    for i := 1; i < n; i++ {
        for _, e := range graphEdges {
            if dist[e.u] != math.MaxInt32 && dist[e.u]+e.w < dist[e.v] {
                dist[e.v] = dist[e.u] + e.w
            }
        }
    }

    for _, e := range graphEdges {
        if dist[e.u] != math.MaxInt32 && dist[e.u]+e.w < dist[e.v] {
            fmt.Println("Negative cycle detected!")
            return nil
        }
    }
    return dist
}

func main() {
    graphEdges := []Edge{{0,1,-1},{0,2,4},{1,2,3},{1,3,2},{1,4,2},{3,2,5},{3,1,1},{4,3,-3}}
    dist := bellmanFord(5, graphEdges, 0)
    if dist != nil {
        fmt.Println("Shortest distances from node 0:")
        for i, d := range dist { fmt.Printf("  Node %d: %d\\n", i, d) }
    }
}`,

  "rust": `fn bellman_ford(n: usize, graph_edges: &[(usize, usize, i32)], source: usize) -> Option<Vec<i32>> {
    let mut dist = vec![i32::MAX; n];
    dist[source] = 0;

    for _ in 1..n {
        for &(u, v, w) in graph_edges {
            if dist[u] != i32::MAX && dist[u] + w < dist[v] {
                dist[v] = dist[u] + w;
            }
        }
    }

    for &(u, v, w) in graph_edges {
        if dist[u] != i32::MAX && dist[u] + w < dist[v] {
            println!("Negative cycle detected!");
            return None;
        }
    }
    Some(dist)
}

fn main() {
    let graph_edges = vec![(0,1,-1),(0,2,4),(1,2,3),(1,3,2),(1,4,2),(3,2,5),(3,1,1),(4,3,-3)];
    if let Some(dist) = bellman_ford(5, &graph_edges, 0) {
        println!("Shortest distances from node 0:");
        for (i, d) in dist.iter().enumerate() {
            println!("  Node {}: {}", i, d);
        }
    }
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       5. FLOYD-WARSHALL ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Floyd-Warshall Algorithm",
      href: "/algorithms/graphs/floyd-warshall",
      type: "Hard",

      about: [
        { tag: "h1", text: "Floyd-Warshall Algorithm" },
        { tag: "p", text: "Floyd-Warshall, developed by Robert Floyd and Stephen Warshall in 1962, computes the shortest path between every pair of vertices in a weighted graph simultaneously — an all-pairs shortest path (APSP) algorithm, in contrast to Dijkstra's and Bellman-Ford's single-source focus. It works on a V×V distance matrix using dynamic programming over an 'allowed intermediate vertex' dimension." },
        { tag: "p", text: "The core idea: dist[i][j] using only vertices {1...k} as intermediates is either the same as using only {1...k-1}, or it's improved by routing through vertex k specifically (dist[i][k] + dist[k][j]). By incrementally allowing one more vertex as a possible 'waypoint' at each of V iterations, the algorithm converges to the true shortest path between every pair." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "You need shortest paths between ALL pairs of vertices, not just from one source",
          "The graph is small to medium-sized (V up to a few hundred/left thousands) — O(V³) becomes prohibitive beyond that",
          "Edge weights can be negative, as long as there are no negative-weight cycles (the algorithm can detect their presence via negative values on the diagonal)",
          "You need transitive closure of a relation (a boolean variant answers 'is there ANY path from i to j')"
        ]},
        { tag: "note", variant: "tip", text: "Running Dijkstra V times (once per source) costs O(V(V+E) log V), which beats Floyd-Warshall's O(V³) for sparse graphs with non-negative weights — Floyd-Warshall's simplicity and negative-weight tolerance are its real advantages, not raw speed." }
      ],

      timeComplexityCalculation: {
        notation: "O(V³)",
        best: [
          { tag: "h2", text: "Best Case — O(V³)" },
          { tag: "p", text: "The algorithm always runs three fully nested loops over all V vertices (for the intermediate vertex k, and for every pair i, j), regardless of the graph's actual connectivity or weight values — there is no early exit." },
          { tag: "ul", items: [
            "Outer loop over intermediate vertex k: V iterations",
            "Middle and inner loops over i and j: V × V = V² iterations each",
            "Total: V × V² = O(V³), unconditionally"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V³)" },
          { tag: "p", text: "Every cell of the V×V distance matrix is checked and potentially updated exactly once per value of k, regardless of how many actual edges exist or what values they carry." },
          { tag: "ul", items: [
            "V values of k × V² (i, j) pairs per k = O(V³) total comparisons",
            "Each comparison/update is O(1)",
            "No input distribution changes this fixed triple-nested-loop structure"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V³)" },
          { tag: "p", text: "No graph configuration increases the cost beyond the fixed triple loop — this is identical to best and average case, a hallmark of dense dynamic-programming algorithms with no data-dependent branching that skips iterations." },
          { tag: "ul", items: [
            "O(V³) is simultaneously the best, average, and worst case — Floyd-Warshall has no adaptive behaviour",
            "This makes it predictable but also means it can't be sped up by 'lucky' input the way Bellman-Ford's early-exit optimisation can"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V²)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V²)" },
          { tag: "p", text: "The algorithm requires a full V×V distance matrix, since it computes and stores the shortest distance between every single pair of vertices." },
          { tag: "ul", items: ["distance matrix: V² entries — O(V²)", "optional next/predecessor matrix for path reconstruction: another O(V²)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V²)" },
          { tag: "p", text: "Matrix size is fixed by vertex count alone, regardless of how many edges actually exist in the original graph — even a sparse graph still produces a dense V×V output matrix." },
          { tag: "ul", items: ["The output is inherently dense (all-pairs distances), so space is always O(V²) regardless of input edge sparsity"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V²)" },
          { tag: "p", text: "No input increases space usage beyond the fixed V×V matrices — this is both the floor and ceiling for the algorithm's memory footprint." },
          { tag: "ul", items: [
            "Distance matrix + optional path-reconstruction matrix: O(V²) total",
            "Can be done in-place (updating the same matrix across all k iterations) without needing separate matrices per iteration"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function floydWarshall(graph):
    dist ← V x V matrix
    for i from 0 to V − 1:
        for j from 0 to V − 1:
            if i == j:
                dist[i][j] ← 0
            else if edge (i, j) exists:
                dist[i][j] ← weight(i, j)
            else:
                dist[i][j] ← infinity

    for k from 0 to V − 1:              // allowed intermediate vertex
        for i from 0 to V − 1:
            for j from 0 to V − 1:
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] ← dist[i][k] + dist[k][j]

    // Negative cycle check: any dist[i][i] < 0 means a negative cycle exists
    return dist` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise the distance matrix directly from the graph's edge weights, with 0 on the diagonal and infinity for non-adjacent pairs.",
          "For each vertex k from 0 to V−1, treat it as a newly 'allowed' intermediate stopping point.",
          "For every pair (i, j), check whether routing through k — i.e. taking the best known path from i to k, then from k to j — produces a shorter total distance than the current dist[i][j].",
          "If so, update dist[i][j] to this improved value.",
          "After all V values of k have been processed, dist[i][j] holds the true shortest distance from i to j using any vertex as an intermediate — i.e. the full graph."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Inductive claim: after processing intermediate vertex k, dist[i][j] correctly holds the shortest path from i to j using only vertices from {0, 1, ..., k} as possible intermediates. Base case (before any k is processed) holds because dist[i][j] is initialised to the direct edge weight, which is trivially the shortest path using zero intermediates. Inductive step: the shortest path from i to j using vertices up to k either avoids k entirely (so it's already captured by dist[i][j] from the previous iteration) or passes through k exactly once (since revisiting k offers no benefit), in which case it equals dist[i][k] + dist[k][j], both of which are already correctly computed using vertices up to k−1 by the inductive hypothesis. Taking the minimum of these two options correctly updates dist[i][j] for intermediates up to k. By induction, after k = V−1, all pairs are correctly computed using any vertex as an intermediate." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <climits>
using namespace std;

const int INF = 1e9;

vector<vector<int>> floydWarshall(int n, vector<tuple<int,int,int>>& graph_edges) {
    vector<vector<int>> dist(n, vector<int>(n, INF));
    for (int i = 0; i < n; i++) dist[i][i] = 0;
    for (auto& [u, v, w] : graph_edges) {
        dist[u][v] = min(dist[u][v], w);
        dist[v][u] = min(dist[v][u], w);
    }

    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (dist[i][k] < INF && dist[k][j] < INF)
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);

    return dist;
}

int main() {
    int n = 4;
    vector<tuple<int,int,int>> graph_edges = {{0,1,3},{0,3,7},{1,2,2},{2,3,1},{1,3,5}};
    auto dist = floydWarshall(n, graph_edges);

    cout << "All-pairs shortest distances:\\n";
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++)
            cout << (dist[i][j] == INF ? -1 : dist[i][j]) << "\\t";
        cout << "\\n";
    }
    return 0;
}`,

  "python": `INF = float('inf')

def floyd_warshall(n, graph_edges):
    dist = [[INF]*n for _ in range(n)]
    for i in range(n): dist[i][i] = 0
    for u, v, w in graph_edges:
        dist[u][v] = min(dist[u][v], w)
        dist[v][u] = min(dist[v][u], w)

    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist

if __name__ == "__main__":
    n = 4
    graph_edges = [(0,1,3),(0,3,7),(1,2,2),(2,3,1),(1,3,5)]
    dist = floyd_warshall(n, graph_edges)
    print("All-pairs shortest distances:")
    for row in dist:
        print("  ", [d if d != INF else -1 for d in row])`,

  "java": `import java.util.*;

public class Main {
    static final int INF = (int)1e9;

    static int[][] floydWarshall(int n, int[][] graphEdges) {
        int[][] dist = new int[n][n];
        for (int[] row : dist) Arrays.fill(row, INF);
        for (int i = 0; i < n; i++) dist[i][i] = 0;
        for (int[] e : graphEdges) {
            dist[e[0]][e[1]] = Math.min(dist[e[0]][e[1]], e[2]);
            dist[e[1]][e[0]] = Math.min(dist[e[1]][e[0]], e[2]);
        }

        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (dist[i][k] < INF && dist[k][j] < INF)
                        dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
        return dist;
    }

    public static void main(String[] args) {
        int n = 4;
        int[][] graphEdges = {{0,1,3},{0,3,7},{1,2,2},{2,3,1},{1,3,5}};
        int[][] dist = floydWarshall(n, graphEdges);
        System.out.println("All-pairs shortest distances:");
        for (int[] row : dist) {
            for (int d : row) System.out.print((d == INF ? -1 : d) + "\\t");
            System.out.println();
        }
    }
}`,

  "js": `const INF = 1e9;

function floydWarshall(n, graphEdges) {
    const dist = Array.from({length: n}, (_, i) =>
        Array.from({length: n}, (_, j) => i === j ? 0 : INF));

    for (const [u, v, w] of graphEdges) {
        dist[u][v] = Math.min(dist[u][v], w);
        dist[v][u] = Math.min(dist[v][u], w);
    }

    for (let k = 0; k < n; k++)
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++)
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];
    return dist;
}

const n = 4;
const graphEdges = [[0,1,3],[0,3,7],[1,2,2],[2,3,1],[1,3,5]];
const dist = floydWarshall(n, graphEdges);
console.log("All-pairs shortest distances:");
dist.forEach(row => console.log(" ", row.map(d => d === INF ? -1 : d)));`,

  "c": `#include <stdio.h>
#define INF 1000000000
#define MAXN 100

int dist[MAXN][MAXN];

void floydWarshall(int n, int graphEdges[][3], int m) {
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            dist[i][j] = (i == j) ? 0 : INF;

    for (int e = 0; e < m; e++) {
        int u = graphEdges[e][0], v = graphEdges[e][1], w = graphEdges[e][2];
        if (w < dist[u][v]) dist[u][v] = w;
        if (w < dist[v][u]) dist[v][u] = w;
    }

    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (dist[i][k] < INF && dist[k][j] < INF &&
                    dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];
}

int main() {
    int n = 4;
    int graphEdges[][3] = {{0,1,3},{0,3,7},{1,2,2},{2,3,1},{1,3,5}};
    floydWarshall(n, graphEdges, 5);
    printf("All-pairs shortest distances:\\n");
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++)
            printf("%d\\t", dist[i][j] == INF ? -1 : dist[i][j]);
        printf("\\n");
    }
    return 0;
}`,

  "c#": `using System;

class Program {
    const int INF = (int)1e9;

    static int[,] FloydWarshall(int n, int[][] graphEdges) {
        int[,] dist = new int[n, n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                dist[i, j] = (i == j) ? 0 : INF;

        foreach (var e in graphEdges) {
            dist[e[0], e[1]] = Math.Min(dist[e[0], e[1]], e[2]);
            dist[e[1], e[0]] = Math.Min(dist[e[1], e[0]], e[2]);
        }

        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (dist[i,k] < INF && dist[k,j] < INF)
                        dist[i,j] = Math.Min(dist[i,j], dist[i,k] + dist[k,j]);
        return dist;
    }

    static void Main() {
        int n = 4;
        int[][] graphEdges = {{0,1,3},{0,3,7},{1,2,2},{2,3,1},{1,3,5}};
        int[,] dist = FloydWarshall(n, graphEdges);
        Console.WriteLine("All-pairs shortest distances:");
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++)
                Console.Write((dist[i,j] == INF ? -1 : dist[i,j]) + "\\t");
            Console.WriteLine();
        }
    }
}`,

  "swift": `let INF = Int.max / 2

func floydWarshall(n: Int, graphEdges: [(Int,Int,Int)]) -> [[Int]] {
    var dist = Array(repeating: Array(repeating: INF, count: n), count: n)
    for i in 0..<n { dist[i][i] = 0 }
    for (u, v, w) in graphEdges {
        dist[u][v] = min(dist[u][v], w)
        dist[v][u] = min(dist[v][u], w)
    }

    for k in 0..<n {
        for i in 0..<n {
            for j in 0..<n {
                if dist[i][k] < INF && dist[k][j] < INF &&
                   dist[i][k] + dist[k][j] < dist[i][j] {
                    dist[i][j] = dist[i][k] + dist[k][j]
                }
            }
        }
    }
    return dist
}

let graphEdges = [(0,1,3),(0,3,7),(1,2,2),(2,3,1),(1,3,5)]
let dist = floydWarshall(n: 4, graphEdges: graphEdges)
print("All-pairs shortest distances:")
for row in dist { print(" ", row.map { $0 == INF ? -1 : $0 }) }`,

  "kotlin": `fun floydWarshall(n: Int, graphEdges: List<Triple<Int,Int,Int>>): Array<IntArray> {
    val INF = Int.MAX_VALUE / 2
    val dist = Array(n) { i -> IntArray(n) { j -> if (i == j) 0 else INF } }
    for ((u, v, w) in graphEdges) {
        dist[u][v] = minOf(dist[u][v], w)
        dist[v][u] = minOf(dist[v][u], w)
    }

    for (k in 0 until n)
        for (i in 0 until n)
            for (j in 0 until n)
                if (dist[i][k] < INF && dist[k][j] < INF)
                    dist[i][j] = minOf(dist[i][j], dist[i][k] + dist[k][j])
    return dist
}

fun main() {
    val graphEdges = listOf(Triple(0,1,3),Triple(0,3,7),Triple(1,2,2),Triple(2,3,1),Triple(1,3,5))
    val dist = floydWarshall(4, graphEdges)
    val INF = Int.MAX_VALUE / 2
    println("All-pairs shortest distances:")
    for (row in dist) println("  " + row.map { if (it == INF) -1 else it })
}`,

  "scala": `object Main extends App {
    val INF = Int.MaxValue / 2

    def floydWarshall(n: Int, graphEdges: List[(Int,Int,Int)]): Array[Array[Int]] = {
        val dist = Array.tabulate(n, n)((i, j) => if (i == j) 0 else INF)
        for ((u, v, w) <- graphEdges) {
            dist(u)(v) = dist(u)(v) min w
            dist(v)(u) = dist(v)(u) min w
        }
        for (k <- 0 until n; i <- 0 until n; j <- 0 until n)
            if (dist(i)(k) < INF && dist(k)(j) < INF)
                dist(i)(j) = dist(i)(j) min (dist(i)(k) + dist(k)(j))
        dist
    }

    val graphEdges = List((0,1,3),(0,3,7),(1,2,2),(2,3,1),(1,3,5))
    val dist = floydWarshall(4, graphEdges)
    println("All-pairs shortest distances:")
    for (row <- dist) println("  " + row.map(d => if (d == INF) -1 else d).mkString(", "))
}`,

  "go": `package main

import (
    "fmt"
    "math"
)

func floydWarshall(n int, graphEdges [][3]int) [][]int {
    dist := make([][]int, n)
    for i := range dist {
        dist[i] = make([]int, n)
        for j := range dist[i] {
            if i == j { dist[i][j] = 0 } else { dist[i][j] = math.MaxInt32 / 2 }
        }
    }
    for _, e := range graphEdges {
        u, v, w := e[0], e[1], e[2]
        if w < dist[u][v] { dist[u][v] = w }
        if w < dist[v][u] { dist[v][u] = w }
    }

    for k := 0; k < n; k++ {
        for i := 0; i < n; i++ {
            for j := 0; j < n; j++ {
                if dist[i][k]+dist[k][j] < dist[i][j] {
                    dist[i][j] = dist[i][k] + dist[k][j]
                }
            }
        }
    }
    return dist
}

func main() {
    graphEdges := [][3]int{{0,1,3},{0,3,7},{1,2,2},{2,3,1},{1,3,5}}
    dist := floydWarshall(4, graphEdges)
    fmt.Println("All-pairs shortest distances:")
    INF := math.MaxInt32 / 2
    for _, row := range dist {
        for _, d := range row {
            if d == INF { fmt.Print("-1\\t") } else { fmt.Printf("%d\\t", d) }
        }
        fmt.Println()
    }
}`,

  "rust": `fn floyd_warshall(n: usize, graph_edges: &[(usize, usize, i32)]) -> Vec<Vec<i32>> {
    let INF = i32::MAX / 2;
    let mut dist = vec![vec![INF; n]; n];
    for i in 0..n { dist[i][i] = 0; }
    for &(u, v, w) in graph_edges {
        dist[u][v] = dist[u][v].min(w);
        dist[v][u] = dist[v][u].min(w);
    }

    for k in 0..n {
        for i in 0..n {
            for j in 0..n {
                if dist[i][k] < INF && dist[k][j] < INF {
                    dist[i][j] = dist[i][j].min(dist[i][k] + dist[k][j]);
                }
            }
        }
    }
    dist
}

fn main() {
    let graph_edges = vec![(0,1,3),(0,3,7),(1,2,2),(2,3,1),(1,3,5)];
    let dist = floyd_warshall(4, &graph_edges);
    let INF = i32::MAX / 2;
    println!("All-pairs shortest distances:");
    for row in &dist {
        let display: Vec<_> = row.iter().map(|&d| if d == INF { -1 } else { d }).collect();
        println!("  {:?}", display);
    }
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       6. KRUSKAL'S ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Kruskal's Algorithm",
      href: "/algorithms/graphs/kruskal",
      type: "Medium",

      about: [
        { tag: "h1", text: "Kruskal's Algorithm" },
        { tag: "p", text: "Kruskal's Algorithm, published by Joseph Kruskal in 1956, finds a Minimum Spanning Tree (MST) — a subset of edges connecting all vertices with the minimum possible total edge weight, and no cycles. It is greedy and edge-centric: sort all edges by weight ascending, then repeatedly add the cheapest remaining edge as long as it doesn't create a cycle with edges already chosen." },
        { tag: "p", text: "Cycle detection is handled efficiently using a Union-Find (Disjoint Set Union) data structure: two vertices are in the same 'set' if and only if they're already connected by previously chosen edges, so an edge creates a cycle exactly when its two endpoints are already in the same set." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Network design problems: minimum cost to connect all locations (cabling, pipelines, road networks)",
          "The graph is sparse (E close to V) — Kruskal's E log E sorting cost is then very competitive",
          "You naturally have a list of edges available (rather than needing efficient per-vertex neighbor lookup, which favours Prim's)",
          "Clustering applications: stopping Kruskal's early (before connecting everything) produces a natural hierarchical clustering"
        ]},
        { tag: "note", variant: "tip", text: "Kruskal's is typically preferred for sparse graphs (few edges relative to vertices), while Prim's with a Fibonacci heap is typically preferred for dense graphs — though both have the same theoretical correctness." }
      ],

      timeComplexityCalculation: {
        notation: "O(E log E)",
        best: [
          { tag: "h2", text: "Best Case — O(E log E)" },
          { tag: "p", text: "Sorting all edges always dominates the cost and is required regardless of input structure — there's no shortcut even if the MST happens to be trivially the first V−1 edges in sorted order." },
          { tag: "ul", items: [
            "Sorting E edges: O(E log E)",
            "Processing each edge with Union-Find (near O(1) amortised with path compression and union by rank): O(E · α(V)), where α is the inverse Ackermann function — effectively constant",
            "Total dominated by sorting: O(E log E)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(E log E)" },
          { tag: "p", text: "Both the sorting step and the union-find processing perform the same structural work regardless of edge weight distribution — comparison-based sorting is Θ(E log E) for any input, and Union-Find operations are near-constant regardless of which specific edges form the eventual MST." },
          { tag: "ul", items: [
            "O(E log E) for sorting (dominates)",
            "O(E · α(V)) for the union-find based cycle checks, which is effectively O(E) for all practical purposes",
            "Total: O(E log E)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(E log E)" },
          { tag: "p", text: "No edge weight configuration increases the cost beyond the sorting step's bound — even a graph requiring every single edge to be checked for cycles still fits within this envelope, since Union-Find operations are near-constant time." },
          { tag: "ul", items: [
            "Worst case equals best/average: O(E log E)",
            "Since E ≤ V² always, this can also be expressed as O(E log V) (because log(V²) = 2 log V, a constant factor difference) — both notations are commonly seen in textbooks"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V + E)" },
          { tag: "p", text: "The algorithm needs the full edge list (O(E)) plus a Union-Find structure sized to the vertex count (O(V))." },
          { tag: "ul", items: ["Edge list: O(E)", "Union-Find parent/rank arrays: O(V)", "MST result (at most V−1 edges): O(V)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V + E)" },
          { tag: "p", text: "Memory usage is fixed by graph size alone, since both the edge list and the union-find structure are sized independently of the specific weight values or which edges end up in the MST." },
          { tag: "ul", items: ["Same O(V + E) bound regardless of edge weight distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V + E)" },
          { tag: "p", text: "No graph configuration increases space beyond storing the full edge list and the fixed-size Union-Find structure." },
          { tag: "ul", items: ["O(E) for edges + O(V) for Union-Find = O(V + E), identical across all cases"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function kruskal(graph):
    mst ← empty list
    sortedEdges ← sort graph.edges by weight ascending

    unionFind ← new DisjointSet(graph.vertices)   // each vertex starts in its own set

    for (u, v, weight) in sortedEdges:
        if unionFind.find(u) != unionFind.find(v):
            mst.append((u, v, weight))
            unionFind.union(u, v)
            if length(mst) == numVertices − 1:
                break                              // MST complete

    return mst` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Sort every edge in the graph by weight, ascending — this lets the algorithm greedily consider the cheapest edges first.",
          "Initialise a Union-Find structure where every vertex starts in its own singleton set.",
          "Process edges in sorted order: for each edge (u, v), check whether u and v are already in the same set (meaning they're already connected via previously chosen MST edges).",
          "If they're in different sets, adding this edge connects two previously separate components without creating a cycle — add it to the MST and merge (union) the two sets.",
          "If they're already in the same set, adding this edge would create a cycle — skip it.",
          "Stop once V − 1 edges have been added (a spanning tree on V vertices always has exactly V − 1 edges)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "This follows from the Cut Property of MSTs: for any partition of the vertices into two non-empty sets, the minimum-weight edge crossing that partition must be part of some MST. Processing edges in ascending weight order and only adding an edge when it connects two different components is exactly choosing, at each step, the minimum-weight edge crossing the cut between 'already-connected components' and 'everything else' — which the Cut Property guarantees is always safe to include. The greedy choice never needs to be undone, and since Union-Find correctly tracks connectivity, every cycle-forming edge is correctly rejected, yielding a true minimum spanning tree." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<int> parent_arr;
vector<int> rank_arr;

void uf_init(int n) {
    for (int i = 0; i < n; i++) {
        parent_arr.push_back(i);
        rank_arr.push_back(0);
    }
}

int uf_find(int x) {
    if (parent_arr[x] == x) return x;
    parent_arr[x] = uf_find(parent_arr[x]);
    return parent_arr[x];
}

bool uf_unite(int x, int y) {
    x = uf_find(x); 
    y = uf_find(y);
    if (x == y) return false;
    
    if (rank_arr[x] < rank_arr[y]) swap(x, y);
    
    parent_arr[y] = x;
    if (rank_arr[x] == rank_arr[y]) rank_arr[x]++;
    return true;
}

// 2. Use 2D arrays instead of Structs for edges!
// Visualizer strict requirement: the edge list MUST be an array of arrays.
vector<vector<int>> graph_edges;

void addEdge(int u, int v, int w) {
    // We create a vector to represent the edge: {u, v, weight}
    vector<int> e;
    e.push_back(u);
    e.push_back(v);
    e.push_back(w);
    graph_edges.push_back(e);
}

vector<vector<int>> kruskal(int n) {
    // Sort based on weight (the 3rd element at index 2)
    sort(graph_edges.begin(), graph_edges.end(), [](auto& a, auto& b){ return a[2] < b[2]; });
    
    uf_init(n);
    vector<vector<int>> mst;

    for (auto& e : graph_edges) {
        // Expose 'current' and 'v' so the visualizer highlights the active edge!
        int current = e[0];
        int v = e[1];
        
        if (uf_unite(current, v)) {
            mst.push_back(e);
            if ((int)mst.size() == n - 1) break;
        }
    }
    return mst;
}

int main() {
    int n = 4;
    
    // Build edges (this builds an array of arrays)
    addEdge(0, 1, 10);
    addEdge(0, 2, 6);
    addEdge(0, 3, 5);
    addEdge(1, 3, 15);
    addEdge(2, 3, 4);

    auto mst = kruskal(n);
    int total = 0;
    
    cout << "MST edges:\\n";
    for (auto& e : mst) {
        cout << "  " << e[0] << " -- " << e[1] << " (weight " << e[2] << ")\\n";
        total += e[2];
    }
    cout << "Total MST weight: " << total << "\\n";
    
    return 0;
}
`,

  "python": `def find(parent, x):
    if parent[x] != x:
        parent[x] = find(parent, parent[x])
    return parent[x]

def union(parent, rank, x, y):
    px, py = find(parent, x), find(parent, y)
    if px == py: return False
    if rank[px] < rank[py]: px, py = py, px
    parent[py] = px
    if rank[px] == rank[py]: rank[px] += 1
    return True

def kruskal(n, graph_edges):
    graph_edges.sort(key=lambda e: e[2])
    parent = list(range(n))
    rank = [0] * n
    mst = []

    for u, v, w in graph_edges:
        if union(parent, rank, u, v):
            mst.append((u, v, w))
            if len(mst) == n - 1: break
    return mst

if __name__ == "__main__":
    n = 4
    graph_edges = [(0,1,10),(0,2,6),(0,3,5),(1,3,15),(2,3,4)]
    mst = kruskal(n, graph_edges)
    total = sum(w for _,_,w in mst)
    print("MST edges:")
    for u, v, w in mst: print(f"  {u} -- {v} (weight {w})")
    print(f"Total MST weight: {total}")`,

  "java": `import java.util.*;

public class Main {
    static int[] parent, rank;
    static int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }
    static boolean union(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return false;
        if (rank[x] < rank[y]) { int t = x; x = y; y = t; }
        parent[y] = x;
        if (rank[x] == rank[y]) rank[x]++;
        return true;
    }

    public static void main(String[] args) {
        int n = 4;
        int[][] graphEdges = {{0,1,10},{0,2,6},{0,3,5},{1,3,15},{2,3,4}};
        Arrays.sort(graphEdges, Comparator.comparingInt(e -> e[2]));
        parent = new int[n]; rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;

        List<int[]> mst = new ArrayList<>();
        for (int[] e : graphEdges) {
            if (union(e[0], e[1])) {
                mst.add(e);
                if (mst.size() == n - 1) break;
            }
        }

        int total = 0;
        System.out.println("MST edges:");
        for (int[] e : mst) {
            System.out.println("  " + e[0] + " -- " + e[1] + " (weight " + e[2] + ")");
            total += e[2];
        }
        System.out.println("Total MST weight: " + total);
    }
}`,

  "js": `function find(parent, x) {
    if (parent[x] !== x) parent[x] = find(parent, parent[x]);
    return parent[x];
}
function union(parent, rank, x, y) {
    let px = find(parent, x), py = find(parent, y);
    if (px === py) return false;
    if (rank[px] < rank[py]) [px, py] = [py, px];
    parent[py] = px;
    if (rank[px] === rank[py]) rank[px]++;
    return true;
}

function kruskal(n, graphEdges) {
    graphEdges.sort((a, b) => a[2] - b[2]);
    const parent = Array.from({length: n}, (_, i) => i);
    const rank = new Array(n).fill(0);
    const mst = [];

    for (const [u, v, w] of graphEdges) {
        if (union(parent, rank, u, v)) {
            mst.push([u, v, w]);
            if (mst.length === n - 1) break;
        }
    }
    return mst;
}

const n = 4;
const graphEdges = [[0,1,10],[0,2,6],[0,3,5],[1,3,15],[2,3,4]];
const mst = kruskal(n, graphEdges);
const total = mst.reduce((s, [,,w]) => s + w, 0);
console.log("MST edges:");
mst.forEach(([u,v,w]) => console.log(\`  \${u} -- \${v} (weight \${w})\`));
console.log("Total MST weight:", total);`,

  "c": `#include <stdio.h>
#include <stdlib.h>
#define MAXN 100

int parent[MAXN], rnk[MAXN];

int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }
int unite(int x, int y) {
    x = find(x); y = find(y);
    if (x == y) return 0;
    if (rnk[x] < rnk[y]) { int t = x; x = y; y = t; }
    parent[y] = x;
    if (rnk[x] == rnk[y]) rnk[x]++;
    return 1;
}

typedef struct { int u, v, w; } Edge;

int cmp(const void* a, const void* b) {
    return ((Edge*)a)->w - ((Edge*)b)->w;
}

int main() {
    int n = 4;
    Edge graph_edges[] = {{0,1,10},{0,2,6},{0,3,5},{1,3,15},{2,3,4}};
    int m = 5;
    qsort(graph_edges, m, sizeof(Edge), cmp);
    for (int i = 0; i < n; i++) { parent[i] = i; rnk[i] = 0; }

    int total = 0, cnt = 0;
    printf("MST edges:\\n");
    for (int i = 0; i < m && cnt < n-1; i++) {
        if (unite(graph_edges[i].u, graph_edges[i].v)) {
            printf("  %d -- %d (weight %d)\\n", graph_edges[i].u, graph_edges[i].v, graph_edges[i].w);
            total += graph_edges[i].w; cnt++;
        }
    }
    printf("Total MST weight: %d\\n", total);
    return 0;
}`,

  "c#": `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static int[] parent, rank;
    static int Find(int x) => parent[x] == x ? x : (parent[x] = Find(parent[x]));
    static bool Union(int x, int y) {
        x = Find(x); y = Find(y);
        if (x == y) return false;
        if (rank[x] < rank[y]) (x, y) = (y, x);
        parent[y] = x;
        if (rank[x] == rank[y]) rank[x]++;
        return true;
    }

    static void Main() {
        int n = 4;
        int[][] graphEdges = {{0,1,10},{0,2,6},{0,3,5},{1,3,15},{2,3,4}};
        var sorted = graphEdges.OrderBy(e => e[2]).ToList();
        parent = Enumerable.Range(0, n).ToArray();
        rank = new int[n];

        var mst = new List<int[]>();
        foreach (var e in sorted) {
            if (Union(e[0], e[1])) {
                mst.Add(e);
                if (mst.Count == n - 1) break;
            }
        }

        int total = mst.Sum(e => e[2]);
        Console.WriteLine("MST edges:");
        foreach (var e in mst)
            Console.WriteLine($"  {e[0]} -- {e[1]} (weight {e[2]})");
        Console.WriteLine($"Total MST weight: {total}");
    }
}`,

  "swift": `func kruskal(n: Int, graphEdges: [(Int,Int,Int)]) -> [(Int,Int,Int)] {
    var parent = Array(0..<n)
    var rank = Array(repeating: 0, count: n)

    func find(_ x: Int) -> Int {
        if parent[x] != x { parent[x] = find(parent[x]) }
        return parent[x]
    }
    func union(_ x: Int, _ y: Int) -> Bool {
        var px = find(x), py = find(y)
        if px == py { return false }
        if rank[px] < rank[py] { swap(&px, &py) }
        parent[py] = px
        if rank[px] == rank[py] { rank[px] += 1 }
        return true
    }

    let sorted = graphEdges.sorted { $0.2 < $1.2 }
    var mst = [(Int,Int,Int)]()
    for (u, v, w) in sorted {
        if union(u, v) {
            mst.append((u, v, w))
            if mst.count == n - 1 { break }
        }
    }
    return mst
}

let graphEdges = [(0,1,10),(0,2,6),(0,3,5),(1,3,15),(2,3,4)]
let mst = kruskal(n: 4, graphEdges: graphEdges)
let total = mst.reduce(0) { $0 + $1.2 }
print("MST edges:")
for (u, v, w) in mst { print("  \\(u) -- \\(v) (weight \\(w))") }
print("Total MST weight: \\(total)")`,

  "kotlin": `fun kruskal(n: Int, graphEdges: List<Triple<Int,Int,Int>>): List<Triple<Int,Int,Int>> {
    val parent = IntArray(n) { it }
    val rank = IntArray(n)

    fun find(x: Int): Int = if (parent[x] == x) x else { parent[x] = find(parent[x]); parent[x] }
    fun union(x: Int, y: Int): Boolean {
        var px = find(x); var py = find(y)
        if (px == py) return false
        if (rank[px] < rank[py]) { val t = px; px = py; py = t }
        parent[py] = px
        if (rank[px] == rank[py]) rank[px]++
        return true
    }

    val mst = mutableListOf<Triple<Int,Int,Int>>()
    for ((u, v, w) in graphEdges.sortedBy { it.third }) {
        if (union(u, v)) {
            mst.add(Triple(u, v, w))
            if (mst.size == n - 1) break
        }
    }
    return mst
}

fun main() {
    val graphEdges = listOf(Triple(0,1,10),Triple(0,2,6),Triple(0,3,5),Triple(1,3,15),Triple(2,3,4))
    val mst = kruskal(4, graphEdges)
    val total = mst.sumOf { it.third }
    println("MST edges:")
    mst.forEach { (u, v, w) -> println("  $u -- $v (weight $w)") }
    println("Total MST weight: $total")
}`,

  "scala": `object Main extends App {
    def kruskal(n: Int, graphEdges: List[(Int,Int,Int)]): List[(Int,Int,Int)] = {
        val parent = Array.tabulate(n)(identity)
        val rank = Array.fill(n)(0)

        def find(x: Int): Int = if (parent(x) == x) x else { parent(x) = find(parent(x)); parent(x) }
        def union(x: Int, y: Int): Boolean = {
            var px = find(x); var py = find(y)
            if (px == py) return false
            if (rank(px) < rank(py)) { val t = px; px = py; py = t }
            parent(py) = px
            if (rank(px) == rank(py)) rank(px) += 1
            true
        }

        val mst = scala.collection.mutable.ListBuffer[(Int,Int,Int)]()
        for ((u, v, w) <- graphEdges.sortBy(_._3)) {
            if (union(u, v)) {
                mst += ((u, v, w))
                if (mst.length == n - 1) return mst.toList
            }
        }
        mst.toList
    }

    val graphEdges = List((0,1,10),(0,2,6),(0,3,5),(1,3,15),(2,3,4))
    val mst = kruskal(4, graphEdges)
    val total = mst.map(_._3).sum
    println("MST edges:")
    mst.foreach { case (u,v,w) => println(s"  $u -- $v (weight $w)") }
    println(s"Total MST weight: $total")
}`,

  "go": `package main

import (
    "fmt"
    "sort"
)

type Edge struct{ u, v, w int }

var parent, rank []int

func find(x int) int {
    if parent[x] != x { parent[x] = find(parent[x]) }
    return parent[x]
}
func unite(x, y int) bool {
    px, py := find(x), find(y)
    if px == py { return false }
    if rank[px] < rank[py] { px, py = py, px }
    parent[py] = px
    if rank[px] == rank[py] { rank[px]++ }
    return true
}

func kruskal(n int, graphEdges []Edge) []Edge {
    sort.Slice(graphEdges, func(i, j int) bool { return graphEdges[i].w < graphEdges[j].w })
    parent = make([]int, n); rank = make([]int, n)
    for i := range parent { parent[i] = i }

    mst := []Edge{}
    for _, e := range graphEdges {
        if unite(e.u, e.v) {
            mst = append(mst, e)
            if len(mst) == n-1 { break }
        }
    }
    return mst
}

func main() {
    graphEdges := []Edge{{0,1,10},{0,2,6},{0,3,5},{1,3,15},{2,3,4}}
    mst := kruskal(4, graphEdges)
    total := 0
    fmt.Println("MST edges:")
    for _, e := range mst {
        fmt.Printf("  %d -- %d (weight %d)\\n", e.u, e.v, e.w)
        total += e.w
    }
    fmt.Println("Total MST weight:", total)
}`,

  "rust": `fn find(parent: &mut Vec<usize>, x: usize) -> usize {
    if parent[x] != x { parent[x] = find(parent, parent[x]); }
    parent[x]
}
fn union(parent: &mut Vec<usize>, rank: &mut Vec<usize>, x: usize, y: usize) -> bool {
    let (mut px, mut py) = (find(parent, x), find(parent, y));
    if px == py { return false; }
    if rank[px] < rank[py] { std::mem::swap(&mut px, &mut py); }
    parent[py] = px;
    if rank[px] == rank[py] { rank[px] += 1; }
    true
}

fn kruskal(n: usize, mut graph_edges: Vec<(usize, usize, i32)>) -> Vec<(usize, usize, i32)> {
    graph_edges.sort_by_key(|e| e.2);
    let mut parent: Vec<usize> = (0..n).collect();
    let mut rank = vec![0usize; n];
    let mut mst = vec![];

    for (u, v, w) in graph_edges {
        if union(&mut parent, &mut rank, u, v) {
            mst.push((u, v, w));
            if mst.len() == n - 1 { break; }
        }
    }
    mst
}

fn main() {
    let graph_edges = vec![(0,1,10),(0,2,6),(0,3,5),(1,3,15),(2,3,4)];
    let mst = kruskal(4, graph_edges);
    let total: i32 = mst.iter().map(|e| e.2).sum();
    println!("MST edges:");
    for (u, v, w) in &mst { println!("  {} -- {} (weight {})", u, v, w); }
    println!("Total MST weight: {}", total);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       7. PRIM'S ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Prim's Algorithm",
      href: "/algorithms/graphs/prim",
      type: "Medium",

      about: [
        { tag: "h1", text: "Prim's Algorithm" },
        { tag: "p", text: "Prim's Algorithm, developed by Robert Prim in 1957 (and earlier by Vojtěch Jarník in 1930), also finds a Minimum Spanning Tree, but is vertex-centric rather than edge-centric: it grows a single tree outward from an arbitrary starting vertex, at each step adding the cheapest edge that connects the current tree to a vertex not yet in it." },
        { tag: "p", text: "Structurally, Prim's is very similar to Dijkstra's Algorithm — both use a priority queue to greedily select the 'next best' vertex — but where Dijkstra's tracks cumulative path distance from the source, Prim's tracks the minimum single edge weight connecting a vertex to the growing tree, which is what makes it build a minimum spanning tree rather than a shortest-path tree." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The graph is dense (E close to V²) — Prim's with a Fibonacci heap achieves O(E + V log V), beating Kruskal's E log E on dense graphs",
          "You have efficient adjacency-list/neighbor access but not necessarily a sorted global edge list",
          "Network design problems identical to Kruskal's use case (minimum cabling/connection cost) — the choice between the two is mostly about graph density and implementation convenience",
          "Real-time/incremental MST construction where you're growing the tree from a fixed starting point"
        ]},
        { tag: "note", variant: "info", text: "Both Prim's and Kruskal's always produce a valid MST (the minimum total weight is unique even when the specific tree structure isn't), so the choice between them is purely about performance characteristics for the given graph density." }
      ],

      timeComplexityCalculation: {
        notation: "O((V + E) log V)",
        best: [
          { tag: "h2", text: "Best Case — O((V + E) log V)" },
          { tag: "p", text: "Using a binary heap, every vertex extraction and edge relaxation costs O(log V), and the algorithm always processes every vertex and edge at least once to build the spanning tree — there's no early exit regardless of edge weight favourability." },
          { tag: "ul", items: [
            "V extract-min operations: O(V log V)",
            "Up to E decrease-key/insert operations: O(E log V)",
            "Total: O((V + E) log V), the standard binary-heap bound, identical to Dijkstra's structure"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O((V + E) log V)" },
          { tag: "p", text: "The priority-queue-driven structure performs the same fixed sequence of operations (extract minimum, examine neighbors, possibly update priority) regardless of the specific edge weight values, only their relative order affects extraction sequence, not operation count." },
          { tag: "ul", items: [
            "V extractions × O(log V) + E potential updates × O(log V) = O((V + E) log V)",
            "No input distribution changes this structural bound for the standard binary-heap implementation"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O((V + E) log V)" },
          { tag: "p", text: "No graph structure increases the cost beyond the standard binary-heap bound — for a dense graph this becomes O(V² log V) with a binary heap, which is exactly why a Fibonacci heap implementation is preferred for dense graphs." },
          { tag: "ul", items: [
            "Binary heap: O((V + E) log V) worst case",
            "Fibonacci heap: O(E + V log V) worst case — significantly better for dense graphs since decrease-key becomes O(1) amortised",
            "Adjacency-matrix-based O(V²) implementation (no heap at all): competitive specifically for very dense graphs where E approaches V²"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "Prim's maintains a key/weight array (cheapest edge weight connecting each vertex to the tree), an in-tree boolean array, and a priority queue, all sized to V." },
          { tag: "ul", items: ["key[] (min edge weight to tree): O(V)", "inTree[] boolean array: O(V)", "priority queue: up to O(V) entries"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage is fixed by vertex count, since the tracking arrays must accommodate every vertex regardless of how densely connected the graph is." },
          { tag: "ul", items: ["key[], inTree[]: O(V) each, independent of E"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V + E)" },
          { tag: "p", text: "Lazy-deletion priority queue implementations (pushing a new entry on every key update rather than updating in place) can grow the queue to O(E) stale entries in the worst case." },
          { tag: "ul", items: [
            "key[], inTree[]: O(V)",
            "Lazy-deletion priority queue: up to O(E) entries in the worst case",
            "Decrease-key-based implementations keep this strictly at O(V)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function prim(graph, start):
    key    ← map of vertex → infinity, for all vertices
    inTree ← map of vertex → false, for all vertices
    key[start] ← 0
    pq ← min-priority-queue, ordered by key
    pq.insert(start, 0)
    mstWeight ← 0

    while pq is not empty:
        (u, k) ← pq.extractMin()
        if inTree[u]:
            continue                    // stale entry, skip
        inTree[u] ← true
        mstWeight ← mstWeight + k

        for (v, weight) in graph.adjacent(u):
            if not inTree[v] and weight < key[v]:
                key[v] ← weight
                pq.insert(v, weight)     // or decreaseKey(v, weight)

    return mstWeight` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Start with an arbitrary vertex; its key (cheapest known edge to the growing tree) is set to 0 since it needs no edge to join itself.",
          "Use a priority queue to always extract the not-yet-included vertex with the smallest key — the cheapest way to connect a new vertex to the existing tree.",
          "Once extracted, mark the vertex as part of the tree and add its key value to the running total MST weight.",
          "For each neighbor not yet in the tree, check if the direct edge to it is cheaper than the neighbor's currently known key — if so, this edge is now the best known way to attach that neighbor to the tree.",
          "Update the neighbor's key and push the new value onto the priority queue.",
          "Repeat until every vertex has been added to the tree."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "This also follows from the Cut Property: at every step, the current tree and the remaining unvisited vertices form a cut of the graph. The algorithm always selects the minimum-weight edge crossing that cut (the smallest key among not-yet-included vertices), which the Cut Property guarantees is safe to add to some MST. Since this greedy choice is repeated for every vertex addition and is always provably safe, the final tree — having connected all V vertices with exactly V − 1 such safe edges — is guaranteed to be a true minimum spanning tree." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <queue>
#include <climits>
using namespace std;

typedef pair<int,int> pii;

int prim(vector<vector<pii>>& graph_adj, int n, int start = 0) {
    vector<int> key(n, INT_MAX);
    vector<bool> inTree(n, false);
    priority_queue<pii, vector<pii>, greater<pii>> pq;

    key[start] = 0;
    pq.push({0, start});
    int mstWeight = 0;

    while (!pq.empty()) {
        auto [k, u] = pq.top(); pq.pop();
        if (inTree[u]) continue;
        inTree[u] = true;
        mstWeight += k;

        for (auto [v, w] : graph_adj[u]) {
            if (!inTree[v] && w < key[v]) {
                key[v] = w;
                pq.push({w, v});
            }
        }
    }
    return mstWeight;
}

int main() {
    int n = 5;
    vector<vector<pii>> graph_adj(n);
    auto addEdge = [&](int u, int v, int w) {
        graph_adj[u].push_back({v, w});
        graph_adj[v].push_back({u, w});
    };
    addEdge(0,1,2); addEdge(0,3,6); addEdge(1,2,3);
    addEdge(1,3,8); addEdge(1,4,5); addEdge(2,4,7); addEdge(3,4,9);

    cout << "MST total weight: " << prim(graph_adj, n) << "\\n";
    return 0;
}`,

  "python": `import heapq

def prim(graph_adj, n, start=0):
    key = [float('inf')] * n
    in_tree = [False] * n
    pq = [(0, start)]
    key[start] = 0
    mst_weight = 0

    while pq:
        k, u = heapq.heappop(pq)
        if in_tree[u]: continue
        in_tree[u] = True
        mst_weight += k

        for v, w in graph_adj[u]:
            if not in_tree[v] and w < key[v]:
                key[v] = w
                heapq.heappush(pq, (w, v))

    return mst_weight

if __name__ == "__main__":
    n = 5
    graph_adj = [[] for _ in range(n)]
    def add_edge(u, v, w):
        graph_adj[u].append((v, w))
        graph_adj[v].append((u, w))
    add_edge(0,1,2); add_edge(0,3,6); add_edge(1,2,3)
    add_edge(1,3,8); add_edge(1,4,5); add_edge(2,4,7); add_edge(3,4,9)
    print("MST total weight:", prim(graph_adj, n))`,

  "java": `import java.util.*;

public class Main {
    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        int n = 5;
        List<int[]>[] graphAdj = new ArrayList[n];
        for (int i = 0; i < n; i++) graphAdj[i] = new ArrayList<>();
        int[][] edges = {{0,1,2},{0,3,6},{1,2,3},{1,3,8},{1,4,5},{2,4,7},{3,4,9}};
        for (int[] e : edges) {
            graphAdj[e[0]].add(new int[]{e[1], e[2]});
            graphAdj[e[1]].add(new int[]{e[0], e[2]});
        }

        int[] key = new int[n];
        boolean[] inTree = new boolean[n];
        Arrays.fill(key, Integer.MAX_VALUE);
        key[0] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
        pq.offer(new int[]{0, 0});
        int mstWeight = 0;

        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int k = curr[0], u = curr[1];
            if (inTree[u]) continue;
            inTree[u] = true;
            mstWeight += k;

            for (int[] e : graphAdj[u]) {
                int v = e[0], w = e[1];
                if (!inTree[v] && w < key[v]) {
                    key[v] = w;
                    pq.offer(new int[]{w, v});
                }
            }
        }
        System.out.println("MST total weight: " + mstWeight);
    }
}`,

  "js": `function prim(graphAdj, n, start = 0) {
    const key = new Array(n).fill(Infinity);
    const inTree = new Array(n).fill(false);
    const pq = [[0, start]];
    key[start] = 0;
    let mstWeight = 0;

    while (pq.length > 0) {
        pq.sort((a, b) => a[0] - b[0]);
        const [k, u] = pq.shift();
        if (inTree[u]) continue;
        inTree[u] = true;
        mstWeight += k;

        for (const [v, w] of graphAdj[u]) {
            if (!inTree[v] && w < key[v]) {
                key[v] = w;
                pq.push([w, v]);
            }
        }
    }
    return mstWeight;
}

const n = 5;
const graphAdj = Array.from({length: n}, () => []);
const addEdge = (u,v,w) => { graphAdj[u].push([v,w]); graphAdj[v].push([u,w]); };
addEdge(0,1,2); addEdge(0,3,6); addEdge(1,2,3);
addEdge(1,3,8); addEdge(1,4,5); addEdge(2,4,7); addEdge(3,4,9);
console.log("MST total weight:", prim(graphAdj, n));`,

  "c": `#include <stdio.h>
#include <limits.h>
#define MAXN 100

int graph_adj[MAXN][MAXN], gweight[MAXN][MAXN], deg[MAXN];
int key[MAXN]; int inTree[MAXN];

void addEdge(int u, int v, int w) {
    graph_adj[u][deg[u]] = v; gweight[u][deg[u]++] = w;
    graph_adj[v][deg[v]] = u; gweight[v][deg[v]++] = w;
}

int prim(int n) {
    for (int i = 0; i < n; i++) { key[i] = INT_MAX; inTree[i] = 0; }
    key[0] = 0;
    int mstWeight = 0;

    for (int iter = 0; iter < n; iter++) {
        int u = -1;
        for (int i = 0; i < n; i++)
            if (!inTree[i] && (u == -1 || key[i] < key[u])) u = i;
        inTree[u] = 1;
        mstWeight += key[u];

        for (int i = 0; i < deg[u]; i++) {
            int v = graph_adj[u][i], w = gweight[u][i];
            if (!inTree[v] && w < key[v]) key[v] = w;
        }
    }
    return mstWeight;
}

int main() {
    int n = 5;
    addEdge(0,1,2); addEdge(0,3,6); addEdge(1,2,3);
    addEdge(1,3,8); addEdge(1,4,5); addEdge(2,4,7); addEdge(3,4,9);
    printf("MST total weight: %d\\n", prim(n));
    return 0;
}`,

  "c#": `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        int n = 5;
        var graphAdj = new List<(int v, int w)>[n];
        for (int i = 0; i < n; i++) graphAdj[i] = new List<(int,int)>();
        int[][] edges = {{0,1,2},{0,3,6},{1,2,3},{1,3,8},{1,4,5},{2,4,7},{3,4,9}};
        foreach (var e in edges) {
            graphAdj[e[0]].Add((e[1], e[2]));
            graphAdj[e[1]].Add((e[0], e[2]));
        }

        int[] key = new int[n];
        bool[] inTree = new bool[n];
        Array.Fill(key, int.MaxValue);
        key[0] = 0;
        var pq = new SortedSet<(int,int)>(Comparer<(int,int)>.Create((a,b) =>
            a.Item1 != b.Item1 ? a.Item1.CompareTo(b.Item1) : a.Item2.CompareTo(b.Item2)));
        pq.Add((0, 0));
        int mstWeight = 0;

        while (pq.Count > 0) {
            var (k, u) = pq.Min; pq.Remove(pq.Min);
            if (inTree[u]) continue;
            inTree[u] = true;
            mstWeight += k;

            foreach (var (v, w) in graphAdj[u]) {
                if (!inTree[v] && w < key[v]) {
                    pq.Remove((key[v], v));
                    key[v] = w;
                    pq.Add((w, v));
                }
            }
        }
        Console.WriteLine("MST total weight: " + mstWeight);
    }
}`,

  "swift": `import Foundation

func prim(graphAdj: [[(Int, Int)]], n: Int, start: Int = 0) -> Int {
    var key = Array(repeating: Int.max, count: n)
    var inTree = Array(repeating: false, count: n)
    var pq: [(Int, Int)] = [(0, start)]
    key[start] = 0
    var mstWeight = 0

    while !pq.isEmpty {
        pq.sort { $0.0 < $1.0 }
        let (k, u) = pq.removeFirst()
        if inTree[u] { continue }
        inTree[u] = true
        mstWeight += k

        for (v, w) in graphAdj[u] {
            if !inTree[v] && w < key[v] {
                key[v] = w
                pq.append((w, v))
            }
        }
    }
    return mstWeight
}

var graphAdj = [[(Int,Int)]](repeating: [], count: 5)
let edges = [(0,1,2),(0,3,6),(1,2,3),(1,3,8),(1,4,5),(2,4,7),(3,4,9)]
for (u, v, w) in edges {
    graphAdj[u].append((v, w)); graphAdj[v].append((u, w))
}
print("MST total weight:", prim(graphAdj: graphAdj, n: 5))`,

  "kotlin": `import java.util.PriorityQueue

fun prim(graphAdj: Array<MutableList<Pair<Int,Int>>>, n: Int, start: Int = 0): Int {
    val key = IntArray(n) { Int.MAX_VALUE }
    val inTree = BooleanArray(n)
    val pq = PriorityQueue<Pair<Int,Int>>(compareBy { it.first })
    key[start] = 0
    pq.add(0 to start)
    var mstWeight = 0

    while (pq.isNotEmpty()) {
        val (k, u) = pq.poll()
        if (inTree[u]) continue
        inTree[u] = true
        mstWeight += k

        for ((v, w) in graphAdj[u]) {
            if (!inTree[v] && w < key[v]) {
                key[v] = w
                pq.add(w to v)
            }
        }
    }
    return mstWeight
}

fun main() {
    val n = 5
    val graphAdj = Array(n) { mutableListOf<Pair<Int,Int>>() }
    val edges = listOf(0 to Pair(1,2),0 to Pair(3,6),1 to Pair(2,3),
                       1 to Pair(3,8),1 to Pair(4,5),2 to Pair(4,7),3 to Pair(4,9))
    for ((u, vw) in edges) { graphAdj[u].add(vw); graphAdj[vw.first].add(u to vw.second) }
    println("MST total weight: \${prim(graphAdj, n)}")
}`,

  "scala": `import scala.collection.mutable

object Main extends App {
    def prim(graphAdj: Array[mutable.ListBuffer[(Int,Int)]], n: Int, start: Int = 0): Int = {
        val key = Array.fill(n)(Int.MaxValue)
        val inTree = Array.fill(n)(false)
        val pq = mutable.PriorityQueue[(Int,Int)]()(Ordering.by(-_._1))
        key(start) = 0; pq.enqueue((0, start))
        var mstWeight = 0

        while (pq.nonEmpty) {
            val (k, u) = pq.dequeue()
            if (!inTree(u)) {
                inTree(u) = true; mstWeight += k
                for ((v, w) <- graphAdj(u)) {
                    if (!inTree(v) && w < key(v)) {
                        key(v) = w; pq.enqueue((w, v))
                    }
                }
            }
        }
        mstWeight
    }

    val n = 5
    val graphAdj = Array.fill(n)(mutable.ListBuffer[(Int,Int)]())
    val edges = List((0,1,2),(0,3,6),(1,2,3),(1,3,8),(1,4,5),(2,4,7),(3,4,9))
    for ((u, v, w) <- edges) { graphAdj(u) += ((v,w)); graphAdj(v) += ((u,w)) }
    println(s"MST total weight: \${prim(graphAdj, n)}")
}`,

  "go": `package main

import (
    "container/heap"
    "fmt"
    "math"
)

type Item struct{ w, v int }
type PQ []Item
func (pq PQ) Len() int            { return len(pq) }
func (pq PQ) Less(i, j int) bool  { return pq[i].w < pq[j].w }
func (pq PQ) Swap(i, j int)       { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PQ) Push(x interface{}) { *pq = append(*pq, x.(Item)) }
func (pq *PQ) Pop() interface{}   { old := *pq; n := len(old); x := old[n-1]; *pq = old[:n-1]; return x }

func prim(graphAdj [][][2]int, n int) int {
    key := make([]int, n)
    for i := range key { key[i] = math.MaxInt32 }
    inTree := make([]bool, n)
    key[0] = 0

    pq := &PQ{{0, 0}}
    heap.Init(pq)
    mstWeight := 0

    for pq.Len() > 0 {
        curr := heap.Pop(pq).(Item)
        k, u := curr.w, curr.v
        if inTree[u] { continue }
        inTree[u] = true
        mstWeight += k

        for _, edge := range graphAdj[u] {
            v, w := edge[0], edge[1]
            if !inTree[v] && w < key[v] {
                key[v] = w
                heap.Push(pq, Item{w, v})
            }
        }
    }
    return mstWeight
}

func main() {
    n := 5
    graphAdj := make([][][2]int, n)
    addEdge := func(u, v, w int) {
        graphAdj[u] = append(graphAdj[u], [2]int{v, w})
        graphAdj[v] = append(graphAdj[v], [2]int{u, w})
    }
    addEdge(0,1,2); addEdge(0,3,6); addEdge(1,2,3)
    addEdge(1,3,8); addEdge(1,4,5); addEdge(2,4,7); addEdge(3,4,9)
    fmt.Println("MST total weight:", prim(graphAdj, n))
}`,

  "rust": `use std::collections::BinaryHeap;
use std::cmp::Reverse;

fn prim(graph_adj: &Vec<Vec<(usize, i32)>>, n: usize) -> i32 {
    let mut key = vec![i32::MAX; n];
    let mut in_tree = vec![false; n];
    let mut pq = BinaryHeap::new();
    key[0] = 0;
    pq.push(Reverse((0i32, 0usize)));
    let mut mst_weight = 0;

    while let Some(Reverse((k, u))) = pq.pop() {
        if in_tree[u] { continue; }
        in_tree[u] = true;
        mst_weight += k;

        for &(v, w) in &graph_adj[u] {
            if !in_tree[v] && w < key[v] {
                key[v] = w;
                pq.push(Reverse((w, v)));
            }
        }
    }
    mst_weight
}

fn main() {
    let n = 5;
    let mut graph_adj = vec![vec![]; n];
    let edges = vec![(0,1,2),(0,3,6),(1,2,3),(1,3,8),(1,4,5),(2,4,7),(3,4,9)];
    for (u, v, w) in edges {
        graph_adj[u].push((v, w));
        graph_adj[v].push((u, w));
    }
    println!("MST total weight: {}", prim(&graph_adj, n));
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       8. DEPTH-FIRST SEARCH (DFS)
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Depth-First Search (DFS)",
      href: "/algorithms/graphs/dfs",
      type: "Easy",

      about: [
        { tag: "h1", text: "Depth-First Search (DFS)" },
        { tag: "p", text: "DFS explores a graph by going as deep as possible along each branch before backtracking — the opposite exploration order to BFS's level-by-level expansion. It can be implemented recursively (using the call stack implicitly) or iteratively (using an explicit stack), and both produce the same traversal order family." },
        { tag: "p", text: "DFS is the foundation for a remarkably wide range of graph algorithms beyond simple traversal: cycle detection, topological sorting (via post-order), finding connected/strongly-connected components, solving mazes, and backtracking search (subsets, permutations, N-Queens) are all DFS variants or direct applications." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "You need to explore all paths or all reachable states (backtracking problems)",
          "Cycle detection in directed or undirected graphs",
          "Computing connected components, or as the building block for Tarjan's SCC algorithm",
          "Topological sorting via post-order traversal",
          "Maze-solving or any 'is there a path' connectivity question where the shortest path doesn't matter"
        ]},
        { tag: "note", variant: "warning", text: "Recursive DFS can hit a stack overflow on very deep or very large graphs (e.g. a long chain of millions of vertices) — an iterative implementation with an explicit stack avoids this risk for production code." }
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          { tag: "p", text: "As a full traversal, DFS always visits every reachable vertex and examines every edge exactly once (or twice for undirected graphs) — there's no asymptotic shortcut even for the most favourable graph shape." },
          { tag: "ul", items: [
            "Each vertex is visited and marked exactly once: O(V)",
            "Each edge is examined exactly once when exploring from its source vertex: O(E)",
            "Total: O(V + E), unconditionally"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          { tag: "p", text: "DFS performs the same fixed sequence of operations (visit, mark, recurse/push) regardless of graph shape — the total work is structurally determined by V and E alone." },
          { tag: "ul", items: [
            "Each vertex's adjacency list is fully scanned exactly once across the whole traversal: O(E) total across all vertices",
            "Each vertex visit/mark operation: O(V) total",
            "Combined: O(V + E)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          { tag: "p", text: "No graph structure increases DFS's cost beyond visiting every vertex and edge exactly once — this matches BFS's bound exactly, since both are exhaustive traversals differing only in exploration order." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(V + E)",
            "For a dense graph, E dominates and the bound becomes O(V²), purely a consequence of edge count, not algorithmic degeneration"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "DFS needs a visited set sized to V, plus a recursion/explicit stack that in the best case (a wide, shallow graph) stays small." },
          { tag: "ul", items: ["visited set: O(V)", "stack depth in a wide/shallow graph: much less than V"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "The visited set always requires O(V) space regardless of graph shape, and stack depth is bounded by the longest simple path in the graph, which is at most V." },
          { tag: "ul", items: ["visited set: O(V)", "stack: bounded by O(V) in the worst nesting case"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          { tag: "p", text: "A graph shaped like a single long chain forces the recursion/stack depth to reach V before any backtracking occurs, the maximum possible depth." },
          { tag: "ul", items: [
            "visited set: O(V)",
            "Recursion stack (or explicit stack): up to O(V) in a maximally 'deep' graph (e.g. a straight-line chain of V vertices)",
            "Total: O(V), same asymptotic class as BFS despite the very different access pattern"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Recursive formulation:" },
        { tag: "code", language: "text", text:
`function dfs(graph, source):
    visited ← empty set
    dfsVisit(graph, source, visited)

function dfsVisit(graph, u, visited):
    visited.add(u)
    process(u)                          // e.g. record discovery order

    for v in graph.adjacent(u):
        if v not in visited:
            dfsVisit(graph, v, visited)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Mark the starting vertex as visited and process it (e.g. add to traversal order).",
          "Examine its neighbors one at a time, in whatever order the adjacency list provides.",
          "For the first unvisited neighbor found, recurse into it immediately — going as deep as possible before considering any sibling neighbors.",
          "When a vertex has no unvisited neighbors left, the recursive call returns ('backtracks') to its caller, which then continues checking its own remaining neighbors.",
          "This naturally produces a depth-first exploration order, completing one entire branch before starting the next."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: a vertex is marked visited exactly once, the moment it is first discovered, which prevents infinite loops on cyclic graphs and guarantees each vertex is processed exactly once. By induction on the recursion: dfsVisit(u) correctly visits u and then recursively visits every vertex reachable from u that hasn't already been visited by an earlier call in the traversal — so starting from the source, every vertex reachable from it is eventually visited, since each unvisited neighbor triggers a recursive call that itself is guaranteed (by the inductive hypothesis) to visit everything reachable from that neighbor." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
using namespace std;

void dfsVisit(vector<vector<int>>& graph_adj, int u, vector<bool>& visited) {
    visited[u] = true;
    cout << "Visiting: " << u << "\\n";
    for (int v : graph_adj[u])
        if (!visited[v]) dfsVisit(graph_adj, v, visited);
}

void dfs(vector<vector<int>>& graph_adj, int source, int n) {
    vector<bool> visited(n, false);
    dfsVisit(graph_adj, source, visited);
}

int main() {
    int n = 6;
    vector<vector<int>> graph_adj(n);
    auto addEdge = [&](int u, int v) {
        graph_adj[u].push_back(v);
        graph_adj[v].push_back(u);
    };
    addEdge(0,1); addEdge(0,2); addEdge(1,3);
    addEdge(1,4); addEdge(2,5);
    dfs(graph_adj, 0, n);
    return 0;
}`,

  "python": `def dfs_visit(graph_adj, u, visited):
    visited[u] = True
    print(f"Visiting: {u}")
    for v in graph_adj[u]:
        if not visited[v]:
            dfs_visit(graph_adj, v, visited)

def dfs(graph_adj, source, n):
    visited = [False] * n
    dfs_visit(graph_adj, source, visited)

if __name__ == "__main__":
    n = 6
    graph_adj = [[] for _ in range(n)]
    def add_edge(u, v):
        graph_adj[u].append(v); graph_adj[v].append(u)
    add_edge(0,1); add_edge(0,2); add_edge(1,3)
    add_edge(1,4); add_edge(2,5)
    dfs(graph_adj, 0, n)`,

  "java": `import java.util.*;

public class Main {
    static void dfsVisit(List<List<Integer>> graphAdj, int u, boolean[] visited) {
        visited[u] = true;
        System.out.println("Visiting: " + u);
        for (int v : graphAdj.get(u))
            if (!visited[v]) dfsVisit(graphAdj, v, visited);
    }

    static void dfs(List<List<Integer>> graphAdj, int source, int n) {
        boolean[] visited = new boolean[n];
        dfsVisit(graphAdj, source, visited);
    }

    public static void main(String[] args) {
        int n = 6;
        List<List<Integer>> graphAdj = new ArrayList<>();
        for (int i = 0; i < n; i++) graphAdj.add(new ArrayList<>());
        int[][] edges = {{0,1},{0,2},{1,3},{1,4},{2,5}};
        for (int[] e : edges) {
            graphAdj.get(e[0]).add(e[1]);
            graphAdj.get(e[1]).add(e[0]);
        }
        dfs(graphAdj, 0, n);
    }
}`,

  "js": `function dfsVisit(graphAdj, u, visited) {
    visited[u] = true;
    console.log(\`Visiting: \${u}\`);
    for (const v of graphAdj[u])
        if (!visited[v]) dfsVisit(graphAdj, v, visited);
}

function dfs(graphAdj, source, n) {
    const visited = new Array(n).fill(false);
    dfsVisit(graphAdj, source, visited);
}

const n = 6;
const graphAdj = Array.from({length: n}, () => []);
const addEdge = (u, v) => { graphAdj[u].push(v); graphAdj[v].push(u); };
addEdge(0,1); addEdge(0,2); addEdge(1,3); addEdge(1,4); addEdge(2,5);
dfs(graphAdj, 0, n);`,

  "c": `#include <stdio.h>
#define MAXN 100

int graph_adj[MAXN][MAXN], deg[MAXN], visited[MAXN];

void addEdge(int u, int v) {
    graph_adj[u][deg[u]++] = v;
    graph_adj[v][deg[v]++] = u;
}

void dfsVisit(int u) {
    visited[u] = 1;
    printf("Visiting: %d\\n", u);
    for (int i = 0; i < deg[u]; i++)
        if (!visited[graph_adj[u][i]])
            dfsVisit(graph_adj[u][i]);
}

int main() {
    int n = 6;
    for (int i = 0; i < n; i++) { deg[i] = 0; visited[i] = 0; }
    addEdge(0,1); addEdge(0,2); addEdge(1,3);
    addEdge(1,4); addEdge(2,5);
    dfsVisit(0);
    return 0;
}`,

  "c#": `using System;
using System.Collections.Generic;

class Program {
    static void DfsVisit(List<int>[] graphAdj, int u, bool[] visited) {
        visited[u] = true;
        Console.WriteLine($"Visiting: {u}");
        foreach (int v in graphAdj[u])
            if (!visited[v]) DfsVisit(graphAdj, v, visited);
    }

    static void Dfs(List<int>[] graphAdj, int source, int n) {
        bool[] visited = new bool[n];
        DfsVisit(graphAdj, source, visited);
    }

    static void Main() {
        int n = 6;
        var graphAdj = new List<int>[n];
        for (int i = 0; i < n; i++) graphAdj[i] = new List<int>();
        int[][] edges = {{0,1},{0,2},{1,3},{1,4},{2,5}};
        foreach (var e in edges) { graphAdj[e[0]].Add(e[1]); graphAdj[e[1]].Add(e[0]); }
        Dfs(graphAdj, 0, n);
    }
}`,

  "swift": `func dfsVisit(graphAdj: [[Int]], u: Int, visited: inout [Bool]) {
    visited[u] = true
    print("Visiting: \\(u)")
    for v in graphAdj[u] {
        if !visited[v] { dfsVisit(graphAdj: graphAdj, u: v, visited: &visited) }
    }
}

func dfs(graphAdj: [[Int]], source: Int, n: Int) {
    var visited = Array(repeating: false, count: n)
    dfsVisit(graphAdj: graphAdj, u: source, visited: &visited)
}

var graphAdj = [[Int]](repeating: [], count: 6)
let edges = [(0,1),(0,2),(1,3),(1,4),(2,5)]
for (u, v) in edges { graphAdj[u].append(v); graphAdj[v].append(u) }
dfs(graphAdj: graphAdj, source: 0, n: 6)`,

  "kotlin": `fun dfsVisit(graphAdj: Array<MutableList<Int>>, u: Int, visited: BooleanArray) {
    visited[u] = true
    println("Visiting: $u")
    for (v in graphAdj[u])
        if (!visited[v]) dfsVisit(graphAdj, v, visited)
}

fun dfs(graphAdj: Array<MutableList<Int>>, source: Int, n: Int) {
    val visited = BooleanArray(n)
    dfsVisit(graphAdj, source, visited)
}

fun main() {
    val n = 6
    val graphAdj = Array(n) { mutableListOf<Int>() }
    val edges = listOf(0 to 1, 0 to 2, 1 to 3, 1 to 4, 2 to 5)
    for ((u, v) in edges) { graphAdj[u].add(v); graphAdj[v].add(u) }
    dfs(graphAdj, 0, n)
}`,

  "scala": `object Main extends App {
    def dfsVisit(graphAdj: Array[scala.collection.mutable.ListBuffer[Int]],
                 u: Int, visited: Array[Boolean]): Unit = {
        visited(u) = true
        println(s"Visiting: $u")
        for (v <- graphAdj(u) if !visited(v)) dfsVisit(graphAdj, v, visited)
    }

    def dfs(graphAdj: Array[scala.collection.mutable.ListBuffer[Int]],
            source: Int, n: Int): Unit = {
        val visited = Array.fill(n)(false)
        dfsVisit(graphAdj, source, visited)
    }

    val n = 6
    val graphAdj = Array.fill(n)(scala.collection.mutable.ListBuffer[Int]())
    val edges = List((0,1),(0,2),(1,3),(1,4),(2,5))
    for ((u, v) <- edges) { graphAdj(u) += v; graphAdj(v) += u }
    dfs(graphAdj, 0, n)
}`,

  "go": `package main

import "fmt"

func dfsVisit(graphAdj [][]int, u int, visited []bool) {
    visited[u] = true
    fmt.Printf("Visiting: %d\\n", u)
    for _, v := range graphAdj[u] {
        if !visited[v] { dfsVisit(graphAdj, v, visited) }
    }
}

func dfs(graphAdj [][]int, source, n int) {
    visited := make([]bool, n)
    dfsVisit(graphAdj, source, visited)
}

func main() {
    n := 6
    graphAdj := make([][]int, n)
    addEdge := func(u, v int) {
        graphAdj[u] = append(graphAdj[u], v)
        graphAdj[v] = append(graphAdj[v], u)
    }
    addEdge(0,1); addEdge(0,2); addEdge(1,3); addEdge(1,4); addEdge(2,5)
    dfs(graphAdj, 0, n)
}`,

  "rust": `fn dfs_visit(graph_adj: &Vec<Vec<usize>>, u: usize, visited: &mut Vec<bool>) {
    visited[u] = true;
    println!("Visiting: {}", u);
    for &v in &graph_adj[u] {
        if !visited[v] { dfs_visit(graph_adj, v, visited); }
    }
}

fn dfs(graph_adj: &Vec<Vec<usize>>, source: usize, n: usize) {
    let mut visited = vec![false; n];
    dfs_visit(graph_adj, source, &mut visited);
}

fn main() {
    let n = 6;
    let mut graph_adj = vec![vec![]; n];
    let edges = vec![(0,1),(0,2),(1,3),(1,4),(2,5)];
    for (u, v) in edges {
        graph_adj[u].push(v);
        graph_adj[v].push(u);
    }
    dfs(&graph_adj, 0, n);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       9. TARJAN'S SCC
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Tarjan's SCC",
      href: "/algorithms/graphs/tarjans",
      type: "Hard",

      about: [
        { tag: "h1", text: "Tarjan's Strongly Connected Components Algorithm" },
        { tag: "p", text: "Tarjan's SCC algorithm, devised by Robert Tarjan in 1972, finds all Strongly Connected Components of a directed graph — maximal groups of vertices where every vertex can reach every other vertex in the group via directed edges — in a single DFS pass, without needing to transpose the graph or run DFS twice (unlike Kosaraju's alternative algorithm)." },
        { tag: "p", text: "It works by tracking two values per vertex during DFS: a discovery index (the order in which vertices are first visited) and a 'left-link' value (the smallest discovery index reachable from that vertex via the DFS tree plus at most one back-edge). A vertex is the 'root' of an SCC exactly when its left-link equals its own discovery index — at that point, every vertex currently on an auxiliary stack above it (inclusive) forms one complete SCC, and they're popped off together." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Finding strongly connected components in a directed graph (e.g. detecting cyclic dependency clusters, web page clustering, circuit analysis)",
          "Building a condensation graph (collapsing each SCC into a single node) to analyse the DAG of components — useful as a preprocessing step for many directed-graph problems",
          "2-SAT problem solving (boolean satisfiability with implication graphs), which reduces directly to SCC detection",
          "You need a single-pass solution and want to avoid the graph-transpose step required by Kosaraju's algorithm"
        ]},
        { tag: "note", variant: "tip", text: "Every strongly connected component containing more than one vertex necessarily contains at least one cycle — so Tarjan's SCC is also a valid (if somewhat heavyweight) way to detect cycles in a directed graph." }
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          { tag: "p", text: "Tarjan's algorithm is built on a single DFS pass, augmented with constant extra bookkeeping per vertex and edge — so its cost structure is identical to plain DFS's: every vertex and edge is visited exactly once, with no early-exit shortcut." },
          { tag: "ul", items: [
            "DFS visits each vertex once: O(V)",
            "DFS examines each edge once: O(E)",
            "Low-link updates and stack push/pop operations are O(1) per vertex: adds no extra asymptotic cost",
            "Total: O(V + E), identical structure to plain DFS"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          { tag: "p", text: "The discovery-index and left-link tracking, along with the auxiliary stack management, all perform fixed O(1) work per vertex/edge regardless of how the SCCs happen to be structured in the input graph." },
          { tag: "ul", items: [
            "Same O(V + E) DFS backbone as best case",
            "Stack operations (push on discovery, pop on SCC root detection) total O(V) across the whole algorithm, since each vertex is pushed and popped exactly once"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          { tag: "p", text: "No graph structure — whether the entire graph is one giant SCC, or every vertex is its own trivial SCC — increases the cost beyond the standard single-pass DFS bound." },
          { tag: "ul", items: [
            "Worst case matches best/average exactly: O(V + E)",
            "This is asymptotically identical to Kosaraju's two-pass algorithm despite Tarjan's needing only one DFS traversal — the single-pass approach mainly offers a better constant factor and avoids the graph-transpose step, not a better Big-O class"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "The algorithm needs discovery-index and left-link arrays, an 'on-stack' boolean tracker, and the auxiliary stack itself — all sized to V." },
          { tag: "ul", items: ["discoveryIndex[], lowLink[]: O(V) each", "onStack[] boolean array: O(V)", "auxiliary stack: up to O(V)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage is fixed by vertex count alone, since every tracking array and the auxiliary stack must accommodate every vertex regardless of how many SCCs the graph actually decomposes into." },
          { tag: "ul", items: ["Same O(V) bound regardless of SCC count or distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          { tag: "p", text: "Even in the degenerate case of one single SCC spanning the entire graph, the auxiliary stack only ever holds each vertex once before it's popped — never exceeding O(V)." },
          { tag: "ul", items: [
            "discoveryIndex[], lowLink[], onStack[]: O(V) each",
            "Auxiliary stack: bounded by O(V), since each vertex is pushed exactly once",
            "DFS recursion stack: up to O(V) in the worst case of a deep graph",
            "Total: O(V)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function tarjanSCC(graph):
    index    ← 0
    stack    ← empty stack
    onStack  ← map of vertex → false
    disc     ← map of vertex → undefined
    left      ← map of vertex → undefined
    sccs     ← empty list

    for v in graph.vertices:
        if disc[v] is undefined:
            strongConnect(v)

    function strongConnect(u):
        disc[u] ← index
        left[u]  ← index
        index ← index + 1
        push u onto stack
        onStack[u] ← true

        for v in graph.adjacent(u):
            if disc[v] is undefined:
                strongConnect(v)
                left[u] ← min(left[u], left[v])
            else if onStack[v]:
                left[u] ← min(left[u], disc[v])

        if left[u] == disc[u]:          // u is the root of an SCC
            newSCC ← empty list
            repeat:
                w ← pop from stack
                onStack[w] ← false
                add w to newSCC
            until w == u
            sccs.append(newSCC)

    return sccs` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Run a standard DFS, but assign each vertex a discovery index (the order it was first visited) and initialise its left-link value to the same index.",
          "Push each vertex onto an auxiliary stack as soon as it's discovered, and mark it as 'on stack'.",
          "When exploring an edge to an already-visited vertex that's still on the stack, that's a 'back edge' (or cross edge to the same component) — update the current vertex's left-link to the minimum of its current left-link and the target's discovery index.",
          "When exploring an edge to an unvisited vertex, recurse into it first, then update the current vertex's left-link using the child's resulting left-link (not its discovery index) — this propagates 'how far back' the subtree can reach.",
          "After processing all of a vertex's neighbors, check if its left-link equals its own discovery index — if so, it's the root of a complete SCC: pop vertices off the stack until (and including) this vertex, and that popped group is exactly one SCC."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The left-link value of a vertex u, by construction, represents the smallest discovery index reachable from u's DFS subtree via tree edges plus at most one back/cross edge to a vertex still on the stack (i.e. still part of an unfinished SCC). A vertex u is the root of its SCC exactly when left[u] == disc[u] — meaning no vertex in u's subtree can reach back to an ancestor of u, so u's subtree (restricted to the still-on-stack vertices) cannot be merged with any SCC further up the DFS tree. Popping the stack down to and including u therefore yields exactly the set of vertices mutually reachable through u, which is by definition u's complete strongly connected component, and this argument applies recursively to every SCC root encountered during the traversal." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>
using namespace std;

// 1. Box primitive global variables inside vectors to bypass 
// the interpreter's primitive pass-by-value bug across function frames.
vector<int> timer_box;
vector<vector<int>> graph_adj;
vector<int> disc;
vector<int> low;
vector<bool> onStack;
stack<int> stk;
vector<vector<int>> sccs;

void strongConnect(int u) {
    // 2. Use the boxed timer value
    disc[u] = timer_box[0];
    low[u] = timer_box[0];
    timer_box[0]++;
    
    stk.push(u); 
    onStack[u] = true;

    for (int v : graph_adj[u]) {
        if (disc[v] == -1) {
            strongConnect(v);
            low[u] = min(low[u], low[v]);
        } else if (onStack[v]) {
            low[u] = min(low[u], disc[v]);
        }
    }

    if (low[u] == disc[u]) {
        vector<int> scc;
        while (true) {
            int w = stk.top(); 
            stk.pop();
            onStack[w] = false;
            scc.push_back(w);
            if (w == u) break;
        }
        sccs.push_back(scc);
    }
}

int main() {
    int n = 8;
    // Initialize our boxed timer
    timer_box.push_back(0); 
    
    // Dynamically initialize the global vectors 
    for (int i = 0; i < n; i++) {
        vector<int> row;
        graph_adj.push_back(row);
        disc.push_back(-1);
        low.push_back(0);
        onStack.push_back(false);
    }
    
    // Add edges
    graph_adj[0].push_back(1);
    graph_adj[1].push_back(2);
    graph_adj[2].push_back(0);
    graph_adj[1].push_back(3);
    graph_adj[3].push_back(4);
    graph_adj[4].push_back(5);
    graph_adj[5].push_back(3);
    graph_adj[4].push_back(6);
    graph_adj[6].push_back(7);
    graph_adj[7].push_back(6);

    for (int i = 0; i < n; i++) {
        if (disc[i] == -1) {
            strongConnect(i);
        }
    }

    cout << "Strongly Connected Components:\n";
    for (auto& scc : sccs) {
        cout << "  { ";
        for (int v : scc) cout << v << " ";
        cout << "}\n";
    }
    return 0;
}
`,

  "python": `def tarjan_scc(graph_adj, n):
    disc = [-1] * n
    low = [0] * n
    on_stack = [False] * n
    stack = []
    sccs = []
    timer = [0]

    def strong_connect(u):
        disc[u] = low[u] = timer[0]; timer[0] += 1
        stack.append(u); on_stack[u] = True

        for v in graph_adj[u]:
            if disc[v] == -1:
                strong_connect(v)
                low[u] = min(low[u], low[v])
            elif on_stack[v]:
                low[u] = min(low[u], disc[v])

        if low[u] == disc[u]:
            scc = []
            while True:
                w = stack.pop(); on_stack[w] = False; scc.append(w)
                if w == u: break
            sccs.append(scc)

    for i in range(n):
        if disc[i] == -1:
            strong_connect(i)
    return sccs

if __name__ == "__main__":
    n = 8
    graph_adj = [[] for _ in range(n)]
    edges = [(0,1),(1,2),(2,0),(1,3),(3,4),(4,5),(5,3),(4,6),(6,7),(7,6)]
    for u, v in edges: graph_adj[u].append(v)

    sccs = tarjan_scc(graph_adj, n)
    print("Strongly Connected Components:")
    for scc in sccs: print(" ", scc)`,

  "java": `import java.util.*;

public class Main {
    static int n, timer;
    static int[] disc, low;
    static boolean[] onStack;
    static Deque<Integer> stack;
    static List<List<Integer>> graphAdj, sccs;

    static void strongConnect(int u) {
        disc[u] = low[u] = timer++;
        stack.push(u); onStack[u] = true;

        for (int v : graphAdj.get(u)) {
            if (disc[v] == -1) {
                strongConnect(v);
                low[u] = Math.min(low[u], low[v]);
            } else if (onStack[v]) {
                low[u] = Math.min(low[u], disc[v]);
            }
        }

        if (low[u] == disc[u]) {
            List<Integer> scc = new ArrayList<>();
            while (true) {
                int w = stack.pop();
                onStack[w] = false;
                scc.add(w);
                if (w == u) break;
            }
            sccs.add(scc);
        }
    }

    public static void main(String[] args) {
        n = 8; timer = 0;
        disc = new int[n]; Arrays.fill(disc, -1);
        low = new int[n]; onStack = new boolean[n];
        stack = new ArrayDeque<>(); sccs = new ArrayList<>();
        graphAdj = new ArrayList<>();
        for (int i = 0; i < n; i++) graphAdj.add(new ArrayList<>());

        int[][] edges = {{0,1},{1,2},{2,0},{1,3},{3,4},{4,5},{5,3},{4,6},{6,7},{7,6}};
        for (int[] e : edges) graphAdj.get(e[0]).add(e[1]);

        for (int i = 0; i < n; i++) if (disc[i] == -1) strongConnect(i);

        System.out.println("Strongly Connected Components:");
        for (List<Integer> scc : sccs) System.out.println("  " + scc);
    }
}`,

  "js": `function tarjanSCC(graphAdj, n) {
    const disc = new Array(n).fill(-1);
    const low = new Array(n).fill(0);
    const onStack = new Array(n).fill(false);
    const stack = [];
    const sccs = [];
    let timer = 0;

    function strongConnect(u) {
        disc[u] = low[u] = timer++;
        stack.push(u); onStack[u] = true;

        for (const v of graphAdj[u]) {
            if (disc[v] === -1) {
                strongConnect(v);
                low[u] = Math.min(low[u], low[v]);
            } else if (onStack[v]) {
                low[u] = Math.min(low[u], disc[v]);
            }
        }

        if (low[u] === disc[u]) {
            const scc = [];
            while (true) {
                const w = stack.pop(); onStack[w] = false; scc.push(w);
                if (w === u) break;
            }
            sccs.push(scc);
        }
    }

    for (let i = 0; i < n; i++) if (disc[i] === -1) strongConnect(i);
    return sccs;
}

const n = 8;
const graphAdj = Array.from({length: n}, () => []);
const edges = [[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,3],[4,6],[6,7],[7,6]];
for (const [u, v] of edges) graphAdj[u].push(v);
const sccs = tarjanSCC(graphAdj, n);
console.log("Strongly Connected Components:");
sccs.forEach(scc => console.log(" ", scc));`,

  "c": `#include <stdio.h>
#include <string.h>
#define MAXN 100

int graph_adj[MAXN][MAXN], deg[MAXN];
int disc[MAXN], low[MAXN], onStack[MAXN];
int stk[MAXN], top_stk = 0, timer_val = 0;
int scc[MAXN][MAXN], scc_size[MAXN], num_scc = 0;

void addEdge(int u, int v) { graph_adj[u][deg[u]++] = v; }

int min2(int a, int b) { return a < b ? a : b; }

void strongConnect(int u) {
    disc[u] = low[u] = timer_val++;
    stk[top_stk++] = u; onStack[u] = 1;

    for (int i = 0; i < deg[u]; i++) {
        int v = graph_adj[u][i];
        if (disc[v] == -1) {
            strongConnect(v);
            low[u] = min2(low[u], low[v]);
        } else if (onStack[v]) {
            low[u] = min2(low[u], disc[v]);
        }
    }

    if (low[u] == disc[u]) {
        int idx = num_scc; scc_size[idx] = 0;
        while (1) {
            int w = stk[--top_stk]; onStack[w] = 0;
            scc[idx][scc_size[idx]++] = w;
            if (w == u) break;
        }
        num_scc++;
    }
}

int main() {
    int n = 8;
    memset(deg, 0, sizeof(deg)); memset(disc, -1, sizeof(disc));
    memset(onStack, 0, sizeof(onStack));
    int edges[][2] = {{0,1},{1,2},{2,0},{1,3},{3,4},{4,5},{5,3},{4,6},{6,7},{7,6}};
    for (int i = 0; i < 10; i++) addEdge(edges[i][0], edges[i][1]);
    for (int i = 0; i < n; i++) if (disc[i] == -1) strongConnect(i);

    printf("Strongly Connected Components:\\n");
    for (int i = 0; i < num_scc; i++) {
        printf("  { ");
        for (int j = 0; j < scc_size[i]; j++) printf("%d ", scc[i][j]);
        printf("}\\n");
    }
    return 0;
}`,

  "c#": `using System;
using System.Collections.Generic;

class Program {
    static int n, timer;
    static int[] disc, low;
    static bool[] onStack;
    static Stack<int> stack;
    static List<int>[] graphAdj;
    static List<List<int>> sccs;

    static void StrongConnect(int u) {
        disc[u] = low[u] = timer++;
        stack.Push(u); onStack[u] = true;

        foreach (int v in graphAdj[u]) {
            if (disc[v] == -1) {
                StrongConnect(v);
                low[u] = Math.Min(low[u], low[v]);
            } else if (onStack[v]) {
                low[u] = Math.Min(low[u], disc[v]);
            }
        }

        if (low[u] == disc[u]) {
            var scc = new List<int>();
            while (true) {
                int w = stack.Pop(); onStack[w] = false; scc.Add(w);
                if (w == u) break;
            }
            sccs.Add(scc);
        }
    }

    static void Main() {
        n = 8; timer = 0;
        disc = new int[n]; Array.Fill(disc, -1);
        low = new int[n]; onStack = new bool[n];
        stack = new Stack<int>(); sccs = new List<List<int>>();
        graphAdj = new List<int>[n];
        for (int i = 0; i < n; i++) graphAdj[i] = new List<int>();

        int[][] edges = {{0,1},{1,2},{2,0},{1,3},{3,4},{4,5},{5,3},{4,6},{6,7},{7,6}};
        foreach (var e in edges) graphAdj[e[0]].Add(e[1]);

        for (int i = 0; i < n; i++) if (disc[i] == -1) StrongConnect(i);

        Console.WriteLine("Strongly Connected Components:");
        foreach (var scc in sccs)
            Console.WriteLine("  [" + string.Join(", ", scc) + "]");
    }
}`,

  "swift": `func tarjanSCC(graphAdj: [[Int]], n: Int) -> [[Int]] {
    var disc = Array(repeating: -1, count: n)
    var low = Array(repeating: 0, count: n)
    var onStack = Array(repeating: false, count: n)
    var stack = [Int]()
    var sccs = [[Int]]()
    var timer = 0

    func strongConnect(_ u: Int) {
        disc[u] = timer; low[u] = timer; timer += 1
        stack.append(u); onStack[u] = true

        for v in graphAdj[u] {
            if disc[v] == -1 {
                strongConnect(v)
                low[u] = min(low[u], low[v])
            } else if onStack[v] {
                low[u] = min(low[u], disc[v])
            }
        }

        if low[u] == disc[u] {
            var scc = [Int]()
            while true {
                let w = stack.removeLast(); onStack[w] = false; scc.append(w)
                if w == u { break }
            }
            sccs.append(scc)
        }
    }

    for i in 0..<n { if disc[i] == -1 { strongConnect(i) } }
    return sccs
}

var graphAdj = [[Int]](repeating: [], count: 8)
let edges = [(0,1),(1,2),(2,0),(1,3),(3,4),(4,5),(5,3),(4,6),(6,7),(7,6)]
for (u, v) in edges { graphAdj[u].append(v) }
let sccs = tarjanSCC(graphAdj: graphAdj, n: 8)
print("Strongly Connected Components:")
for scc in sccs { print(" ", scc) }`,

  "kotlin": `fun tarjanSCC(graphAdj: Array<MutableList<Int>>, n: Int): List<List<Int>> {
    val disc = IntArray(n) { -1 }
    val low = IntArray(n)
    val onStack = BooleanArray(n)
    val stack = ArrayDeque<Int>()
    val sccs = mutableListOf<List<Int>>()
    var timer = 0

    fun strongConnect(u: Int) {
        disc[u] = timer; low[u] = timer; timer++
        stack.addLast(u); onStack[u] = true

        for (v in graphAdj[u]) {
            if (disc[v] == -1) {
                strongConnect(v)
                low[u] = minOf(low[u], low[v])
            } else if (onStack[v]) {
                low[u] = minOf(low[u], disc[v])
            }
        }

        if (low[u] == disc[u]) {
            val scc = mutableListOf<Int>()
            while (true) {
                val w = stack.removeLast(); onStack[w] = false; scc.add(w)
                if (w == u) break
            }
            sccs.add(scc)
        }
    }

    for (i in 0 until n) if (disc[i] == -1) strongConnect(i)
    return sccs
}

fun main() {
    val n = 8
    val graphAdj = Array(n) { mutableListOf<Int>() }
    val edges = listOf(0 to 1,1 to 2,2 to 0,1 to 3,3 to 4,4 to 5,5 to 3,4 to 6,6 to 7,7 to 6)
    for ((u, v) in edges) graphAdj[u].add(v)
    val sccs = tarjanSCC(graphAdj, n)
    println("Strongly Connected Components:")
    sccs.forEach { println("  $it") }
}`,

  "scala": `import scala.collection.mutable

object Main extends App {
    def tarjanSCC(graphAdj: Array[mutable.ListBuffer[Int]], n: Int): List[List[Int]] = {
        val disc = Array.fill(n)(-1)
        val low = Array.fill(n)(0)
        val onStack = Array.fill(n)(false)
        val stack = mutable.Stack[Int]()
        val sccs = mutable.ListBuffer[List[Int]]()
        var timer = 0

        def strongConnect(u: Int): Unit = {
            disc(u) = timer; low(u) = timer; timer += 1
            stack.push(u); onStack(u) = true

            for (v <- graphAdj(u)) {
                if (disc(v) == -1) {
                    strongConnect(v); low(u) = low(u) min low(v)
                } else if (onStack(v)) {
                    low(u) = low(u) min disc(v)
                }
            }

            if (low(u) == disc(u)) {
                val scc = mutable.ListBuffer[Int]()
                var cont = true
                while (cont) {
                    val w = stack.pop(); onStack(w) = false; scc += w
                    if (w == u) cont = false
                }
                sccs += scc.toList
            }
        }

        for (i <- 0 until n if disc(i) == -1) strongConnect(i)
        sccs.toList
    }

    val n = 8
    val graphAdj = Array.fill(n)(mutable.ListBuffer[Int]())
    val edges = List((0,1),(1,2),(2,0),(1,3),(3,4),(4,5),(5,3),(4,6),(6,7),(7,6))
    for ((u, v) <- edges) graphAdj(u) += v

    val sccs = tarjanSCC(graphAdj, n)
    println("Strongly Connected Components:")
    sccs.foreach(scc => println(s"  $scc"))
}`,

  "go": `package main

import "fmt"

func tarjanSCC(graphAdj [][]int, n int) [][]int {
    disc := make([]int, n)
    low := make([]int, n)
    onStack := make([]bool, n)
    for i := range disc { disc[i] = -1 }
    stack := []int{}
    sccs := [][]int{}
    timer := 0

    var strongConnect func(u int)
    strongConnect = func(u int) {
        disc[u] = timer; low[u] = timer; timer++
        stack = append(stack, u); onStack[u] = true

        for _, v := range graphAdj[u] {
            if disc[v] == -1 {
                strongConnect(v)
                if low[v] < low[u] { low[u] = low[v] }
            } else if onStack[v] {
                if disc[v] < low[u] { low[u] = disc[v] }
            }
        }

        if low[u] == disc[u] {
            scc := []int{}
            for {
                w := stack[len(stack)-1]; stack = stack[:len(stack)-1]
                onStack[w] = false; scc = append(scc, w)
                if w == u { break }
            }
            sccs = append(sccs, scc)
        }
    }

    for i := 0; i < n; i++ { if disc[i] == -1 { strongConnect(i) } }
    return sccs
}

func main() {
    n := 8
    graphAdj := make([][]int, n)
    edges := [][2]int{{0,1},{1,2},{2,0},{1,3},{3,4},{4,5},{5,3},{4,6},{6,7},{7,6}}
    for _, e := range edges { graphAdj[e[0]] = append(graphAdj[e[0]], e[1]) }
    sccs := tarjanSCC(graphAdj, n)
    fmt.Println("Strongly Connected Components:")
    for _, scc := range sccs { fmt.Println(" ", scc) }
}`,

  "rust": `fn tarjan_scc(graph_adj: &Vec<Vec<usize>>, n: usize) -> Vec<Vec<usize>> {
    let mut disc = vec![usize::MAX; n];
    let mut low = vec![0usize; n];
    let mut on_stack = vec![false; n];
    let mut stack = Vec::new();
    let mut sccs = Vec::new();
    let mut timer = 0usize;

    fn strong_connect(
        u: usize, graph_adj: &Vec<Vec<usize>>, disc: &mut Vec<usize>,
        low: &mut Vec<usize>, on_stack: &mut Vec<bool>,
        stack: &mut Vec<usize>, sccs: &mut Vec<Vec<usize>>, timer: &mut usize,
    ) {
        disc[u] = *timer; low[u] = *timer; *timer += 1;
        stack.push(u); on_stack[u] = true;

        for &v in &graph_adj[u] {
            if disc[v] == usize::MAX {
                strong_connect(v, graph_adj, disc, low, on_stack, stack, sccs, timer);
                low[u] = low[u].min(low[v]);
            } else if on_stack[v] {
                low[u] = low[u].min(disc[v]);
            }
        }

        if low[u] == disc[u] {
            let mut scc = Vec::new();
            loop {
                let w = stack.pop().unwrap();
                on_stack[w] = false; scc.push(w);
                if w == u { break; }
            }
            sccs.push(scc);
        }
    }

    for i in 0..n {
        if disc[i] == usize::MAX {
            strong_connect(i, graph_adj, &mut disc, &mut low,
                          &mut on_stack, &mut stack, &mut sccs, &mut timer);
        }
    }
    sccs
}

fn main() {
    let n = 8;
    let mut graph_adj = vec![vec![]; n];
    let edges = vec![(0,1),(1,2),(2,0),(1,3),(3,4),(4,5),(5,3),(4,6),(6,7),(7,6)];
    for (u, v) in edges { graph_adj[u].push(v); }
    let sccs = tarjan_scc(&graph_adj, n);
    println!("Strongly Connected Components:");
    for scc in &sccs { println!("  {:?}", scc); }
}`
      }
    }

  ],
  desc: "BFS, DFS, Dijkstra, Bellman-Ford, Floyd",
  complexity: "O(V + E)",
  featured: true,
};



export default GRAPHS_SECTION;
