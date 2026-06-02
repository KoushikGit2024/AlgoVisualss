import './App.css'
import AlgoDirector from './Pages/algorithms/AlgoDirector'
import Navbar from './Pages/components/Navbar'
import Sidebar from './Pages/components/Sidebar'
import DocDirector from './Pages/documentation/DocDirector'
import HomePage from './Pages/Home'
import { Routes, Route } from 'react-router-dom'
import VisualPlatforms from './Pages/visualizer/VisualPlatforms'

const App = () => {
  return (
    <div
      lang="en"
      suppressHydrationWarning
      style={{ height: "100vh", width: "100vw" }}
    >
      <div
        className="min-h-screen flex flex-col antialiased"
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        <Navbar/>

        {/* Below navbar: sidebar + main scroll area */}
        <div className="flex flex-1 w-full overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
          <Sidebar />
          <main className="flex-1 overflow-y-auto h-full">
            <Routes>
              <Route path='/' element={<HomePage/>} />
              <Route path='/algorithms' element={<AlgoDirector/>} />
              <Route path='/documentation' element={<DocDirector/>} />
              <Route path='/documentation/:topic' element={<DocDirector/>} />
              <Route path='/visualizer' element={<VisualPlatforms/>} />
              
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App