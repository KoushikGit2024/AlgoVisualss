import type { SidebarItem } from "../../definitions/types";
const pythonDeepSidebarData: SidebarItem[] = [
  {
    id: "language-basics",
    slNo: "1",
    label: "Language Basics & Types",
    icon: "code",
    children: [
      {
        id: "variables-typing",
        slNo: "1_1",
        label: "Variables & Memory Dynamic",
        children: [
          { id: "variable-assignment", label: "Variable Assignment & Namespaces", url: "/python/basics/variable-assignment", slNo: "1_1_1" },
          { id: "dynamic-typing", label: "Dynamic Typing & Duck Typing", url: "/python/basics/dynamic-typing", slNo: "1_1_2" },
          { id: "reference-counting", label: "Reference Counting & id() Function", url: "/python/basics/reference-counting", slNo: "1_1_3" },
          { id: "mutable-vs-immutable", label: "Mutable vs Immutable Objects", url: "/python/basics/mutable-vs-immutable", slNo: "1_1_4" }
        ]
      },
      {
        id: "numeric-types-deep",
        slNo: "1_2",
        label: "Numeric Data Types",
        children: [
          { id: "integers-floats", label: "Integers & Arbitrary Precision Floats", url: "/python/basics/integers-floats", slNo: "1_2_1" },
          { id: "decimal-fraction", label: "Decimal and Fraction Modules", url: "/python/basics/decimal-fraction", slNo: "1_2_2" },
          { id: "bitwise-ops", label: "Bitwise Operators & Operations", url: "/python/basics/bitwise-ops", slNo: "1_2_3" }
        ]
      },
      {
        id: "strings-deep",
        slNo: "1_3",
        label: "Strings & Text Processing",
        children: [
          { id: "string-mechanics", label: "String Slicing, Indexing, & Memory Layout", url: "/python/basics/string-mechanics", slNo: "1_3_1" },
          { id: "string-methods", label: "Built-in String Methods Deep-Dive", url: "/python/basics/string-methods", slNo: "1_3_2" },
          { id: "f-strings-interpolation", label: "Advanced f-strings & Interpolation", url: "/python/basics/f-strings", slNo: "1_3_3" }
        ]
      }
    ]
  },
  {
    id: "data-structures",
    slNo: "2",
    label: "Advanced Data Structures",
    icon: "database",
    children: [
      {
        id: "lists-sequences",
        slNo: "2_1",
        label: "Lists & Arrays",
        children: [
          { id: "list-comprehensions", label: "Nested List Comprehensions", url: "/python/collections/list-comprehensions", slNo: "2_1_1" },
          { id: "list-internals", label: "Under the Hood: CPython List Resizing", url: "/python/collections/list-internals", slNo: "2_1_2" },
          { id: "slicing-mechanics", label: "Advanced Slicing Techniques", url: "/python/collections/slicing", slNo: "2_1_3" }
        ]
      },
      {
        id: "dicts-sets",
        slNo: "2_2",
        label: "Dictionaries & Hash Maps",
        children: [
          { id: "dict-mechanics", label: "How Dictionaries Work (Hash Tables)", url: "/python/collections/dict-mechanics", slNo: "2_2_1" },
          { id: "dict-methods", label: "Views, Merging (| operator), & Defaultdicts", url: "/python/collections/dict-methods", slNo: "2_2_2" },
          { id: "set-theory", label: "Sets, Frozensets, & Mathematical Set Ops", url: "/python/collections/set-theory", slNo: "2_2_3" }
        ]
      },
      {
        id: "collections-module-deep",
        slNo: "2_3",
        label: "The Collections Module",
        children: [
          { id: "namedtuple-dataclass", label: "Namedtuple vs NamedTuple vs Dataclasses", url: "/python/collections/namedtuple-dataclass", slNo: "2_3_1" },
          { id: "counter-deque", label: "Counter, Deque, & ChainMap", url: "/python/collections/counter-deque", slNo: "2_3_2" }
        ]
      }
    ]
  },
  {
    id: "functions-closures",
    slNo: "3",
    label: "Functions & Functional Programming",
    icon: "activity",
    children: [
      {
        id: "function-arguments",
        slNo: "3_1",
        label: "Advanced Parameter Passing",
        children: [
          { id: "positional-keyword", label: "Positional-Only and Keyword-Only Arguments", url: "/python/functions/arguments", slNo: "3_1_1" },
          { id: "args-kwargs", label: "Unpacking Operators (*args, **kwargs)", url: "/python/functions/args-kwargs", slNo: "3_1_2" },
          { id: "mutable-defaults", label: "The Danger of Mutable Default Arguments", url: "/python/functions/mutable-defaults", slNo: "3_1_3" }
        ]
      },
      {
        id: "scopes-closures-deep",
        slNo: "3_2",
        label: "Scopes & Closures",
        children: [
          { id: "legb-rule", label: "LEGB Scope Resolution Scope Flow", url: "/python/functions/legb-rule", slNo: "3_2_1" },
          { id: "global-nonlocal", label: "Global vs Nonlocal Keywords", url: "/python/functions/global-nonlocal", slNo: "3_2_2" },
          { id: "closures-mechanics", label: "Function Closures & cell_contents", url: "/python/functions/closures", slNo: "3_2_3" }
        ]
      }
    ]
  },
  {
    id: "oop-deep-dive",
    slNo: "4",
    label: "Object-Oriented Programming",
    icon: "box",
    children: [
      {
        id: "classes-methods",
        slNo: "4_1",
        label: "Class Mechanics",
        children: [
          { id: "init-vs-new", label: "__new__ vs __init__ Object Creation", url: "/python/oop/init-vs-new", slNo: "4_1_1" },
          { id: "classmethod-staticmethod", label: "@classmethod vs @staticmethod", url: "/python/oop/method-types", slNo: "4_1_2" },
          { id: "property-decorator", label: "Getters, Setters, & @property", url: "/python/oop/properties", slNo: "4_1_3" }
        ]
      },
      {
        id: "inheritance-mro-deep",
        slNo: "4_2",
        label: "Advanced Inheritance",
        children: [
          { id: "multiple-inheritance", label: "Multiple Inheritance Challenges", url: "/python/oop/multiple-inheritance", slNo: "4_2_1" },
          { id: "mro-c3", label: "Method Resolution Order (MRO) & C3 Linearization", url: "/python/oop/mro", slNo: "4_2_2" },
          { id: "super-mechanics", label: "Deep Dive into super() Bound Methods", url: "/python/oop/super", slNo: "4_2_3" }
        ]
      },
      {
        id: "metaprogramming",
        slNo: "4_3",
        label: "Metaprogramming",
        children: [
          { id: "dunder-protocols", label: "Dunder Protocols (Iter, Context, Container)", url: "/python/oop/dunder-protocols", slNo: "4_3_1" },
          { id: "descriptors", label: "Descriptors Protocol (__get__, __set__)", url: "/python/oop/descriptors", slNo: "4_3_2" },
          { id: "metaclasses-core", label: "Creating Custom Metaclasses via type", url: "/python/oop/metaclasses", slNo: "4_3_3" }
        ]
      }
    ]
  },
  {
    id: "concurrency-async",
    slNo: "5",
    label: "Concurrency & Parallelism",
    icon: "cpu",
    children: [
      {
        id: "asyncio-engine",
        slNo: "5_1",
        label: "Asynchronous IO (asyncio)",
        children: [
          { id: "event-loop", label: "The Event Loop, Coroutines, & Tasks", url: "/python/concurrency/event-loop", slNo: "5_1_1" },
          { id: "async-await", label: "Async/Await Semantics & Non-blocking I/O", url: "/python/concurrency/async-await", slNo: "5_1_2" },
          { id: "async-iter-context", label: "Asynchronous Iterators & Context Managers", url: "/python/concurrency/async-structures", slNo: "5_1_3" }
        ]
      },
      {
        id: "multicore-execution",
        slNo: "5_2",
        label: "Multi-Core Execution",
        children: [
          { id: "gil-internals", label: "The Global Interpreter Lock (GIL) Architecture", url: "/python/concurrency/gil", slNo: "5_2_1" },
          { id: "threading-io", label: "Threading Module for I/O Bound Tasks", url: "/python/concurrency/threading", slNo: "5_2_2" },
          { id: "multiprocessing-cpu", label: "Multiprocessing Module for CPU Bound Tasks", url: "/python/concurrency/multiprocessing", slNo: "5_2_3" }
        ]
      }
    ]
  }
];
export default pythonDeepSidebarData;