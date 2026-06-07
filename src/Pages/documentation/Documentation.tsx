import CodeWindow from "./components/parsers/CodeWindow";
import DocParser from "./components/DocParser";
import type { DocBlock } from './components/types';

export const pythonIntroDoc: DocBlock[] = [
  // 1. Introduction Paragraph with a Wikipedia link
  {
    type: "p",
    segments: [
      { type: "text", value: "Python is a high-level, general-purpose programming language created by " },
      { type: "link", value: "Guido van Rossum", href: "https://en.wikipedia.org/wiki/Guido_van_Rossum" },
      { type: "text", value: " and first released in 1991. Its core design philosophy emphasizes code readability and simplicity, making heavy use of significant indentation. Because it is dynamically typed and garbage-collected, Python allows developers to focus on solving problems rather than managing memory." }
    ]
  },

  // 2. The Python Logo
  {
    type: "img",
    src: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
    alt: "The official Python logo"
  },

  // 3. Transition Paragraph
  {
    type: "p",
    segments: [
      { type: "text", value: "One of Python's greatest strengths is its absolute versatility. It is a multi-paradigm language, meaning it does not force you to write code in just one specific way. It natively supports:" }
    ]
  },

  // 4. Unordered List of Paradigms
  {
    type: "ul",
    items: [
      "Procedural Programming: Writing code as a sequence of top-down steps and functions.",
      "Object-Oriented Programming (OOP): Grouping data and behaviors together into reusable Classes.",
      "Functional Programming: Using pure functions, iterators, and generators without mutating state."
    ]
  },

  // 5. Paragraph setting up the table
  {
    type: "p",
    segments: [
      { type: "text", value: "To understand why Python is so <a href='https://en.wikipedia.org/wiki/Python_(programming_language)' target='new_blank'>popular</a>, it helps to compare its underlying mechanics with other prominent languages like Java and C++:" }
    ]
  },

  // 6. Comparison Table
  {
    type: "table",
    header: ["Language Feature", "Python", "Java", "C++"],
    body: [
      ["Type System", "Dynamic (Duck Typing)", "Static", "Static"],
      ["Block Syntax", "Indentation (Whitespace)", "Curly Braces {}", "Curly Braces {}"],
      ["Compilation", "Interpreted (Bytecode)", "Compiled to JVM", "Compiled to Machine Code"],
      ["Memory Management", "Automatic (Garbage Collected)", "Automatic", "Manual (Pointers)"]
    ]
  },

  // 7. Paragraph introducing the code block
  {
    type: "p",
    segments: [
      { type: "text", value: "Let's look at a <code>koushik</code> practical example. Notice how Python reads almost like plain English. There are no semicolons at the end of lines, no type declarations for variables, and scope is defined purely by indentation:" }
    ]
  },

  // 8. Code Window with Output
  {
    type: "codeWindow",
    editorLanguage: "python",
    showLang: true,
    code: `def greet_students(students_list):
    """
    A simple function that iterates through a list
    and generates a personalized greeting.
    """
    for name in students_list:
        # F-strings allow easy variable injection into text
        greeting = f"Welcome to the Python course, {name}!"
        print(greeting)

# Defining a List of strings
class_roster = ["Alice", "Bob", "Charlie"]

# Executing the function
greet_students(class_roster)`,
    output: `Welcome to the Python course, Alice!
Welcome to the Python course, Bob!
Welcome to the Python course, Charlie!`
  }
];
// const Documentation = () => {

//   return (
//     <div>
//       <DocParser blocks={pythonIntroDoc}/>
//     </div>
//   )
// }

// export default Documentation
// pages/Documentation.tsx
import MdxLayout from './components/parsers/MdxLayout';
import IntroDoc from './pagesDatas/python/Intro.mdx'; // Import the MDX file directly!

export default function Documentation() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Your Navbar goes here */}
      
      {/* Wrap the MDX file in the layout so it gets the Tailwind styles */}
      <MdxLayout>
        <IntroDoc /> 
      </MdxLayout>
      
    </div>
  );
}