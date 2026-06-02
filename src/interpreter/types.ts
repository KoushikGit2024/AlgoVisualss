// src/interpreter/types.ts

/**
 * All the C++ data types our engine currently understands.
 * We throw `string` in there as a catch-all fallback so we can handle 
 * array signatures (like "int[]") or pointer stuff coming from Tree-sitter.
 */
export type CppType = "int" | "double" | "bool" | "string" | "char" | "void" | "auto" | string;

/**
 * How we represent a C++ variable's value over in JavaScript land.
 * Notice the `CppValue[]`—that's our ticket to handling arrays and nested arrays!
 */
export type CppValue = number | boolean | string | void | CppValue[] | null;

/**
 * The heartbeat of our engine. Whenever the interpreter does something, 
 * it fires off one of these. The React UI listens for these exact strings 
 * so it knows exactly when to animate things (like swapping array blocks on ASSIGN).
 */
export enum EventType {
  DECLARE = "DECLARE",                 // Hey, we just allocated a new variable!
  ASSIGN = "ASSIGN",                   // We just updated a variable or an array index.
  READ = "READ",                       // We just looked at a variable's value.
  WRITE = "WRITE",                     // Good ol' std::cout output.
  CONDITION = "CONDITION",             // Checking an if/while/for statement... true or false?
  LOOP_ENTER = "LOOP_ENTER",           // Just stepped inside a loop block.
  LOOP_ITERATION = "LOOP_ITERATION",   // Starting another lap around the loop.
  LOOP_EXIT = "LOOP_EXIT",             // Phew, we broke out of the loop.
  FUNCTION_CALL = "FUNCTION_CALL",     // Pushing a new frame to the call stack.
  FUNCTION_RETURN = "FUNCTION_RETURN"  // Popping off the stack and heading back.
}

/**
 * A single blip on the radar during execution.
 * Our internal EventEmitter uses this to keep track of things before 
 * bundling it all up into a final Snapshot for the UI.
 */
export interface ExecutionEvent {
  id: string;                          // UUID so React's map() keys don't yell at us
  step: number;                        // Chronological order (step 1, step 2, etc.)
  line: number;                        // The line of C++ code responsible for this
  type: EventType;                     // What actually happened?
  payload: Record<string, unknown>;    // The juicy details (e.g., { variable: "x", value: 10 })
}

/**
 * The holy grail object we hand over to the React frontend.
 * It tells the UI exactly *what* just happened, plus gives it a complete 
 * freeze-frame of the program's memory at that exact microsecond.
 */
export interface RuntimeSnapshot {
  step: number;
  line: number;
  event: {
    type: EventType;
    payload: Record<string, unknown>;
  };
  state: {
    variables: Record<string, CppValue>; // What's in memory right now for the active scope?
    callStack: string[];                 // E.g., ["main", "bubbleSort"] - who called who?
    scopeDepth: number;                  // Super handy for indenting nested blocks in the UI
  };
}