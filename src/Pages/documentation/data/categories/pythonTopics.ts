import type { SidebarItem } from "../types";
const pythonDeepSidebarData: SidebarItem[] = [
  {
    id: "language-basics",
    label: "1. Language Basics & Types",
    icon: "code",
    children: [
      {
        id: "variables-typing",
        label: "Variables & Memory Dynamic",
        children: [
          { id: "variable-assignment", label: "Variable Assignment & Namespaces", url: "/python/basics/variable-assignment" },
          { id: "dynamic-typing", label: "Dynamic Typing & Duck Typing", url: "/python/basics/dynamic-typing" },
          { id: "reference-counting", label: "Reference Counting & id() Function", url: "/python/basics/reference-counting" },
          { id: "mutable-vs-immutable", label: "Mutable vs Immutable Objects", url: "/python/basics/mutable-vs-immutable" }
        ]
      },
      {
        id: "numeric-types-deep",
        label: "Numeric Data Types",
        children: [
          { id: "integers-floats", label: "Integers & Arbitrary Precision Floats", url: "/python/basics/integers-floats" },
          { id: "decimal-fraction", label: "Decimal and Fraction Modules", url: "/python/basics/decimal-fraction" },
          { id: "bitwise-ops", label: "Bitwise Operators & Operations", url: "/python/basics/bitwise-ops" }
        ]
      },
      {
        id: "strings-deep",
        label: "Strings & Text Processing",
        children: [
          { id: "string-mechanics", label: "String Slicing, Indexing, & Memory Layout", url: "/python/basics/string-mechanics" },
          { id: "string-methods", label: "Built-in String Methods Deep-Dive", url: "/python/basics/string-methods" },
          { id: "f-strings-interpolation", label: "Advanced f-strings & Interpolation", url: "/python/basics/f-strings" }
        ]
      }
    ]
  },
  {
    id: "data-structures",
    label: "2. Advanced Data Structures",
    icon: "database",
    children: [
      {
        id: "lists-sequences",
        label: "Lists & Arrays",
        children: [
          { id: "list-comprehensions", label: "Nested List Comprehensions", url: "/python/collections/list-comprehensions" },
          { id: "list-internals", label: "Under the Hood: CPython List Resizing", url: "/python/collections/list-internals" },
          { id: "slicing-mechanics", label: "Advanced Slicing Techniques", url: "/python/collections/slicing" }
        ]
      },
      {
        id: "dicts-sets",
        label: "Dictionaries & Hash Maps",
        children: [
          { id: "dict-mechanics", label: "How Dictionaries Work (Hash Tables)", url: "/python/collections/dict-mechanics" },
          { id: "dict-methods", label: "Views, Merging (| operator), & Defaultdicts", url: "/python/collections/dict-methods" },
          { id: "set-theory", label: "Sets, Frozensets, & Mathematical Set Ops", url: "/python/collections/set-theory" }
        ]
      },
      {
        id: "collections-module-deep",
        label: "The Collections Module",
        children: [
          { id: "namedtuple-dataclass", label: "Namedtuple vs NamedTuple vs Dataclasses", url: "/python/collections/namedtuple-dataclass" },
          { id: "counter-deque", label: "Counter, Deque, & ChainMap", url: "/python/collections/counter-deque" }
        ]
      }
    ]
  },
  {
    id: "functions-closures",
    label: "3. Functions & Functional Programming",
    icon: "activity",
    children: [
      {
        id: "function-arguments",
        label: "Advanced Parameter Passing",
        children: [
          { id: "positional-keyword", label: "Positional-Only and Keyword-Only Arguments", url: "/python/functions/arguments" },
          { id: "args-kwargs", label: "Unpacking Operators (*args, **kwargs)", url: "/python/functions/args-kwargs" },
          { id: "mutable-defaults", label: "The Danger of Mutable Default Arguments", url: "/python/functions/mutable-defaults" }
        ]
      },
      {
        id: "scopes-closures-deep",
        label: "Scopes & Closures",
        children: [
          { id: "legb-rule", label: "LEGB Scope Resolution Scope Flow", url: "/python/functions/legb-rule" },
          { id: "global-nonlocal", label: "Global vs Nonlocal Keywords", url: "/python/functions/global-nonlocal" },
          { id: "closures-mechanics", label: "Function Closures & cell_contents", url: "/python/functions/closures" }
        ]
      }
    ]
  },
  {
    id: "oop-deep-dive",
    label: "4. Object-Oriented Programming",
    icon: "box",
    children: [
      {
        id: "classes-methods",
        label: "Class Mechanics",
        children: [
          { id: "init-vs-new", label: "__new__ vs __init__ Object Creation", url: "/python/oop/init-vs-new" },
          { id: "classmethod-staticmethod", label: "@classmethod vs @staticmethod", url: "/python/oop/method-types" },
          { id: "property-decorator", label: "Getters, Setters, & @property", url: "/python/oop/properties" }
        ]
      },
      {
        id: "inheritance-mro-deep",
        label: "Advanced Inheritance",
        children: [
          { id: "multiple-inheritance", label: "Multiple Inheritance Challenges", url: "/python/oop/multiple-inheritance" },
          { id: "mro-c3", label: "Method Resolution Order (MRO) & C3 Linearization", url: "/python/oop/mro" },
          { id: "super-mechanics", label: "Deep Dive into super() Bound Methods", url: "/python/oop/super" }
        ]
      },
      {
        id: "metaprogramming",
        label: "Metaprogramming",
        children: [
          { id: "dunder-protocols", label: "Dunder Protocols (Iter, Context, Container)", url: "/python/oop/dunder-protocols" },
          { id: "descriptors", label: "Descriptors Protocol (__get__, __set__)", url: "/python/oop/descriptors" },
          { id: "metaclasses-core", label: "Creating Custom Metaclasses via type", url: "/python/oop/metaclasses" }
        ]
      }
    ]
  },
  {
    id: "concurrency-async",
    label: "5. Concurrency & Parallelism",
    icon: "cpu",
    children: [
      {
        id: "asyncio-engine",
        label: "Asynchronous IO (asyncio)",
        children: [
          { id: "event-loop", label: "The Event Loop, Coroutines, & Tasks", url: "/python/concurrency/event-loop" },
          { id: "async-await", label: "Async/Await Semantics & Non-blocking I/O", url: "/python/concurrency/async-await" },
          { id: "async-iter-context", label: "Asynchronous Iterators & Context Managers", url: "/python/concurrency/async-structures" }
        ]
      },
      {
        id: "multicore-execution",
        label: "Multi-Core Execution",
        children: [
          { id: "gil-internals", label: "The Global Interpreter Lock (GIL) Architecture", url: "/python/concurrency/gil" },
          { id: "threading-io", label: "Threading Module for I/O Bound Tasks", url: "/python/concurrency/threading" },
          { id: "multiprocessing-cpu", label: "Multiprocessing Module for CPU Bound Tasks", url: "/python/concurrency/multiprocessing" }
        ]
      }
    ]
  }
];
export default pythonDeepSidebarData;