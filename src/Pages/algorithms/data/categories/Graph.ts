const GRAPHS_SECTION = {
  name: "Graphs",
  href: "/algorithms/graphs",
  iconId: "Graph",
  hoverIconId: "Graph",

  about: [
    { tag: "h1", text: "Graphs" },
    {
      tag: "p",
      text: "A graph is a collection of vertices (nodes) connected by edges, used to model anything with relationships: road networks, social connections, dependency chains, computer networks, and state-transition systems. Unlike trees, graphs can contain cycles and don't require a single root, which is why graph algorithms must explicitly track visited state to avoid infinite loops.",
    },
    {
      tag: "p",
      text: "Most graph algorithms fall into a handful of families: traversal (BFS, DFS — visit every reachable node), shortest path (Dijkstra, Bellman-Ford, Floyd-Warshall — find minimum-cost routes), minimum spanning tree (Kruskal, Prim — connect all nodes at minimum total edge cost), and structural analysis (Topological Sort, Tarjan's SCC — extract ordering or connectivity structure).",
    },
    { tag: "h2", text: "Representation matters" },
    {
      tag: "p",
      text: "Almost every complexity bound below is expressed in terms of V (vertices) and E (edges), and which representation you use changes the constants involved. An adjacency list (array of neighbor lists per vertex) takes O(V + E) space and is the standard choice for sparse graphs. An adjacency matrix (V×V grid of edge weights/booleans) takes O(V²) space but gives O(1) edge-existence checks, which matters for dense graphs and for Floyd-Warshall specifically.",
    },
    {
      tag: "table",
      headers: ["Algorithm", "Problem Solved", "Time", "Handles Negative Weights?"],
      rows: [
        ["[BFS](/algorithms/graphs/bfs)", "Shortest path by edge count (unweighted)", "O(V + E)", "N/A (unweighted)"],
        ["[DFS](/algorithms/graphs/dfs)", "Reachability, cycle detection, ordering", "O(V + E)", "N/A (unweighted)"],
        [
          "[Topological Sort](/algorithms/graphs/topological-sort)",
          "Linear ordering respecting DAG dependencies",
          "O(V + E)",
          "N/A",
        ],
        [
          "[Dijkstra's Algorithm](/algorithms/graphs/dijkstra)",
          "Single-source shortest path, non-negative weights",
          "O((V+E) log V)",
          "No",
        ],
        [
          "[Bellman-Ford Algorithm](/algorithms/graphs/bellman-ford)",
          "Single-source shortest path, detects negative cycles",
          "O(VE)",
          "Yes",
        ],
        [
          "[Floyd-Warshall Algorithm](/algorithms/graphs/floyd-warshall)",
          "All-pairs shortest path",
          "O(V³)",
          "Yes (no negative cycles)",
        ],
        [
          "[Kruskal's Algorithm](/algorithms/graphs/kruskal)",
          "Minimum spanning tree, edge-driven",
          "O(E log E)",
          "N/A (MST, not shortest path)",
        ],
        [
          "[Prim's Algorithm](/algorithms/graphs/prim)",
          "Minimum spanning tree, vertex-driven",
          "O((V+E) log V)",
          "N/A (MST, not shortest path)",
        ],
        [
          "[Tarjan's SCC](/algorithms/graphs/tarjans)",
          "Strongly connected components (directed graphs)",
          "O(V + E)",
          "N/A",
        ],
      ],
    },
    {
      tag: "note",
      variant: "tip",
      text: "If edge weights can be negative, Dijkstra silently produces wrong answers without warning — always reach for Bellman-Ford instead when negative weights are possible.",
    },
  ],

  items: [
    /* ════════════════════════════════════════════════════════════════════
       1. BREADTH-FIRST SEARCH (BFS)
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Breadth-First Search (BFS)",
      href: "/algorithms/graphs/bfs",
      type: "Easy",

      related: [
        { name: "Topological Sort", href: "/algorithms/graphs/topological-sort" },
        { name: "Dijkstra's Algorithm", href: "/algorithms/graphs/dijkstra" },
        { name: "Bellman-Ford Algorithm", href: "/algorithms/graphs/bellman-ford" },
        { name: "Floyd-Warshall Algorithm", href: "/algorithms/graphs/floyd-warshall" },
      ],

      about: [
        { tag: "h1", text: "Breadth-First Search (BFS)" },
        {
          tag: "p",
          text: "BFS explores a graph level by level: it visits all neighbors of the starting node first, then all neighbors of those neighbors, and so on — expanding outward in concentric 'rings' from the source. It uses a queue (FIFO) to ensure nodes are processed in the order they were discovered, which is exactly what produces the level-by-level expansion pattern.",
        },
        {
          tag: "p",
          text: "Its single most important property is that on an unweighted graph, the first time BFS reaches a node is guaranteed to be via a shortest path (fewest edges) from the source — this is why BFS is the standard algorithm for shortest-path-by-hop-count problems, not just generic traversal.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "You need the shortest path in terms of number of edges (unweighted graph)",
            "You need to find the minimum number of 'moves' or 'steps' in a state-space search (puzzle solving, word ladders, maze shortest path)",
            "You want to process a graph level-by-level (e.g. finding all nodes within k hops of a source)",
            "You need to check bipartiteness (BFS with 2-coloring) or find connected components",
          ],
        },
        {
          tag: "note",
          variant: "info",
          text: "BFS and DFS share the same O(V + E) time complexity — the choice between them is about what property you need (shortest unweighted path vs. simpler stack-based exploration), not about speed.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          {
            tag: "p",
            text: "Even if the target node is the very first neighbor discovered, BFS as a full traversal still visits every vertex and edge to maintain the queue-based invariant and avoid revisiting nodes — there's no asymptotic shortcut, though early-exit search variants can stop sooner in practice.",
          },
          {
            tag: "ul",
            items: [
              "Every vertex is enqueued and dequeued at most once: O(V)",
              "Every edge is examined exactly once (or twice for undirected graphs, a constant factor): O(E)",
              "Total: O(V + E), even in the most favourable input",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          {
            tag: "p",
            text: "BFS performs the same fixed sequence of operations (enqueue, mark visited, examine neighbors) regardless of graph shape — the total work is structurally determined by V and E, not by the specific arrangement of edges.",
          },
          {
            tag: "ul",
            items: [
              "Each vertex transitions through queue states exactly once: enqueued, then dequeued and processed — O(V) total",
              "Each edge is inspected exactly once per direction it represents — O(E) total",
              "Combined: O(V + E), regardless of graph topology",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          {
            tag: "p",
            text: "There's no adversarial graph structure that increases BFS's cost beyond visiting every vertex and edge exactly once — a dense graph with E close to V² simply makes the E term dominate, but the bound itself doesn't change form.",
          },
          {
            tag: "ul",
            items: [
              "Worst case is identical to best/average in asymptotic form: O(V + E)",
              "For a dense graph (E ≈ V²), this becomes O(V²), but that's purely a consequence of the input's edge count, not algorithmic degeneration",
              "This matches the trivial lower bound: any correct traversal must examine every reachable vertex and edge at least once",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          {
            tag: "p",
            text: "BFS needs a visited-set and a queue, both of which can hold up to V vertices in the worst layer-width scenario, even in the most favourable graph shape.",
          },
          {
            tag: "ul",
            items: ["visited set/array: O(V)", "queue: up to O(V) entries at its widest point"],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          {
            tag: "p",
            text: "Space usage scales with the number of vertices regardless of edge density, since the visited-tracking structure must accommodate every vertex.",
          },
          {
            tag: "ul",
            items: [
              "visited array: O(V)",
              "queue: bounded by O(V) since each vertex enters at most once",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          {
            tag: "p",
            text: "In a 'star' or very wide graph, an entire layer of the BFS frontier can contain almost all V vertices simultaneously in the queue, but this still stays bounded by O(V) — it never exceeds the vertex count.",
          },
          {
            tag: "ul",
            items: [
              "Maximum queue size: O(V) (bounded by total vertex count, can't exceed it)",
              "visited set: O(V)",
              "Total: O(V), independent of E",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function bfs(graph, source):
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

    return distance, parent`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Mark the source as visited and enqueue it with distance 0.",
            "Repeatedly dequeue the front of the queue (the 'oldest' discovered, not-yet-expanded node).",
            "For each of its neighbors, if not already visited, mark it visited immediately upon discovery (critical: mark visited at enqueue time, not dequeue time, to avoid duplicate enqueues), record its distance as one more than the current node's, and enqueue it.",
            "Repeat until the queue is empty — every reachable vertex has now been visited exactly once, with the shortest hop-distance recorded.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Invariant: the queue, at any point, contains vertices from at most two consecutive 'distance layers' (distance d and d+1), and the queue is ordered so all distance-d vertices are dequeued before any distance-(d+1) vertex. By induction on distance d, this guarantees the first time any vertex is discovered, it's discovered via a path of length equal to its true shortest distance from the source — a vertex at true distance d cannot be discovered before all distance-(d-1) vertices have been fully processed, since it can only be reached through one of them.",
        },
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

        python: `from collections import deque

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

        java: `import java.util.*;

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

        js: `function bfs(graphAdj, source, n) {
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

        c: `#include <stdio.h>
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

        swift: `import Foundation

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

        kotlin: `import java.util.LinkedList

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

        scala: `import scala.collection.mutable

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

        go: `package main

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

        rust: `use std::collections::VecDeque;

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
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       2. TOPOLOGICAL SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Topological Sort",
      href: "/algorithms/graphs/topological-sort",
      type: "Medium",

      related: [
        { name: "Breadth-First Search (BFS)", href: "/algorithms/graphs/bfs" },
        { name: "Dijkstra's Algorithm", href: "/algorithms/graphs/dijkstra" },
        { name: "Bellman-Ford Algorithm", href: "/algorithms/graphs/bellman-ford" },
        { name: "Floyd-Warshall Algorithm", href: "/algorithms/graphs/floyd-warshall" },
      ],

      about: [
        { tag: "h1", text: "Topological Sort" },
        {
          tag: "p",
          text: "Topological Sort produces a linear ordering of the vertices of a Directed Acyclic Graph (DAG) such that for every directed edge u → v, u appears before v in the ordering. It only makes sense for DAGs — a graph with a cycle has no valid topological order, since cyclic dependencies create a contradiction (A must come before B, but B must also come before A).",
        },
        {
          tag: "p",
          text: "Two standard approaches exist: Kahn's algorithm (BFS-based, repeatedly removing nodes with in-degree zero) and DFS-based (post-order traversal, reversed). Both run in O(V + E) and both naturally detect cycles as a side effect — Kahn's by failing to process all vertices, DFS-based by detecting a back-edge.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Build/task scheduling where some tasks depend on others completing first (build systems, package managers, course prerequisite ordering)",
            "Detecting circular dependencies (the algorithm fails or reports a cycle if one exists)",
            "Compiler/spreadsheet dependency resolution — determining the order to evaluate expressions",
            "As a preprocessing step for dynamic programming on DAGs (process nodes in topological order so all dependencies are already resolved)",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "A topological order is not necessarily unique — any graph with vertices that have no dependency relationship between them admits multiple valid orderings.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          {
            tag: "p",
            text: "Kahn's algorithm always processes every vertex once and every edge once while decrementing in-degrees, regardless of the DAG's specific shape — there's no early-exit shortcut.",
          },
          {
            tag: "ul",
            items: [
              "Initial in-degree computation: scan all edges once — O(E)",
              "Each vertex is enqueued and dequeued exactly once when its in-degree hits zero: O(V)",
              "Each edge is examined exactly once to decrement a neighbor's in-degree: O(E)",
              "Total: O(V + E)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          {
            tag: "p",
            text: "Both Kahn's and DFS-based approaches perform a fixed, structurally-determined amount of work per vertex and edge — there's no value-dependent branching that changes the iteration count.",
          },
          {
            tag: "ul",
            items: [
              "DFS-based: standard DFS traversal cost, O(V + E), plus O(V) to reverse the post-order result",
              "Kahn's: O(V + E) as above",
              "Both approaches are asymptotically identical regardless of graph shape, as long as it's a valid DAG",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          {
            tag: "p",
            text: "No DAG structure increases the cost beyond visiting every vertex and edge exactly once — even a graph that is 'almost' a total order (a single long chain) costs the same asymptotic O(V + E).",
          },
          {
            tag: "ul",
            items: [
              "Worst case matches best/average exactly: O(V + E)",
              "Cycle detection (when the graph is not actually a DAG) also completes in O(V + E) — Kahn's simply terminates with fewer than V vertices processed",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          {
            tag: "p",
            text: "Kahn's algorithm needs an in-degree array and a queue, both sized to V; the DFS-based approach needs a visited set and a result stack, also both O(V).",
          },
          { tag: "ul", items: ["in-degree array: O(V)", "queue: up to O(V)", "result list: O(V)"] },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          {
            tag: "p",
            text: "Space usage is fixed by the number of vertices, regardless of edge density or graph shape (the adjacency list itself is typically counted as O(V + E) input, not algorithm overhead).",
          },
          { tag: "ul", items: ["in-degree / visited tracking: O(V)", "output ordering: O(V)"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          {
            tag: "p",
            text: "Even a graph where the entire vertex set is simultaneously 'ready' (in-degree zero) at the start keeps the queue bounded by O(V) — it can never exceed the total vertex count.",
          },
          {
            tag: "ul",
            items: [
              "Maximum queue size: O(V)",
              "DFS recursion stack (DFS-based variant): up to O(V) in the worst case of a single long chain",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Kahn's algorithm (BFS-based):" },
        {
          tag: "code",
          language: "text",
          text: `function topologicalSort(graph):
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

    return result`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Compute the in-degree (number of incoming edges) for every vertex by scanning all edges once.",
            "Initialise a queue with every vertex that has in-degree zero — these have no unresolved dependencies and can be processed first.",
            "Repeatedly dequeue a vertex, append it to the result ordering, and 'remove' it from the graph by decrementing the in-degree of each of its neighbors.",
            "Whenever a neighbor's in-degree drops to zero, all its dependencies have now been satisfied — enqueue it.",
            "If the final result contains all V vertices, it's a valid topological order. If fewer vertices were processed, the remaining vertices form a cycle (their in-degree never reaches zero because they depend on each other).",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Invariant: a vertex is only enqueued once all of its prerequisite vertices (everything with an edge pointing to it) have already been added to the result. This directly enforces the topological-order requirement: every edge u → v has u processed (and removed from consideration) before v's in-degree can reach zero. If the graph has a cycle, every vertex in that cycle perpetually has at least one unresolved incoming edge from within the cycle, so none of them can ever reach in-degree zero — correctly signalling that no valid topological order exists.",
        },
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

        python: `from collections import deque

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

        java: `import java.util.*;

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

        js: `function topologicalSort(graphAdj, n) {
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

        c: `#include <stdio.h>
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

        swift: `func topologicalSort(graphAdj: [[Int]], n: Int) -> [Int] {
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

        kotlin: `import java.util.LinkedList

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

        scala: `import scala.collection.mutable

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

        go: `package main

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

        rust: `use std::collections::VecDeque;

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
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       3. DIJKSTRA'S ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Dijkstra's Algorithm",
      href: "/algorithms/graphs/dijkstra",
      type: "Medium",

      related: [
        { name: "Breadth-First Search (BFS)", href: "/algorithms/graphs/bfs" },
        { name: "Topological Sort", href: "/algorithms/graphs/topological-sort" },
        { name: "Bellman-Ford Algorithm", href: "/algorithms/graphs/bellman-ford" },
        { name: "Floyd-Warshall Algorithm", href: "/algorithms/graphs/floyd-warshall" },
      ],

      about: [
        { tag: "h1", text: "Dijkstra's Algorithm" },
        {
          tag: "p",
          text: "Dijkstra's Algorithm, devised by Edsger Dijkstra in 1956, finds the shortest path from a single source vertex to every other vertex in a weighted graph with non-negative edge weights. It greedily expands outward from the source, always finalising the closest not-yet-finalised vertex next, using a priority queue (min-heap) to efficiently find that closest vertex at every step.",
        },
        {
          tag: "p",
          text: "It can be thought of as a weighted generalisation of BFS: where BFS uses a plain queue and treats every edge as cost 1, Dijkstra uses a priority queue ordered by cumulative path cost, allowing it to correctly handle edges of different weights while still guaranteeing the first-finalised distance for each vertex is its true shortest distance.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Single-source shortest path on a weighted graph with all non-negative edge weights",
            "Routing/navigation problems (e.g. road networks where edge weight = distance or time)",
            "Network routing protocols (e.g. OSPF uses a Dijkstra-based approach)",
            "Any problem reducible to 'minimum cost to reach state X from state Y' where costs are non-negative",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "Dijkstra produces silently incorrect results in the presence of negative edge weights — it does not raise an error, it just returns a wrong shortest-path value, since its greedy finalisation assumes distances only ever increase.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O((V + E) log V)",
        best: [
          { tag: "h2", text: "Best Case — O((V + E) log V)" },
          {
            tag: "p",
            text: "Using a binary heap priority queue, every vertex extraction and every edge relaxation costs O(log V), and the algorithm always processes every reachable vertex and edge at least once — there's no shortcut even for the most favourable weight distribution.",
          },
          {
            tag: "ul",
            items: [
              "Each of the V vertices is extracted from the priority queue exactly once: O(V log V)",
              "Each of the E edges can trigger at most one decrease-key/insert operation: O(E log V)",
              "Combined: O((V + E) log V)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O((V + E) log V)" },
          {
            tag: "p",
            text: "The binary-heap-based implementation performs the same structural sequence of extract-min and insert/decrease-key operations regardless of the specific edge weight values, only their relative ordering affects which vertex gets extracted when, not the asymptotic operation count.",
          },
          {
            tag: "ul",
            items: [
              "V extract-min operations: O(V log V)",
              "Up to E insert/decrease-key operations (one potential relaxation per edge): O(E log V)",
              "Total: O((V + E) log V), the standard binary-heap bound",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O((V + E) log V)" },
          {
            tag: "p",
            text: "No edge-weight configuration increases Dijkstra's asymptotic cost beyond the standard bound — even a fully dense graph where every edge triggers a relaxation still fits within this envelope.",
          },
          {
            tag: "ul",
            items: [
              "Worst case matches best/average: O((V + E) log V) with a binary heap",
              "Using a Fibonacci heap instead, this improves to O(E + V log V), since decrease-key becomes O(1) amortised — relevant for very dense graphs",
              "For a dense graph (E ≈ V²), an adjacency-matrix-based O(V²) implementation (without a heap) can actually outperform the heap-based version, since the heap overhead isn't worth it when nearly every edge exists",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          {
            tag: "p",
            text: "Dijkstra maintains a distance array, a visited/finalised set, and a priority queue, all sized proportional to the number of vertices.",
          },
          {
            tag: "ul",
            items: [
              "distance array: O(V)",
              "priority queue: up to O(V) entries",
              "visited/finalised set: O(V)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          {
            tag: "p",
            text: "Space usage is fixed by vertex count, since the distance and visited tracking structures must accommodate every vertex regardless of how the priority queue churns through insertions.",
          },
          {
            tag: "ul",
            items: [
              "distance[], visited[]: O(V) each",
              "priority queue contents: bounded by O(V) distinct vertices (with decrease-key) or O(E) lazy entries (with lazy deletion)",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V + E)" },
          {
            tag: "p",
            text: "Implementations using 'lazy deletion' (inserting a new priority queue entry on every relaxation instead of updating in place) can grow the queue to O(E) entries in the worst case, though logical vertex-tracking arrays remain O(V).",
          },
          {
            tag: "ul",
            items: [
              "distance[], visited[]: O(V)",
              "Lazy-deletion priority queue: up to O(E) stale entries in the worst case",
              "True decrease-key-based implementations keep the queue strictly at O(V), trading implementation complexity for tighter space",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function dijkstra(graph_adj, source):
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

    return arr_dist`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Initialise every vertex's distance (`arr_dist`) to infinity except the source, which is 0.",
            "Use a priority queue to always extract the not-yet-finalised vertex with the smallest known distance.",
            "Set the extracted vertex to `current`. Once a vertex is finalised, its distance is guaranteed correct and will never be updated again — mark it in `arr_visit`.",
            "For each neighbor of `current`, check if reaching it through the current vertex gives a shorter path than previously known — this is called 'relaxing' the edge.",
            "If a shorter path is found, update the neighbor's distance and push the new, better distance onto the priority queue.",
            "Repeat until the priority queue is empty — every reachable vertex has been finalised with its true shortest distance.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The key invariant relies on non-negative weights: when a vertex `current` is extracted from the priority queue, its current distance value is provably its true shortest distance from the source. This holds because every vertex still in the queue has a distance ≥ `current`'s distance (by the min-heap property), and since all edge weights are non-negative, any path through a not-yet-finalised vertex could only be longer or equal — never shorter — than the direct path already found. This greedy 'finalise the closest vertex first' strategy therefore never needs to revisit or correct an already-finalised vertex, which is exactly what breaks down if negative weights are allowed.",
        },
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

        python: `import heapq

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

        java: `import java.util.*;

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

        js: `function dijkstra(graph_adj, source, n) {
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

        c: `#include <stdio.h>
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

        swift: `func dijkstra(graph_adj: [[(Int, Int)]], source: Int, n: Int) -> [Int] {
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

        kotlin: `import java.util.PriorityQueue

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

        scala: `import scala.collection.mutable

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

        go: `package main

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

        rust: `use std::collections::BinaryHeap;
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
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       4. BELLMAN-FORD ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Bellman-Ford Algorithm",
      href: "/algorithms/graphs/bellman-ford",
      type: "Hard",

      related: [
        { name: "Breadth-First Search (BFS)", href: "/algorithms/graphs/bfs" },
        { name: "Topological Sort", href: "/algorithms/graphs/topological-sort" },
        { name: "Dijkstra's Algorithm", href: "/algorithms/graphs/dijkstra" },
        { name: "Floyd-Warshall Algorithm", href: "/algorithms/graphs/floyd-warshall" },
      ],

      about: [
        { tag: "h1", text: "Bellman-Ford Algorithm" },
        {
          tag: "p",
          text: "Bellman-Ford, independently developed by Richard Bellman and Lester Ford in the 1950s, finds the shortest path from a single source to all other vertices, and unlike Dijkstra's, it correctly handles negative edge weights. It works by relaxing every edge in the graph, repeated V − 1 times — a brute-force but provably sufficient strategy for propagating correct shortest distances through the graph.",
        },
        {
          tag: "p",
          text: "Its second crucial capability is negative cycle detection: after the standard V − 1 rounds of relaxation, a single additional round is run — if any edge can still be relaxed (i.e. distance further decreases), the graph contains a negative-weight cycle reachable from the source, meaning no shortest path is well-defined (you could loop the cycle forever to decrease the path cost indefinitely).",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "The graph may contain negative edge weights (e.g. financial models with costs and gains, or arbitrage detection in currency exchange graphs)",
            "You need to detect whether a negative-weight cycle exists",
            "Distributed routing protocols where path computation must tolerate cost decreases (the basis of the original distance-vector routing protocols)",
            "When Dijkstra's non-negative-weight assumption can't be guaranteed for the problem domain",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "Bellman-Ford's V−1-round relaxation is exactly the number of edges in the longest possible simple shortest path (a path visits at most V vertices, hence at most V−1 edges) — that's why exactly V−1 rounds always suffice when no negative cycle exists.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(VE)",
        best: [
          { tag: "h2", text: "Best Case — O(VE)" },
          {
            tag: "p",
            text: "The standard implementation always performs the full V − 1 rounds of relaxing every edge, regardless of how quickly distances actually converge — there's no structural early exit in the basic version, though an optimised variant can detect early convergence.",
          },
          {
            tag: "ul",
            items: [
              "V − 1 rounds, each examining all E edges: (V−1) × E = O(VE)",
              "An early-exit optimisation (stop if a full round makes no changes) can reduce this in practice, but the worst-case asymptotic bound remains O(VE)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(VE)" },
          {
            tag: "p",
            text: "Every round performs the same fixed amount of work — examining every edge once — regardless of the specific weight values or graph topology, as long as the round count (V−1) is fixed.",
          },
          {
            tag: "ul",
            items: [
              "(V − 1) rounds × E edge examinations per round = O(VE)",
              "Each edge relaxation is O(1) — one addition and one comparison",
              "No input distribution changes this structural bound",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(VE)" },
          {
            tag: "p",
            text: "The worst case matches the average exactly — there's no graph structure that increases the cost beyond the fixed (V−1) × E relaxation rounds, plus one additional round for negative-cycle detection.",
          },
          {
            tag: "ul",
            items: [
              "(V − 1) relaxation rounds + 1 detection round, each O(E): O(VE)",
              "For a dense graph (E ≈ V²), this becomes O(V³), notably worse than Dijkstra's O((V+E) log V) — the price paid for tolerating negative weights",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          {
            tag: "p",
            text: "Only a distance array (and optionally a predecessor array for path reconstruction) is needed, both sized to the number of vertices.",
          },
          { tag: "ul", items: ["distance array: O(V)", "predecessor array (optional): O(V)"] },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          {
            tag: "p",
            text: "Space usage is fixed by vertex count alone — there's no auxiliary structure that grows with edge count or specific weight values.",
          },
          {
            tag: "ul",
            items: [
              "No priority queue or heap needed, unlike Dijkstra — just two flat arrays of size V",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          {
            tag: "p",
            text: "No graph configuration increases memory usage beyond the fixed distance and predecessor arrays — even maximal edge density doesn't change this.",
          },
          {
            tag: "ul",
            items: [
              "distance[], predecessor[]: O(V) each, regardless of E",
              "The edge list itself (input, not auxiliary) is O(E)",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function bellmanFord(graph, source):
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

    return distance`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Initialise every vertex's distance to infinity except the source, which starts at 0.",
            "Repeat exactly V − 1 times: for every edge (u, v) with weight w, check if going through u gives a shorter path to v than currently known, and update if so. This is 'relaxation'.",
            "After V − 1 full rounds, every shortest path (which can have at most V − 1 edges, since a simple path visits at most V vertices) has been fully propagated, assuming no negative cycle exists.",
            "Run one final round: if any edge can still be relaxed, that means there's a path that keeps getting shorter even after V − 1 rounds — which is only possible if a negative-weight cycle is reachable from the source.",
            "If no further relaxation is possible, the distance array holds the correct shortest path to every vertex.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Inductive claim: after k rounds of relaxing all edges, distance[v] is correct for every vertex v whose true shortest path from the source uses at most k edges. The base case (k=0) holds trivially (only the source, at distance 0, has a 0-edge path). The inductive step holds because if the true shortest path to v uses exactly k edges and ends with edge (u, v), then by the inductive hypothesis distance[u] is already correct after k−1 rounds, so round k's relaxation of edge (u,v) correctly sets distance[v]. Since any simple shortest path has at most V−1 edges, V−1 rounds guarantee correctness for all vertices — and if a valid relaxation is still possible after that, the only explanation is a negative cycle, since no simple shortest path can have more than V−1 edges.",
        },
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

        python: `def bellman_ford(n, graph_edges, source):
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

        java: `import java.util.*;

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

        js: `function bellmanFord(n, graphEdges, source) {
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

        c: `#include <stdio.h>
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

        swift: `func bellmanFord(n: Int, graphEdges: [(Int,Int,Int)], source: Int) -> [Int]? {
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

        kotlin: `fun bellmanFord(n: Int, graphEdges: List<Triple<Int,Int,Int>>, source: Int): IntArray? {
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

        scala: `object Main extends App {
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

        go: `package main

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

        rust: `fn bellman_ford(n: usize, graph_edges: &[(usize, usize, i32)], source: usize) -> Option<Vec<i32>> {
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
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       5. FLOYD-WARSHALL ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Floyd-Warshall Algorithm",
      href: "/algorithms/graphs/floyd-warshall",
      type: "Hard",

      related: [
        { name: "Breadth-First Search (BFS)", href: "/algorithms/graphs/bfs" },
        { name: "Topological Sort", href: "/algorithms/graphs/topological-sort" },
        { name: "Dijkstra's Algorithm", href: "/algorithms/graphs/dijkstra" },
        { name: "Bellman-Ford Algorithm", href: "/algorithms/graphs/bellman-ford" },
      ],

      about: [
        { tag: "h1", text: "Floyd-Warshall Algorithm" },
        {
          tag: "p",
          text: "Floyd-Warshall, developed by Robert Floyd and Stephen Warshall in 1962, computes the shortest path between every pair of vertices in a weighted graph simultaneously — an all-pairs shortest path (APSP) algorithm, in contrast to Dijkstra's and Bellman-Ford's single-source focus. It works on a V×V distance matrix using dynamic programming over an 'allowed intermediate vertex' dimension.",
        },
        {
          tag: "p",
          text: "The core idea: dist[i][j] using only vertices {1...k} as intermediates is either the same as using only {1...k-1}, or it's improved by routing through vertex k specifically (dist[i][k] + dist[k][j]). By incrementally allowing one more vertex as a possible 'waypoint' at each of V iterations, the algorithm converges to the true shortest path between every pair.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "You need shortest paths between ALL pairs of vertices, not just from one source",
            "The graph is small to medium-sized (V up to a few hundred/left thousands) — O(V³) becomes prohibitive beyond that",
            "Edge weights can be negative, as long as there are no negative-weight cycles (the algorithm can detect their presence via negative values on the diagonal)",
            "You need transitive closure of a relation (a boolean variant answers 'is there ANY path from i to j')",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "Running Dijkstra V times (once per source) costs O(V(V+E) log V), which beats Floyd-Warshall's O(V³) for sparse graphs with non-negative weights — Floyd-Warshall's simplicity and negative-weight tolerance are its real advantages, not raw speed.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(V³)",
        best: [
          { tag: "h2", text: "Best Case — O(V³)" },
          {
            tag: "p",
            text: "The algorithm always runs three fully nested loops over all V vertices (for the intermediate vertex k, and for every pair i, j), regardless of the graph's actual connectivity or weight values — there is no early exit.",
          },
          {
            tag: "ul",
            items: [
              "Outer loop over intermediate vertex k: V iterations",
              "Middle and inner loops over i and j: V × V = V² iterations each",
              "Total: V × V² = O(V³), unconditionally",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V³)" },
          {
            tag: "p",
            text: "Every cell of the V×V distance matrix is checked and potentially updated exactly once per value of k, regardless of how many actual edges exist or what values they carry.",
          },
          {
            tag: "ul",
            items: [
              "V values of k × V² (i, j) pairs per k = O(V³) total comparisons",
              "Each comparison/update is O(1)",
              "No input distribution changes this fixed triple-nested-loop structure",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V³)" },
          {
            tag: "p",
            text: "No graph configuration increases the cost beyond the fixed triple loop — this is identical to best and average case, a hallmark of dense dynamic-programming algorithms with no data-dependent branching that skips iterations.",
          },
          {
            tag: "ul",
            items: [
              "O(V³) is simultaneously the best, average, and worst case — Floyd-Warshall has no adaptive behaviour",
              "This makes it predictable but also means it can't be sped up by 'lucky' input the way Bellman-Ford's early-exit optimisation can",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(V²)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V²)" },
          {
            tag: "p",
            text: "The algorithm requires a full V×V distance matrix, since it computes and stores the shortest distance between every single pair of vertices.",
          },
          {
            tag: "ul",
            items: [
              "distance matrix: V² entries — O(V²)",
              "optional next/predecessor matrix for path reconstruction: another O(V²)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V²)" },
          {
            tag: "p",
            text: "Matrix size is fixed by vertex count alone, regardless of how many edges actually exist in the original graph — even a sparse graph still produces a dense V×V output matrix.",
          },
          {
            tag: "ul",
            items: [
              "The output is inherently dense (all-pairs distances), so space is always O(V²) regardless of input edge sparsity",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V²)" },
          {
            tag: "p",
            text: "No input increases space usage beyond the fixed V×V matrices — this is both the floor and ceiling for the algorithm's memory footprint.",
          },
          {
            tag: "ul",
            items: [
              "Distance matrix + optional path-reconstruction matrix: O(V²) total",
              "Can be done in-place (updating the same matrix across all k iterations) without needing separate matrices per iteration",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function floydWarshall(graph):
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
    return dist`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Initialise the distance matrix directly from the graph's edge weights, with 0 on the diagonal and infinity for non-adjacent pairs.",
            "For each vertex k from 0 to V−1, treat it as a newly 'allowed' intermediate stopping point.",
            "For every pair (i, j), check whether routing through k — i.e. taking the best known path from i to k, then from k to j — produces a shorter total distance than the current dist[i][j].",
            "If so, update dist[i][j] to this improved value.",
            "After all V values of k have been processed, dist[i][j] holds the true shortest distance from i to j using any vertex as an intermediate — i.e. the full graph.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Inductive claim: after processing intermediate vertex k, dist[i][j] correctly holds the shortest path from i to j using only vertices from {0, 1, ..., k} as possible intermediates. Base case (before any k is processed) holds because dist[i][j] is initialised to the direct edge weight, which is trivially the shortest path using zero intermediates. Inductive step: the shortest path from i to j using vertices up to k either avoids k entirely (so it's already captured by dist[i][j] from the previous iteration) or passes through k exactly once (since revisiting k offers no benefit), in which case it equals dist[i][k] + dist[k][j], both of which are already correctly computed using vertices up to k−1 by the inductive hypothesis. Taking the minimum of these two options correctly updates dist[i][j] for intermediates up to k. By induction, after k = V−1, all pairs are correctly computed using any vertex as an intermediate.",
        },
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

        python: `INF = float('inf')

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

        java: `import java.util.*;

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

        js: `const INF = 1e9;

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

        c: `#include <stdio.h>
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

        swift: `let INF = Int.max / 2

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

        kotlin: `fun floydWarshall(n: Int, graphEdges: List<Triple<Int,Int,Int>>): Array<IntArray> {
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

        scala: `object Main extends App {
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

        go: `package main

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

        rust: `fn floyd_warshall(n: usize, graph_edges: &[(usize, usize, i32)]) -> Vec<Vec<i32>> {
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
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       6. KRUSKAL'S ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Kruskal's Algorithm",
      href: "/algorithms/graphs/kruskal",
      type: "Medium",

      related: [
        { name: "Breadth-First Search (BFS)", href: "/algorithms/graphs/bfs" },
        { name: "Topological Sort", href: "/algorithms/graphs/topological-sort" },
        { name: "Dijkstra's Algorithm", href: "/algorithms/graphs/dijkstra" },
        { name: "Bellman-Ford Algorithm", href: "/algorithms/graphs/bellman-ford" },
      ],

      about: [
        { tag: "h1", text: "Kruskal's Algorithm" },
        {
          tag: "p",
          text: "Kruskal's Algorithm, published by Joseph Kruskal in 1956, finds a Minimum Spanning Tree (MST) — a subset of edges connecting all vertices with the minimum possible total edge weight, and no cycles. It is greedy and edge-centric: sort all edges by weight ascending, then repeatedly add the cheapest remaining edge as long as it doesn't create a cycle with edges already chosen.",
        },
        {
          tag: "p",
          text: "Cycle detection is handled efficiently using a Union-Find (Disjoint Set Union) data structure: two vertices are in the same 'set' if and only if they're already connected by previously chosen edges, so an edge creates a cycle exactly when its two endpoints are already in the same set.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Network design problems: minimum cost to connect all locations (cabling, pipelines, road networks)",
            "The graph is sparse (E close to V) — Kruskal's E log E sorting cost is then very competitive",
            "You naturally have a list of edges available (rather than needing efficient per-vertex neighbor lookup, which favours Prim's)",
            "Clustering applications: stopping Kruskal's early (before connecting everything) produces a natural hierarchical clustering",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "Kruskal's is typically preferred for sparse graphs (few edges relative to vertices), while Prim's with a Fibonacci heap is typically preferred for dense graphs — though both have the same theoretical correctness.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(E log E)",
        best: [
          { tag: "h2", text: "Best Case — O(E log E)" },
          {
            tag: "p",
            text: "Sorting all edges always dominates the cost and is required regardless of input structure — there's no shortcut even if the MST happens to be trivially the first V−1 edges in sorted order.",
          },
          {
            tag: "ul",
            items: [
              "Sorting E edges: O(E log E)",
              "Processing each edge with Union-Find (near O(1) amortised with path compression and union by rank): O(E · α(V)), where α is the inverse Ackermann function — effectively constant",
              "Total dominated by sorting: O(E log E)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(E log E)" },
          {
            tag: "p",
            text: "Both the sorting step and the union-find processing perform the same structural work regardless of edge weight distribution — comparison-based sorting is Θ(E log E) for any input, and Union-Find operations are near-constant regardless of which specific edges form the eventual MST.",
          },
          {
            tag: "ul",
            items: [
              "O(E log E) for sorting (dominates)",
              "O(E · α(V)) for the union-find based cycle checks, which is effectively O(E) for all practical purposes",
              "Total: O(E log E)",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(E log E)" },
          {
            tag: "p",
            text: "No edge weight configuration increases the cost beyond the sorting step's bound — even a graph requiring every single edge to be checked for cycles still fits within this envelope, since Union-Find operations are near-constant time.",
          },
          {
            tag: "ul",
            items: [
              "Worst case equals best/average: O(E log E)",
              "Since E ≤ V² always, this can also be expressed as O(E log V) (because log(V²) = 2 log V, a constant factor difference) — both notations are commonly seen in textbooks",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V + E)" },
          {
            tag: "p",
            text: "The algorithm needs the full edge list (O(E)) plus a Union-Find structure sized to the vertex count (O(V)).",
          },
          {
            tag: "ul",
            items: [
              "Edge list: O(E)",
              "Union-Find parent/rank arrays: O(V)",
              "MST result (at most V−1 edges): O(V)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V + E)" },
          {
            tag: "p",
            text: "Memory usage is fixed by graph size alone, since both the edge list and the union-find structure are sized independently of the specific weight values or which edges end up in the MST.",
          },
          { tag: "ul", items: ["Same O(V + E) bound regardless of edge weight distribution"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V + E)" },
          {
            tag: "p",
            text: "No graph configuration increases space beyond storing the full edge list and the fixed-size Union-Find structure.",
          },
          {
            tag: "ul",
            items: ["O(E) for edges + O(V) for Union-Find = O(V + E), identical across all cases"],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function kruskal(graph):
    mst ← empty list
    sortedEdges ← sort graph.edges by weight ascending

    unionFind ← new DisjointSet(graph.vertices)   // each vertex starts in its own set

    for (u, v, weight) in sortedEdges:
        if unionFind.find(u) != unionFind.find(v):
            mst.append((u, v, weight))
            unionFind.union(u, v)
            if length(mst) == numVertices − 1:
                break                              // MST complete

    return mst`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Sort every edge in the graph by weight, ascending — this lets the algorithm greedily consider the cheapest edges first.",
            "Initialise a Union-Find structure where every vertex starts in its own singleton set.",
            "Process edges in sorted order: for each edge (u, v), check whether u and v are already in the same set (meaning they're already connected via previously chosen MST edges).",
            "If they're in different sets, adding this edge connects two previously separate components without creating a cycle — add it to the MST and merge (union) the two sets.",
            "If they're already in the same set, adding this edge would create a cycle — skip it.",
            "Stop once V − 1 edges have been added (a spanning tree on V vertices always has exactly V − 1 edges).",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "This follows from the Cut Property of MSTs: for any partition of the vertices into two non-empty sets, the minimum-weight edge crossing that partition must be part of some MST. Processing edges in ascending weight order and only adding an edge when it connects two different components is exactly choosing, at each step, the minimum-weight edge crossing the cut between 'already-connected components' and 'everything else' — which the Cut Property guarantees is always safe to include. The greedy choice never needs to be undone, and since Union-Find correctly tracks connectivity, every cycle-forming edge is correctly rejected, yielding a true minimum spanning tree.",
        },
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

        python: `def find(parent, x):
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

        java: `import java.util.*;

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

        js: `function find(parent, x) {
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

        c: `#include <stdio.h>
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

        swift: `func kruskal(n: Int, graphEdges: [(Int,Int,Int)]) -> [(Int,Int,Int)] {
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

        kotlin: `fun kruskal(n: Int, graphEdges: List<Triple<Int,Int,Int>>): List<Triple<Int,Int,Int>> {
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

        scala: `object Main extends App {
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

        go: `package main

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

        rust: `fn find(parent: &mut Vec<usize>, x: usize) -> usize {
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
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       7. PRIM'S ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Prim's Algorithm",
      href: "/algorithms/graphs/prim",
      type: "Medium",

      related: [
        { name: "Breadth-First Search (BFS)", href: "/algorithms/graphs/bfs" },
        { name: "Topological Sort", href: "/algorithms/graphs/topological-sort" },
        { name: "Dijkstra's Algorithm", href: "/algorithms/graphs/dijkstra" },
        { name: "Bellman-Ford Algorithm", href: "/algorithms/graphs/bellman-ford" },
      ],

      about: [
        { tag: "h1", text: "Prim's Algorithm" },
        {
          tag: "p",
          text: "Prim's Algorithm, developed by Robert Prim in 1957 (and earlier by Vojtěch Jarník in 1930), also finds a Minimum Spanning Tree, but is vertex-centric rather than edge-centric: it grows a single tree outward from an arbitrary starting vertex, at each step adding the cheapest edge that connects the current tree to a vertex not yet in it.",
        },
        {
          tag: "p",
          text: "Structurally, Prim's is very similar to Dijkstra's Algorithm — both use a priority queue to greedily select the 'next best' vertex — but where Dijkstra's tracks cumulative path distance from the source, Prim's tracks the minimum single edge weight connecting a vertex to the growing tree, which is what makes it build a minimum spanning tree rather than a shortest-path tree.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "The graph is dense (E close to V²) — Prim's with a Fibonacci heap achieves O(E + V log V), beating Kruskal's E log E on dense graphs",
            "You have efficient adjacency-list/neighbor access but not necessarily a sorted global edge list",
            "Network design problems identical to Kruskal's use case (minimum cabling/connection cost) — the choice between the two is mostly about graph density and implementation convenience",
            "Real-time/incremental MST construction where you're growing the tree from a fixed starting point",
          ],
        },
        {
          tag: "note",
          variant: "info",
          text: "Both Prim's and Kruskal's always produce a valid MST (the minimum total weight is unique even when the specific tree structure isn't), so the choice between them is purely about performance characteristics for the given graph density.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O((V + E) log V)",
        best: [
          { tag: "h2", text: "Best Case — O((V + E) log V)" },
          {
            tag: "p",
            text: "Using a binary heap, every vertex extraction and edge relaxation costs O(log V), and the algorithm always processes every vertex and edge at least once to build the spanning tree — there's no early exit regardless of edge weight favourability.",
          },
          {
            tag: "ul",
            items: [
              "V extract-min operations: O(V log V)",
              "Up to E decrease-key/insert operations: O(E log V)",
              "Total: O((V + E) log V), the standard binary-heap bound, identical to Dijkstra's structure",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O((V + E) log V)" },
          {
            tag: "p",
            text: "The priority-queue-driven structure performs the same fixed sequence of operations (extract minimum, examine neighbors, possibly update priority) regardless of the specific edge weight values, only their relative order affects extraction sequence, not operation count.",
          },
          {
            tag: "ul",
            items: [
              "V extractions × O(log V) + E potential updates × O(log V) = O((V + E) log V)",
              "No input distribution changes this structural bound for the standard binary-heap implementation",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O((V + E) log V)" },
          {
            tag: "p",
            text: "No graph structure increases the cost beyond the standard binary-heap bound — for a dense graph this becomes O(V² log V) with a binary heap, which is exactly why a Fibonacci heap implementation is preferred for dense graphs.",
          },
          {
            tag: "ul",
            items: [
              "Binary heap: O((V + E) log V) worst case",
              "Fibonacci heap: O(E + V log V) worst case — significantly better for dense graphs since decrease-key becomes O(1) amortised",
              "Adjacency-matrix-based O(V²) implementation (no heap at all): competitive specifically for very dense graphs where E approaches V²",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          {
            tag: "p",
            text: "Prim's maintains a key/weight array (cheapest edge weight connecting each vertex to the tree), an in-tree boolean array, and a priority queue, all sized to V.",
          },
          {
            tag: "ul",
            items: [
              "key[] (min edge weight to tree): O(V)",
              "inTree[] boolean array: O(V)",
              "priority queue: up to O(V) entries",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          {
            tag: "p",
            text: "Space usage is fixed by vertex count, since the tracking arrays must accommodate every vertex regardless of how densely connected the graph is.",
          },
          { tag: "ul", items: ["key[], inTree[]: O(V) each, independent of E"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V + E)" },
          {
            tag: "p",
            text: "Lazy-deletion priority queue implementations (pushing a new entry on every key update rather than updating in place) can grow the queue to O(E) stale entries in the worst case.",
          },
          {
            tag: "ul",
            items: [
              "key[], inTree[]: O(V)",
              "Lazy-deletion priority queue: up to O(E) entries in the worst case",
              "Decrease-key-based implementations keep this strictly at O(V)",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function prim(graph, start):
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

    return mstWeight`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Start with an arbitrary vertex; its key (cheapest known edge to the growing tree) is set to 0 since it needs no edge to join itself.",
            "Use a priority queue to always extract the not-yet-included vertex with the smallest key — the cheapest way to connect a new vertex to the existing tree.",
            "Once extracted, mark the vertex as part of the tree and add its key value to the running total MST weight.",
            "For each neighbor not yet in the tree, check if the direct edge to it is cheaper than the neighbor's currently known key — if so, this edge is now the best known way to attach that neighbor to the tree.",
            "Update the neighbor's key and push the new value onto the priority queue.",
            "Repeat until every vertex has been added to the tree.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "This also follows from the Cut Property: at every step, the current tree and the remaining unvisited vertices form a cut of the graph. The algorithm always selects the minimum-weight edge crossing that cut (the smallest key among not-yet-included vertices), which the Cut Property guarantees is safe to add to some MST. Since this greedy choice is repeated for every vertex addition and is always provably safe, the final tree — having connected all V vertices with exactly V − 1 such safe edges — is guaranteed to be a true minimum spanning tree.",
        },
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

        python: `import heapq

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

        java: `import java.util.*;

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

        js: `function prim(graphAdj, n, start = 0) {
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

        c: `#include <stdio.h>
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

        swift: `import Foundation

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

        kotlin: `import java.util.PriorityQueue

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

        scala: `import scala.collection.mutable

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

        go: `package main

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

        rust: `use std::collections::BinaryHeap;
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
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       8. DEPTH-FIRST SEARCH (DFS)
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Depth-First Search (DFS)",
      href: "/algorithms/graphs/dfs",
      type: "Easy",

      related: [
        { name: "Breadth-First Search (BFS)", href: "/algorithms/graphs/bfs" },
        { name: "Topological Sort", href: "/algorithms/graphs/topological-sort" },
        { name: "Dijkstra's Algorithm", href: "/algorithms/graphs/dijkstra" },
        { name: "Bellman-Ford Algorithm", href: "/algorithms/graphs/bellman-ford" },
      ],

      about: [
        { tag: "h1", text: "Depth-First Search (DFS)" },
        {
          tag: "p",
          text: "DFS explores a graph by going as deep as possible along each branch before backtracking — the opposite exploration order to BFS's level-by-level expansion. It can be implemented recursively (using the call stack implicitly) or iteratively (using an explicit stack), and both produce the same traversal order family.",
        },
        {
          tag: "p",
          text: "DFS is the foundation for a remarkably wide range of graph algorithms beyond simple traversal: cycle detection, topological sorting (via post-order), finding connected/strongly-connected components, solving mazes, and backtracking search (subsets, permutations, N-Queens) are all DFS variants or direct applications.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "You need to explore all paths or all reachable states (backtracking problems)",
            "Cycle detection in directed or undirected graphs",
            "Computing connected components, or as the building block for Tarjan's SCC algorithm",
            "Topological sorting via post-order traversal",
            "Maze-solving or any 'is there a path' connectivity question where the shortest path doesn't matter",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "Recursive DFS can hit a stack overflow on very deep or very large graphs (e.g. a long chain of millions of vertices) — an iterative implementation with an explicit stack avoids this risk for production code.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          {
            tag: "p",
            text: "As a full traversal, DFS always visits every reachable vertex and examines every edge exactly once (or twice for undirected graphs) — there's no asymptotic shortcut even for the most favourable graph shape.",
          },
          {
            tag: "ul",
            items: [
              "Each vertex is visited and marked exactly once: O(V)",
              "Each edge is examined exactly once when exploring from its source vertex: O(E)",
              "Total: O(V + E), unconditionally",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          {
            tag: "p",
            text: "DFS performs the same fixed sequence of operations (visit, mark, recurse/push) regardless of graph shape — the total work is structurally determined by V and E alone.",
          },
          {
            tag: "ul",
            items: [
              "Each vertex's adjacency list is fully scanned exactly once across the whole traversal: O(E) total across all vertices",
              "Each vertex visit/mark operation: O(V) total",
              "Combined: O(V + E)",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          {
            tag: "p",
            text: "No graph structure increases DFS's cost beyond visiting every vertex and edge exactly once — this matches BFS's bound exactly, since both are exhaustive traversals differing only in exploration order.",
          },
          {
            tag: "ul",
            items: [
              "Worst case identical to best/average: O(V + E)",
              "For a dense graph, E dominates and the bound becomes O(V²), purely a consequence of edge count, not algorithmic degeneration",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          {
            tag: "p",
            text: "DFS needs a visited set sized to V, plus a recursion/explicit stack that in the best case (a wide, shallow graph) stays small.",
          },
          {
            tag: "ul",
            items: ["visited set: O(V)", "stack depth in a wide/shallow graph: much less than V"],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          {
            tag: "p",
            text: "The visited set always requires O(V) space regardless of graph shape, and stack depth is bounded by the longest simple path in the graph, which is at most V.",
          },
          {
            tag: "ul",
            items: ["visited set: O(V)", "stack: bounded by O(V) in the worst nesting case"],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          {
            tag: "p",
            text: "A graph shaped like a single long chain forces the recursion/stack depth to reach V before any backtracking occurs, the maximum possible depth.",
          },
          {
            tag: "ul",
            items: [
              "visited set: O(V)",
              "Recursion stack (or explicit stack): up to O(V) in a maximally 'deep' graph (e.g. a straight-line chain of V vertices)",
              "Total: O(V), same asymptotic class as BFS despite the very different access pattern",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Recursive formulation:" },
        {
          tag: "code",
          language: "text",
          text: `function dfs(graph, source):
    visited ← empty set
    dfsVisit(graph, source, visited)

function dfsVisit(graph, u, visited):
    visited.add(u)
    process(u)                          // e.g. record discovery order

    for v in graph.adjacent(u):
        if v not in visited:
            dfsVisit(graph, v, visited)`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Mark the starting vertex as visited and process it (e.g. add to traversal order).",
            "Examine its neighbors one at a time, in whatever order the adjacency list provides.",
            "For the first unvisited neighbor found, recurse into it immediately — going as deep as possible before considering any sibling neighbors.",
            "When a vertex has no unvisited neighbors left, the recursive call returns ('backtracks') to its caller, which then continues checking its own remaining neighbors.",
            "This naturally produces a depth-first exploration order, completing one entire branch before starting the next.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Invariant: a vertex is marked visited exactly once, the moment it is first discovered, which prevents infinite loops on cyclic graphs and guarantees each vertex is processed exactly once. By induction on the recursion: dfsVisit(u) correctly visits u and then recursively visits every vertex reachable from u that hasn't already been visited by an earlier call in the traversal — so starting from the source, every vertex reachable from it is eventually visited, since each unvisited neighbor triggers a recursive call that itself is guaranteed (by the inductive hypothesis) to visit everything reachable from that neighbor.",
        },
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

        python: `def dfs_visit(graph_adj, u, visited):
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

        java: `import java.util.*;

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

        js: `function dfsVisit(graphAdj, u, visited) {
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

        c: `#include <stdio.h>
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

        swift: `func dfsVisit(graphAdj: [[Int]], u: Int, visited: inout [Bool]) {
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

        kotlin: `fun dfsVisit(graphAdj: Array<MutableList<Int>>, u: Int, visited: BooleanArray) {
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

        scala: `object Main extends App {
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

        go: `package main

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

        rust: `fn dfs_visit(graph_adj: &Vec<Vec<usize>>, u: usize, visited: &mut Vec<bool>) {
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
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       9. TARJAN'S SCC
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Tarjan's SCC",
      href: "/algorithms/graphs/tarjans",
      type: "Hard",

      related: [
        { name: "Breadth-First Search (BFS)", href: "/algorithms/graphs/bfs" },
        { name: "Topological Sort", href: "/algorithms/graphs/topological-sort" },
        { name: "Dijkstra's Algorithm", href: "/algorithms/graphs/dijkstra" },
        { name: "Bellman-Ford Algorithm", href: "/algorithms/graphs/bellman-ford" },
      ],

      about: [
        { tag: "h1", text: "Tarjan's Strongly Connected Components Algorithm" },
        {
          tag: "p",
          text: "Tarjan's SCC algorithm, devised by Robert Tarjan in 1972, finds all Strongly Connected Components of a directed graph — maximal groups of vertices where every vertex can reach every other vertex in the group via directed edges — in a single DFS pass, without needing to transpose the graph or run DFS twice (unlike Kosaraju's alternative algorithm).",
        },
        {
          tag: "p",
          text: "It works by tracking two values per vertex during DFS: a discovery index (the order in which vertices are first visited) and a 'left-link' value (the smallest discovery index reachable from that vertex via the DFS tree plus at most one back-edge). A vertex is the 'root' of an SCC exactly when its left-link equals its own discovery index — at that point, every vertex currently on an auxiliary stack above it (inclusive) forms one complete SCC, and they're popped off together.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Finding strongly connected components in a directed graph (e.g. detecting cyclic dependency clusters, web page clustering, circuit analysis)",
            "Building a condensation graph (collapsing each SCC into a single node) to analyse the DAG of components — useful as a preprocessing step for many directed-graph problems",
            "2-SAT problem solving (boolean satisfiability with implication graphs), which reduces directly to SCC detection",
            "You need a single-pass solution and want to avoid the graph-transpose step required by Kosaraju's algorithm",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "Every strongly connected component containing more than one vertex necessarily contains at least one cycle — so Tarjan's SCC is also a valid (if somewhat heavyweight) way to detect cycles in a directed graph.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          {
            tag: "p",
            text: "Tarjan's algorithm is built on a single DFS pass, augmented with constant extra bookkeeping per vertex and edge — so its cost structure is identical to plain DFS's: every vertex and edge is visited exactly once, with no early-exit shortcut.",
          },
          {
            tag: "ul",
            items: [
              "DFS visits each vertex once: O(V)",
              "DFS examines each edge once: O(E)",
              "Low-link updates and stack push/pop operations are O(1) per vertex: adds no extra asymptotic cost",
              "Total: O(V + E), identical structure to plain DFS",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          {
            tag: "p",
            text: "The discovery-index and left-link tracking, along with the auxiliary stack management, all perform fixed O(1) work per vertex/edge regardless of how the SCCs happen to be structured in the input graph.",
          },
          {
            tag: "ul",
            items: [
              "Same O(V + E) DFS backbone as best case",
              "Stack operations (push on discovery, pop on SCC root detection) total O(V) across the whole algorithm, since each vertex is pushed and popped exactly once",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          {
            tag: "p",
            text: "No graph structure — whether the entire graph is one giant SCC, or every vertex is its own trivial SCC — increases the cost beyond the standard single-pass DFS bound.",
          },
          {
            tag: "ul",
            items: [
              "Worst case matches best/average exactly: O(V + E)",
              "This is asymptotically identical to Kosaraju's two-pass algorithm despite Tarjan's needing only one DFS traversal — the single-pass approach mainly offers a better constant factor and avoids the graph-transpose step, not a better Big-O class",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          {
            tag: "p",
            text: "The algorithm needs discovery-index and left-link arrays, an 'on-stack' boolean tracker, and the auxiliary stack itself — all sized to V.",
          },
          {
            tag: "ul",
            items: [
              "discoveryIndex[], lowLink[]: O(V) each",
              "onStack[] boolean array: O(V)",
              "auxiliary stack: up to O(V)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          {
            tag: "p",
            text: "Space usage is fixed by vertex count alone, since every tracking array and the auxiliary stack must accommodate every vertex regardless of how many SCCs the graph actually decomposes into.",
          },
          { tag: "ul", items: ["Same O(V) bound regardless of SCC count or distribution"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          {
            tag: "p",
            text: "Even in the degenerate case of one single SCC spanning the entire graph, the auxiliary stack only ever holds each vertex once before it's popped — never exceeding O(V).",
          },
          {
            tag: "ul",
            items: [
              "discoveryIndex[], lowLink[], onStack[]: O(V) each",
              "Auxiliary stack: bounded by O(V), since each vertex is pushed exactly once",
              "DFS recursion stack: up to O(V) in the worst case of a deep graph",
              "Total: O(V)",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function tarjanSCC(graph):
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

    return sccs`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Run a standard DFS, but assign each vertex a discovery index (the order it was first visited) and initialise its left-link value to the same index.",
            "Push each vertex onto an auxiliary stack as soon as it's discovered, and mark it as 'on stack'.",
            "When exploring an edge to an already-visited vertex that's still on the stack, that's a 'back edge' (or cross edge to the same component) — update the current vertex's left-link to the minimum of its current left-link and the target's discovery index.",
            "When exploring an edge to an unvisited vertex, recurse into it first, then update the current vertex's left-link using the child's resulting left-link (not its discovery index) — this propagates 'how far back' the subtree can reach.",
            "After processing all of a vertex's neighbors, check if its left-link equals its own discovery index — if so, it's the root of a complete SCC: pop vertices off the stack until (and including) this vertex, and that popped group is exactly one SCC.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The left-link value of a vertex u, by construction, represents the smallest discovery index reachable from u's DFS subtree via tree edges plus at most one back/cross edge to a vertex still on the stack (i.e. still part of an unfinished SCC). A vertex u is the root of its SCC exactly when left[u] == disc[u] — meaning no vertex in u's subtree can reach back to an ancestor of u, so u's subtree (restricted to the still-on-stack vertices) cannot be merged with any SCC further up the DFS tree. Popping the stack down to and including u therefore yields exactly the set of vertices mutually reachable through u, which is by definition u's complete strongly connected component, and this argument applies recursively to every SCC root encountered during the traversal.",
        },
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

        python: `def tarjan_scc(graph_adj, n):
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

        java: `import java.util.*;

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

        js: `function tarjanSCC(graphAdj, n) {
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

        c: `#include <stdio.h>
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

        swift: `func tarjanSCC(graphAdj: [[Int]], n: Int) -> [[Int]] {
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

        kotlin: `fun tarjanSCC(graphAdj: Array<MutableList<Int>>, n: Int): List<List<Int>> {
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

        scala: `import scala.collection.mutable

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

        go: `package main

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

        rust: `fn tarjan_scc(graph_adj: &Vec<Vec<usize>>, n: usize) -> Vec<Vec<usize>> {
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
}`,
      },
    },
  ],
  desc: "BFS, DFS, Dijkstra, Bellman-Ford, Floyd",
  complexity: "O(V + E)",
  featured: true,
};

export default GRAPHS_SECTION;
