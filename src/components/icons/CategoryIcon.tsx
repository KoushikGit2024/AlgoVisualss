

export type CategoryIconProps = {
  name: string;
  hover?: boolean;
};

export function CategoryIcon({ name, hover = false }: CategoryIconProps) {
  switch (name) {

    case 'Array':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="#34D399" strokeWidth="4">
        <rect x="6" y="20" width="12" height="24" fill="#34D399" fillOpacity="0.2"/>
        <rect x="20" y="20" width="12" height="24" fill="#34D399" fillOpacity="0.2"/>
        <rect x="34" y="20" width="12" height="24"/>
        <rect x="48" y="20" width="12" height="24"/>
        {/* Sliding window bracket */}
        <path d="M 4 48 L 4 54 L 34 54 L 34 48" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4">
        <rect x="6" y="20" width="12" height="24"/>
        <rect x="20" y="20" width="12" height="24"/>
        <rect x="34" y="20" width="12" height="24"/>
        <rect x="48" y="20" width="12" height="24"/>
        </svg>
      );

    case 'Bits':
      return hover ? (
<svg viewBox="0 0 64 64" fill="currentColor">
        <text x="7" y="40" fontSize="18" fontFamily="monospace">10<tspan fill="#34D399">01</tspan></text>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="currentColor">
        <text x="7" y="40" fontSize="18" fontFamily="monospace">1010</text>
      </svg>
      );

    case 'DynamicPrograming':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="8" width="16" height="16" fill="#34D399" stroke="#34D399"/>
        <rect x="24" y="8" width="16" height="16"/>
        <rect x="40" y="8" width="16" height="16"/>
        <rect x="8" y="24" width="16" height="16" fill="#34D399" stroke="#34D399"/>
        <rect x="24" y="24" width="16" height="16" fill="#34D399" stroke="#34D399"/>
        <rect x="40" y="24" width="16" height="16"/>
        <rect x="8" y="40" width="16" height="16"/>
        <rect x="24" y="40" width="16" height="16"/>
        <rect x="40" y="40" width="16" height="16" fill="#34D399" stroke="#34D399"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="8" width="16" height="16"/>
        <rect x="24" y="8" width="16" height="16"/>
        <rect x="40" y="8" width="16" height="16"/>
        <rect x="8" y="24" width="16" height="16"/>
        <rect x="24" y="24" width="16" height="16"/>
        <rect x="40" y="24" width="16" height="16"/>
        <rect x="8" y="40" width="16" height="16"/>
        <rect x="24" y="40" width="16" height="16"/>
        <rect x="40" y="40" width="16" height="16"/>
      </svg>
      );

    case 'Graph':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="12" cy="32" r="5" fill="#34D399" stroke="#34D399"/>
        <circle cx="32" cy="12" r="5" fill="#34D399" stroke="#34D399"/>
        <circle cx="52" cy="32" r="5" fill="#34D399" stroke="#34D399"/>
        <circle cx="32" cy="52" r="5"/>
        <line x1="12" y1="32" x2="32" y2="12" stroke="#34D399" strokeWidth="5"/>
        <line x1="32" y1="12" x2="52" y2="32" stroke="#34D399" strokeWidth="5"/>
        <line x1="52" y1="32" x2="32" y2="52"/>
        <line x1="32" y1="52" x2="12" y2="32"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="12" cy="32" r="5"/>
        <circle cx="32" cy="12" r="5"/>
        <circle cx="52" cy="32" r="5"/>
        <circle cx="32" cy="52" r="5"/>
        <line x1="12" y1="32" x2="32" y2="12"/>
        <line x1="32" y1="12" x2="52" y2="32"/>
        <line x1="52" y1="32" x2="32" y2="52"/>
        <line x1="32" y1="52" x2="12" y2="32"/>
      </svg>
      );

    case 'Greedy':
      return hover ? (
<svg viewBox="0 0 64 64" fill="currentColor">
        <path d="M32 8l6 14 16 2-12 10 4 16-14-8-14 8 4-16-12-10 16-2z" fill="none" stroke="#34D399" strokeWidth="3"/>
        <circle cx="32" cy="36" r="8" fill="#34D399"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="currentColor">
        <path d="M32 8l6 14 16 2-12 10 4 16-14-8-14 8 4-16-12-10 16-2z"/>
      </svg>
      );

    case 'Hashmap':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="20" y1="8" x2="20" y2="56"/>
        <line x1="44" y1="8" x2="44" y2="56"/>
        <line x1="8" y1="20" x2="56" y2="20"/>
        <line x1="8" y1="44" x2="56" y2="44"/>
        <circle cx="32" cy="32" r="6" fill="#34D399" stroke="none"/>
        <circle cx="12" cy="12" r="3" fill="#34D399" stroke="none"/>
        <circle cx="52" cy="52" r="4" fill="#34D399" stroke="none"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="20" y1="8" x2="20" y2="56"/>
        <line x1="44" y1="8" x2="44" y2="56"/>
        <line x1="8" y1="20" x2="56" y2="20"/>
        <line x1="8" y1="44" x2="56" y2="44"/>
      </svg>
      );

    case 'Heap':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="12" r="6" fill="#34D399" stroke="#34D399"/>
        <circle cx="18" cy="32" r="5"/>
        <circle cx="46" cy="32" r="5"/>
        <circle cx="10" cy="52" r="5"/>
        <circle cx="26" cy="52" r="5"/>
        <line x1="32" y1="18" x2="18" y2="27"/>
        <line x1="32" y1="18" x2="46" y2="27"/>
        <line x1="18" y1="37" x2="10" y2="47"/>
        <line x1="18" y1="37" x2="26" y2="47"/>
        <path d="M 38 12 L 44 8 L 44 16 Z" fill="#34D399" stroke="none"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="12" r="5"/>
        <circle cx="18" cy="32" r="5"/>
        <circle cx="46" cy="32" r="5"/>
        <circle cx="10" cy="52" r="5"/>
        <circle cx="26" cy="52" r="5"/>
        <line x1="32" y1="17" x2="18" y2="27"/>
        <line x1="32" y1="17" x2="46" y2="27"/>
        <line x1="18" y1="37" x2="10" y2="47"/>
        <line x1="18" y1="37" x2="26" y2="47"/>
      </svg>
      );

    case 'LinkedList':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="#34D399" strokeWidth="3">
        <rect x="4" y="24" width="12" height="12" rx="2" stroke="currentColor"/>
        <rect x="26" y="24" width="12" height="12" rx="2" stroke="currentColor"/>
        <rect x="48" y="24" width="12" height="12" rx="2" stroke="currentColor"/>
        <line x1="16" y1="30" x2="26" y2="30"/>
        <line x1="38" y1="30" x2="48" y2="30"/>
        <polyline points="20,26 16,30 20,34"/>
        <polyline points="42,26 38,30 42,34"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="4" y="24" width="12" height="12" rx="2"/>
        <rect x="26" y="24" width="12" height="12" rx="2"/>
        <rect x="48" y="24" width="12" height="12" rx="2"/>
        <line x1="16" y1="30" x2="26" y2="30"/>
        <line x1="38" y1="30" x2="48" y2="30"/>
        <polyline points="22,26 26,30 22,34"/>
        <polyline points="44,26 48,30 44,34"/>
      </svg>
      );

    case 'Queue':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
            <rect x="20" y="24" width="12" height="12" fill="#34D399" stroke="#34D399"/>
            <rect x="36" y="24" width="12" height="12"/>
            <rect x="52" y="24" width="12" height="12"/>
            <line x1="4" y1="30" x2="12" y2="30" stroke="#34D399" strokeDasharray="2 2"/>
        </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
            <rect x="4" y="24" width="12" height="12"/>
            <rect x="20" y="24" width="12" height="12"/>
            <rect x="36" y="24" width="12" height="12"/>
            <line x1="52" y1="30" x2="60" y2="30"/>
            <polyline points="56,26 60,30 56,34"/>
        </svg>
      );

    case 'RangeStructures':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="10" r="4"/>
        <circle cx="16" cy="30" r="4"/>
        <circle cx="48" cy="30" r="4" fill="#34D399" stroke="#34D399"/>
        <circle cx="8" cy="50" r="4"/>
        <circle cx="24" cy="50" r="4"/>
        <circle cx="40" cy="50" r="4" fill="#34D399" stroke="#34D399"/>
        <circle cx="56" cy="50" r="4" fill="#34D399" stroke="#34D399"/>
        <line x1="32" y1="14" x2="16" y2="26"/>
        <line x1="32" y1="14" x2="48" y2="26"/>
        <line x1="16" y1="34" x2="8" y2="46"/>
        <line x1="16" y1="34" x2="24" y2="46"/>
        <line x1="48" y1="34" x2="40" y2="46" stroke="#34D399" strokeWidth="4"/>
        <line x1="48" y1="34" x2="56" y2="46" stroke="#34D399" strokeWidth="4"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="10" r="4"/>
        <circle cx="16" cy="30" r="4"/>
        <circle cx="48" cy="30" r="4"/>
        <circle cx="8" cy="50" r="4"/>
        <circle cx="24" cy="50" r="4"/>
        <circle cx="40" cy="50" r="4"/>
        <circle cx="56" cy="50" r="4"/>
        <line x1="32" y1="14" x2="16" y2="26"/>
        <line x1="32" y1="14" x2="48" y2="26"/>
        <line x1="16" y1="34" x2="8" y2="46"/>
        <line x1="16" y1="34" x2="24" y2="46"/>
        <line x1="48" y1="34" x2="40" y2="46"/>
        <line x1="48" y1="34" x2="56" y2="46"/>
      </svg>
      );

    case 'Recursion':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M22 22 A12 12 0 1 1 22 42"/>
        <polyline points="22,16 22,22 28,22"/>
        <path d="M34 26 A6 6 0 1 1 34 38" stroke="#34D399"/>
        <polyline points="34,22 34,26 38,26" stroke="#34D399"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M22 22 A12 12 0 1 1 22 42"/>
        <polyline points="22,16 22,22 28,22"/>
      </svg>
      );

    case 'Sorting':
      return hover ? (
<svg viewBox="0 0 64 64" fill="#34D399">
        {/* Sorted order */}
        <rect x="8" y="44" width="8" height="12"/>
        <rect x="22" y="32" width="8" height="24"/>
        <rect x="36" y="18" width="8" height="38"/>
        <rect x="50" y="6" width="8" height="50"/>
        {/* Arrow indicating sort */}
        <path d="M 60 56 L 60 16 L 56 22 M 60 16 L 64 22" stroke="#34D399" strokeWidth="2" fill="none"/>
        </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="currentColor">
        <rect x="8" y="36" width="8" height="20"/>
        <rect x="22" y="26" width="8" height="30"/>
        <rect x="36" y="14" width="8" height="42"/>
        <rect x="50" y="6" width="8" height="50"/>
      </svg>
      );

    case 'Stack':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="18" y="42" width="28" height="10"/>
        <rect x="18" y="30" width="28" height="10"/>
        <rect x="18" y="6" width="28" height="10" fill="#34D399" stroke="#34D399"/>
        {/* Pushing animation indicator */}
        <line x1="32" y1="18" x2="32" y2="28" stroke="#34D399" strokeDasharray="3 3"/>
        <polyline points="28,24 32,28 36,24" stroke="#34D399"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="18" y="42" width="28" height="10"/>
        <rect x="18" y="30" width="28" height="10"/>
        <rect x="18" y="18" width="28" height="10"/>
      </svg>
      );

    case 'String':
      return hover ? (
<svg viewBox="0 0 64 64" fill="currentColor">
        <text x="8" y="42" fontSize="26" fontFamily="monospace">A<tspan fill="#34D399">a</tspan></text>
        <rect x="25" y="46" width="16" height="3" fill="#34D399"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="currentColor">
        <text x="8" y="42" fontSize="26" fontFamily="monospace">Aa</text>
      </svg>
      );

    case 'Tree':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="12" r="5" stroke="#34D399" fill="#34D399"/>
        <circle cx="18" cy="32" r="5" stroke="#34D399" fill="#34D399"/>
        <circle cx="46" cy="32" r="5"/>
        <circle cx="10" cy="52" r="5" stroke="#34D399" fill="#34D399"/>
        <circle cx="26" cy="52" r="5"/>
        <circle cx="38" cy="52" r="5"/>
        <circle cx="54" cy="52" r="5"/>
        <line x1="32" y1="17" x2="18" y2="27" stroke="#34D399" strokeWidth="4"/>
        <line x1="32" y1="17" x2="46" y2="27"/>
        <line x1="18" y1="37" x2="10" y2="47" stroke="#34D399" strokeWidth="4"/>
        <line x1="18" y1="37" x2="26" y2="47"/>
        <line x1="46" y1="37" x2="38" y2="47"/>
        <line x1="46" y1="37" x2="54" y2="47"/>
      </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="12" r="5"/>
        <circle cx="18" cy="32" r="5"/>
        <circle cx="46" cy="32" r="5"/>
        <circle cx="10" cy="52" r="5"/>
        <circle cx="26" cy="52" r="5"/>
        <circle cx="38" cy="52" r="5"/>
        <circle cx="54" cy="52" r="5"/>
        <line x1="32" y1="17" x2="18" y2="27"/>
        <line x1="32" y1="17" x2="46" y2="27"/>
        <line x1="18" y1="37" x2="10" y2="47"/>
        <line x1="18" y1="37" x2="26" y2="47"/>
        <line x1="46" y1="37" x2="38" y2="47"/>
        <line x1="46" y1="37" x2="54" y2="47"/>
      </svg>
      );

    case 'Trie':
      return hover ? (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="32" cy="10" r="4" fill="#34D399" stroke="#34D399"/>
            <line x1="32" y1="14" x2="16" y2="32" stroke="#34D399" strokeWidth="4"/>
            <line x1="32" y1="14" x2="48" y2="32"/>
            <line x1="16" y1="32" x2="8" y2="52"/>
            <line x1="16" y1="32" x2="24" y2="52" stroke="#34D399" strokeWidth="4"/>
            <circle cx="24" cy="52" r="4" fill="#34D399" stroke="#34D399"/>
            <line x1="48" y1="32" x2="40" y2="52"/>
            <line x1="48" y1="32" x2="56" y2="52"/>
        </svg>
      ) : (
<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="32" cy="10" r="4"/>
            <line x1="32" y1="14" x2="16" y2="32"/>
            <line x1="32" y1="14" x2="48" y2="32"/>
            <line x1="16" y1="32" x2="8" y2="52"/>
            <line x1="16" y1="32" x2="24" y2="52"/>
            <line x1="48" y1="32" x2="40" y2="52"/>
            <line x1="48" y1="32" x2="56" y2="52"/>
        </svg>
      );

    default:
      return null;
  }
}
