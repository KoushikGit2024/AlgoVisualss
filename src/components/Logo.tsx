import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-80 group">
      <svg className="h-10" viewBox="0 0 320 90" preserveAspectRatio="xMinYMid meet" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(12, 10)">
          {/* Connecting lines */}
          <g stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <line x1="18" y1="32" x2="44" y2="10" />
            <line x1="44" y1="10" x2="70" y2="32" />
            <line x1="70" y1="32" x2="58" y2="60" />
            <line x1="30" y1="60" x2="18" y2="32" />
            <line x1="44" y1="40" x2="18" y2="32" />
            <line x1="44" y1="40" x2="44" y2="10" />
            <line x1="44" y1="40" x2="70" y2="32" />
          </g>
          
          {/* Nodes */}
          <circle cx="18" cy="32" r="4"   fill="var(--accent-2)" opacity="0.9" className="group-hover:scale-110 transition-transform origin-[18px_32px] duration-300" />
          <circle cx="44" cy="10" r="5.5" fill="var(--accent)" className="group-hover:scale-110 transition-transform origin-[44px_10px] duration-300" />
          <circle cx="70" cy="32" r="4"   fill="var(--success)" opacity="0.9" className="group-hover:scale-110 transition-transform origin-[70px_32px] duration-300" />
          <circle cx="58" cy="60" r="3.5" fill="var(--accent-3)" opacity="0.85" className="group-hover:scale-110 transition-transform origin-[58px_60px] duration-300" />
          <circle cx="30" cy="60" r="3.5" fill="var(--failure)" opacity="0.85" className="group-hover:scale-110 transition-transform origin-[30px_60px] duration-300" />
          <circle cx="44" cy="40" r="5"   fill="var(--accent)" className="group-hover:scale-110 transition-transform origin-[44px_40px] duration-300" />
        </g>
        
        {/* Text */}
        <text x="96" y="50" fontFamily="var(--font-geist-sans), system-ui, sans-serif" fontSize="26" fontWeight="700" letterSpacing="-0.5">
          <tspan fill="var(--text)">Algo</tspan>
          <tspan fill="var(--accent)">Visuals</tspan>
        </text>
        <text x="96" y="67" fontFamily="var(--font-geist-mono), monospace" fontSize="9" fontWeight="500" letterSpacing="2.5" fill="var(--muted)">
          SEE ALGORITHMS EVOLVE
        </text>
      </svg>
    </Link>
  );
}
