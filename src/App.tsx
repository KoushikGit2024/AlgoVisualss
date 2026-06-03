import './App.css'
import AlgoDirector from './Pages/algorithms/AlgoDirector'
import Algorithms from './Pages/algorithms/Algorithms'
import Navbar from './Pages/components/Navbar'
import Sidebar from './Pages/components/Sidebar'
import DocDirector from './Pages/documentation/DocDirector'
import HomePage from './Pages/Home'
import Documentation from './Pages/documentation/Documentation'
import { Routes, Route } from 'react-router-dom'
import VisualPlatforms from './Pages/visualizer/VisualPlatforms'
import Visualizer from './Pages/visualizer/Visualizer'

const App = () => {
  return (
    <div 
      className="min-h-screen flex flex-col bg-(--bg) text-(--text) antialiased relative selection:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] selection:text-(--accent)"
    >
      {/* ── Top Navigation ── */}
      <Navbar/>

      {/* ── App Layout Wrapper ── */}
      <div className="flex flex-1 w-full relative">
        
        {/* Sidebar handles its own sticky state internally now */}
        <Sidebar />

        {/* ── Main Content Area ── */}
        {/* min-w-0 is critical: it prevents wide child elements (like code blocks or tables) from breaking the flex layout and pushing the sidebar off-screen */}
        <main className="flex-1 min-w-0 flex flex-col relative">
          
          {/* Subtle gradient shadow under the glassmorphism navbar to blend the scrolling content smoothly */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-linear-to-b from-(--bg) to-transparent pointer-events-none z-10" />

          {/* Router Views */}
          <Routes>
            <Route path='/' element={<HomePage/>} />
            <Route path='/algorithms' element={<AlgoDirector/>} />
            <Route path='/algorithms/:topic/:subTopic?' element={<Algorithms/>} />
            <Route path='/documentation' element={<DocDirector/>} />
            <Route path='/documentation/:topic/:subTopic?' element={<Documentation/>} />
            <Route path='/visualizer' element={<VisualPlatforms/>} />
            <Route path='/visualizer/:platform/:qid?' element={<Visualizer/>} />
          </Routes>
          
        </main>
      </div>
    </div>
  )
}

export default App