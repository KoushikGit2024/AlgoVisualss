import { useEffect, useRef, useState } from "react"
import { cn } from "../../lib/utils"

type Side = "left" | "right"

const CONFIG = {
  MIN: 180,
  MAX: 420,
  DEFAULT: 260,
  COLLAPSED: 60,
  SNAP_DIST: 28,
  VELOCITY_SNAP: 0.5,
}

function usePanel(key: string) {
  const [width, setWidth] = useState(CONFIG.DEFAULT)
  const [collapsed, setCollapsed] = useState(false)
  const [isDragging, setIsDragging] = useState(false) // Track drag state for smooth CSS

  useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      const { w, c } = JSON.parse(saved)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWidth(w)
      setCollapsed(c)
    }
  }, [key])

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ w: width, c: collapsed }))
  }, [width, collapsed, key])

  return { width, setWidth, collapsed, setCollapsed, isDragging, setIsDragging }
}

export default function PanelLayout({
  left,
  right,
  children,
}: {
  left: React.ReactNode
  right?: React.ReactNode
  children: React.ReactNode
}) {
  const leftPanel = usePanel("left-panel")
  const rightPanel = usePanel("right-panel")

  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  const dragging = useRef<Side | null>(null)
  const lastX = useRef(0)
  const velocity = useRef(0)
  const rafId = useRef<number | null>(null) // To store requestAnimationFrame ID

  // ---------- SNAP ----------
  const snap = (w: number) => {
    const points = [CONFIG.COLLAPSED, CONFIG.DEFAULT, CONFIG.MAX]
    let closest = points[0]
    let dist = Math.abs(w - closest)

    for (const p of points) {
      const d = Math.abs(w - p)
      if (d < dist) {
        closest = p
        dist = d
      }
    }
    return dist < CONFIG.SNAP_DIST ? closest : w
  }

  // ---------- DRAG LOGIC ----------
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current) return

      const dx = e.clientX - lastX.current
      velocity.current = dx
      lastX.current = e.clientX

      // Use requestAnimationFrame for 60fps smooth dragging
      if (rafId.current) cancelAnimationFrame(rafId.current)

      rafId.current = requestAnimationFrame(() => {
        if (dragging.current === "left" && leftRef.current) {
          let w = leftRef.current.offsetWidth + dx
          w = Math.max(CONFIG.MIN, Math.min(CONFIG.MAX, w))
          leftRef.current.style.width = `${w}px`
        }

        if (dragging.current === "right" && rightRef.current) {
          let w = rightRef.current.offsetWidth - dx
          w = Math.max(CONFIG.MIN, Math.min(CONFIG.MAX, w))
          rightRef.current.style.width = `${w}px`
        }
      })
    }

    const up = () => {
      if (!dragging.current) return

      const isLeft = dragging.current === "left"
      const ref = isLeft ? leftRef.current : rightRef.current
      const panel = isLeft ? leftPanel : rightPanel

      if (!ref) return

      let w = ref.offsetWidth

      if (Math.abs(velocity.current) > CONFIG.VELOCITY_SNAP) {
        w = velocity.current < 0 ? CONFIG.COLLAPSED : CONFIG.MAX
      } else {
        w = snap(w)
      }

      panel.setWidth(w)
      panel.setCollapsed(w <= CONFIG.COLLAPSED)
      panel.setIsDragging(false) // Re-enable CSS transitions

      ref.style.width = `${w}px`

      dragging.current = null
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)

    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [leftPanel, rightPanel])

  // ---------- HANDLE UI ----------
  const renderHandle = (side: Side) => (
    <div
      onMouseDown={(e) => {
        dragging.current = side
        lastX.current = e.clientX
        const panel = side === "left" ? leftPanel : rightPanel
        panel.setIsDragging(true) // Disable CSS transitions during drag

        document.body.style.cursor = "col-resize"
        document.body.style.userSelect = "none"
      }}
      onDoubleClick={() => {
        const panel = side === "left" ? leftPanel : rightPanel
        const ref = side === "left" ? leftRef.current : rightRef.current
        if (!ref) return

        panel.setWidth(CONFIG.DEFAULT)
        panel.setCollapsed(false)
        ref.style.width = `${CONFIG.DEFAULT}px`
      }}
      className="absolute top-0 h-full w-2 cursor-col-resize group z-10 flex items-center justify-center"
      style={side === "left" ? { right: -1 } : { left: -1 }}
    >
      <div
        className={cn(
          "h-8 w-1 rounded-full transition-all duration-200",
          "bg-gray-200 dark:bg-gray-800",
          "group-hover:bg-blue-500 group-hover:scale-x-150"
        )}
      />
    </div>
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      
      {/* LEFT PANEL */}
      <div
        ref={leftRef}
        style={{
          width: leftPanel.collapsed ? CONFIG.COLLAPSED : leftPanel.width,
        }}
        className={cn(
          "relative border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm z-20 shrink-0",
          !leftPanel.isDragging && "transition-[width] duration-300 ease-out" // Only animate when NOT dragging
        )}
      >
        {renderHandle("left")}
        <div className={cn(
          "h-full w-full overflow-hidden transition-opacity duration-200",
          leftPanel.collapsed ? "opacity-0" : "opacity-100"
        )}>
          {left}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-auto relative z-10">
        {children}
      </main>

      {/* RIGHT PANEL (If provided) */}
      {right && (
        <div
          ref={rightRef}
          style={{
            width: rightPanel.collapsed ? CONFIG.COLLAPSED : rightPanel.width,
          }}
          className={cn(
            "relative border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm z-20 shrink-0",
            !rightPanel.isDragging && "transition-[width] duration-300 ease-out"
          )}
        >
          {renderHandle("right")}
          <div className={cn(
            "h-full w-full overflow-hidden transition-opacity duration-200",
            rightPanel.collapsed ? "opacity-0" : "opacity-100"
          )}>
            {right}
          </div>
        </div>
      )}
    </div>
  )
}