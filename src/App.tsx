import { lazy, Suspense } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import HomePage from './Pages/Home'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import NotFound from './Pages/NotFound'
import { ErrorBoundary } from './components/ErrorBoundary'
import Loader from './components/Loader'

const AlgoDirector = lazy(() => import('./Pages/algorithms/AlgoDirector'))
const Algorithms = lazy(() => import('./Pages/algorithms/Algorithms'))
const Editor = lazy(() => import('./Pages/editor/Editor'))
const VisualPlatforms = lazy(() => import('./Pages/visualizer/VisualPlatforms'))
const Visualizer = lazy(() => import('./Pages/visualizer/Visualizer'))

const Footer = () => {
  return (
    <footer className="w-full mt-auto border-t border-[var(--border)] bg-[var(--surface)] text-[calc(14rem/16)]">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Brand & Creator */}
        <div className="text-[var(--muted)] font-medium flex items-center gap-1.5 text-xs sm:text-sm"> 
          <span>Crafted with passion by <span className="text-[var(--text)] font-bold">Koushik</span></span>
        </div>

        {/* Right Side: Links & Socials */}
        <div className="flex items-center gap-6">
          
          {/* Page Links */}
          <Link to="/algorithms" className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
            Algorithms
          </Link>
          <Link to="/visualizer" className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
            Visualizer
          </Link>
          
          {/* Subtle Vertical Divider */}
          <div className="w-px h-4 bg-[var(--border)] hidden sm:block"></div>

          {/* Social Icon Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/KoushikGit2024/AlgoVisualss" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--muted)] hover:text-[var(--text)] transition-transform hover:scale-110 duration-200"
              aria-label="GitHub Repository"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
              </svg>
            </a>
            
            <a 
              href="https://www.linkedin.com/in/koushik-kar-409489329/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--muted)] hover:text-[#0A66C2] transition-transform hover:scale-110 duration-200"
              aria-label="LinkedIn Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>

            <a
              href="https://instagram.com/chidanand013"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted)] hover:text-[#E4405F] transition-transform hover:scale-110 duration-200"
              aria-label="Instagram Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2zm0 2h8.5A3.75 3.75 0 0 1 20 7.75v8.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4zm8.75 1a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 16.5 5zM12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6a3 3 0 0 1 0-6z" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

const App = () => {
  const location = useLocation();
  
  const isCodeWindowOpen = 
    location.pathname === "/editor" || 
    location.pathname.includes("/algorithms/") || 
    location.pathname.includes("/visualizer/");
    
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)] antialiased relative selection:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] selection:text-[var(--accent)]">
      
      {/* Navbar Container */}
      <div className="h-[64px] shrink-0 w-full z-50 relative">
        <Navbar/>
      </div>

      <div className="flex flex-1 w-full overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 min-w-0 overflow-y-auto relative styled-scrollbar scroll-smooth flex flex-col">          
          
          <div className="flex-1 flex flex-col">
            <ErrorBoundary key={location.pathname}>
              <Suspense fallback={<Loader />}>
                <Routes>
                  <Route path='/' element={<HomePage/>} />
                  <Route path='/editor' element={<Editor/>} />
                  <Route path='/algorithms' element={<AlgoDirector/>} />
                  <Route path='/algorithms/:topic/:subTopic?' element={<Algorithms/>} />
                  <Route path='/visualizer' element={<VisualPlatforms/>} />
                  <Route path='/visualizer/:platform/:qid?' element={<Visualizer/>} />
                  <Route path='*' element={<NotFound/>}/>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Footer Component */}
          {!isCodeWindowOpen && <Footer />}

        
        </main>
      </div>
    </div>
  )
}

export default App
