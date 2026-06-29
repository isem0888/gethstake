'use client';

/**
 * HeroNetwork — animated SVG replicating the "ETH diamond + green node network" image.
 * Central ETH diamond with radiating green glow-network nodes on both sides.
 */
export function HeroNetwork() {
  return (
    <div className="hnet-wrap">
      <svg
        viewBox="0 0 600 340"
        xmlns="http://www.w3.org/2000/svg"
        className="hnet-svg"
        aria-hidden="true"
      >
        <defs>
          {/* Center core glow */}
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9bfd4e" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#4dff8f" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          {/* Node glow filter */}
          <filter id="nodeGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Strong glow for big nodes */}
          <filter id="nodeBurst" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* ETH diamond glow */}
          <filter id="ethGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Line gradient left */}
          <linearGradient id="lineL" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#9bfd4e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#9bfd4e" stopOpacity="0.12" />
          </linearGradient>
          {/* Line gradient right */}
          <linearGradient id="lineR" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9bfd4e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#9bfd4e" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Background core glow under ETH diamond */}
        <ellipse cx="300" cy="170" rx="130" ry="110" fill="url(#coreGlow)" className="hnet-breathe" />

        {/* ── LEFT NETWORK ── */}
        {/* Hub nodes left — main hubs */}
        {/* Lines from ETH center to left hubs */}
        <line x1="230" y1="155" x2="120" y2="100" stroke="url(#lineL)" strokeWidth="1.2" className="hnet-line hl1" />
        <line x1="225" y1="170" x2="85" y2="170" stroke="url(#lineL)" strokeWidth="1.4" className="hnet-line hl2" />
        <line x1="230" y1="185" x2="120" y2="235" stroke="url(#lineL)" strokeWidth="1.2" className="hnet-line hl3" />

        {/* From left hub to far nodes */}
        <line x1="120" y1="100" x2="30" y2="65" stroke="url(#lineL)" strokeWidth="1" className="hnet-line hl4" />
        <line x1="120" y1="100" x2="35" y2="125" stroke="url(#lineL)" strokeWidth="0.9" className="hnet-line hl5" />
        <line x1="85" y1="170" x2="10" y2="145" stroke="url(#lineL)" strokeWidth="1" className="hnet-line hl4" />
        <line x1="85" y1="170" x2="12" y2="195" stroke="url(#lineL)" strokeWidth="0.9" className="hnet-line hl5" />
        <line x1="120" y1="235" x2="30" y2="260" stroke="url(#lineL)" strokeWidth="1" className="hnet-line hl6" />
        <line x1="120" y1="235" x2="40" y2="210" stroke="url(#lineL)" strokeWidth="0.8" className="hnet-line hl5" />

        {/* Cross-links between left hubs */}
        <line x1="120" y1="100" x2="85" y2="170" stroke="#9bfd4e" strokeWidth="0.7" strokeOpacity="0.25" className="hnet-line hl7" />
        <line x1="85" y1="170" x2="120" y2="235" stroke="#9bfd4e" strokeWidth="0.7" strokeOpacity="0.25" className="hnet-line hl7" />
        <line x1="35" y1="125" x2="12" y2="145" stroke="#9bfd4e" strokeWidth="0.6" strokeOpacity="0.18" />

        {/* ── RIGHT NETWORK ── */}
        <line x1="370" y1="155" x2="480" y2="100" stroke="url(#lineR)" strokeWidth="1.2" className="hnet-line hr1" />
        <line x1="375" y1="170" x2="515" y2="170" stroke="url(#lineR)" strokeWidth="1.4" className="hnet-line hr2" />
        <line x1="370" y1="185" x2="480" y2="235" stroke="url(#lineR)" strokeWidth="1.2" className="hnet-line hr3" />

        <line x1="480" y1="100" x2="570" y2="65" stroke="url(#lineR)" strokeWidth="1" className="hnet-line hr4" />
        <line x1="480" y1="100" x2="565" y2="125" stroke="url(#lineR)" strokeWidth="0.9" className="hnet-line hr5" />
        <line x1="515" y1="170" x2="590" y2="145" stroke="url(#lineR)" strokeWidth="1" className="hnet-line hr4" />
        <line x1="515" y1="170" x2="588" y2="195" stroke="url(#lineR)" strokeWidth="0.9" className="hnet-line hr5" />
        <line x1="480" y1="235" x2="570" y2="260" stroke="url(#lineR)" strokeWidth="1" className="hnet-line hr6" />
        <line x1="480" y1="235" x2="560" y2="210" stroke="url(#lineR)" strokeWidth="0.8" className="hnet-line hr5" />

        <line x1="480" y1="100" x2="515" y2="170" stroke="#9bfd4e" strokeWidth="0.7" strokeOpacity="0.25" className="hnet-line hr7" />
        <line x1="515" y1="170" x2="480" y2="235" stroke="#9bfd4e" strokeWidth="0.7" strokeOpacity="0.25" className="hnet-line hr7" />
        <line x1="565" y1="125" x2="588" y2="145" stroke="#9bfd4e" strokeWidth="0.6" strokeOpacity="0.18" />

        {/* ── LEFT NODES ── */}
        {/* Big hub nodes */}
        <circle cx="120" cy="100" r="7" fill="#9bfd4e" filter="url(#nodeBurst)" className="hnet-node hn-a" />
        <circle cx="120" cy="100" r="3.5" fill="#9bfd4e" />
        <circle cx="85" cy="170" r="8" fill="#9bfd4e" filter="url(#nodeBurst)" className="hnet-node hn-b" />
        <circle cx="85" cy="170" r="4" fill="#9bfd4e" />
        <circle cx="120" cy="235" r="7" fill="#9bfd4e" filter="url(#nodeBurst)" className="hnet-node hn-a" style={{ animationDelay: '0.8s' }} />
        <circle cx="120" cy="235" r="3.5" fill="#9bfd4e" />

        {/* Small far nodes */}
        <circle cx="30" cy="65" r="4.5" fill="#9bfd4e" filter="url(#nodeGlow)" className="hnet-node hn-c" />
        <circle cx="35" cy="125" r="3" fill="#9bfd4e" filter="url(#nodeGlow)" className="hnet-node hn-c" style={{ animationDelay: '0.3s' }} />
        <circle cx="10" cy="145" r="5" fill="#9bfd4e" filter="url(#nodeBurst)" className="hnet-node hn-a" style={{ animationDelay: '1.2s' }} />
        <circle cx="12" cy="195" r="3.5" fill="#9bfd4e" filter="url(#nodeGlow)" className="hnet-node hn-c" style={{ animationDelay: '0.6s' }} />
        <circle cx="30" cy="260" r="4.5" fill="#9bfd4e" filter="url(#nodeGlow)" className="hnet-node hn-b" style={{ animationDelay: '1.5s' }} />
        <circle cx="40" cy="210" r="3" fill="#9bfd4e" filter="url(#nodeGlow)" className="hnet-node hn-c" style={{ animationDelay: '0.9s' }} />

        {/* ── RIGHT NODES ── */}
        <circle cx="480" cy="100" r="7" fill="#9bfd4e" filter="url(#nodeBurst)" className="hnet-node hn-b" style={{ animationDelay: '0.4s' }} />
        <circle cx="480" cy="100" r="3.5" fill="#9bfd4e" />
        <circle cx="515" cy="170" r="8" fill="#9bfd4e" filter="url(#nodeBurst)" className="hnet-node hn-a" style={{ animationDelay: '0.7s' }} />
        <circle cx="515" cy="170" r="4" fill="#9bfd4e" />
        <circle cx="480" cy="235" r="7" fill="#9bfd4e" filter="url(#nodeBurst)" className="hnet-node hn-c" style={{ animationDelay: '1.1s' }} />
        <circle cx="480" cy="235" r="3.5" fill="#9bfd4e" />

        <circle cx="570" cy="65" r="4.5" fill="#9bfd4e" filter="url(#nodeGlow)" className="hnet-node hn-b" style={{ animationDelay: '0.2s' }} />
        <circle cx="565" cy="125" r="3" fill="#9bfd4e" filter="url(#nodeGlow)" className="hnet-node hn-c" style={{ animationDelay: '1.0s' }} />
        <circle cx="590" cy="145" r="5" fill="#9bfd4e" filter="url(#nodeBurst)" className="hnet-node hn-b" style={{ animationDelay: '0.5s' }} />
        <circle cx="588" cy="195" r="3.5" fill="#9bfd4e" filter="url(#nodeGlow)" className="hnet-node hn-a" style={{ animationDelay: '1.3s' }} />
        <circle cx="570" cy="260" r="4.5" fill="#9bfd4e" filter="url(#nodeGlow)" className="hnet-node hn-c" style={{ animationDelay: '0.8s' }} />
        <circle cx="560" cy="210" r="3" fill="#9bfd4e" filter="url(#nodeGlow)" className="hnet-node hn-b" style={{ animationDelay: '1.6s' }} />

        {/* ── ETH DIAMOND — central crystal shape ── */}
        {/* Outer glow halo */}
        <ellipse cx="300" cy="172" rx="72" ry="82" fill="#9bfd4e" fillOpacity="0.07" filter="url(#ethGlow)" className="hnet-breathe" />

        {/* Shadow/reflection bottom */}
        <ellipse cx="300" cy="285" rx="55" ry="12" fill="#9bfd4e" fillOpacity="0.15" filter="url(#nodeGlow)" />

        {/* Top half — upper-left facet */}
        <polygon
          points="300,65 240,170 300,145"
          fill="url(#facetTopL)"
          className="hnet-facet"
          style={{ fill: 'rgba(180,240,255,0.55)' }}
        />
        {/* Top half — upper-right facet */}
        <polygon
          points="300,65 360,170 300,145"
          fill="rgba(210,255,230,0.7)"
          className="hnet-facet"
        />
        {/* Center left facet */}
        <polygon
          points="240,170 300,145 300,220 240,195"
          fill="rgba(155,253,78,0.18)"
          className="hnet-facet"
        />
        {/* Center right facet */}
        <polygon
          points="360,170 300,145 300,220 360,195"
          fill="rgba(155,253,78,0.3)"
          className="hnet-facet"
        />
        {/* Bottom left facet */}
        <polygon
          points="240,195 300,220 300,280"
          fill="rgba(150,240,200,0.45)"
          className="hnet-facet"
        />
        {/* Bottom right facet */}
        <polygon
          points="360,195 300,220 300,280"
          fill="rgba(155,253,78,0.55)"
          className="hnet-facet"
        />

        {/* Diamond edges */}
        <polygon
          points="300,65 360,170 300,280 240,170"
          fill="none"
          stroke="rgba(155,253,78,0.55)"
          strokeWidth="1.2"
          filter="url(#ethGlow)"
          className="hnet-breathe"
        />
        {/* Inner dividing lines */}
        <line x1="300" y1="65" x2="300" y2="145" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
        <line x1="240" y1="170" x2="360" y2="170" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
        <line x1="300" y1="220" x2="300" y2="280" stroke="rgba(155,253,78,0.4)" strokeWidth="0.8" />
        <line x1="300" y1="145" x2="240" y2="170" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
        <line x1="300" y1="145" x2="360" y2="170" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
        <line x1="300" y1="220" x2="240" y2="195" stroke="rgba(155,253,78,0.3)" strokeWidth="0.6" />
        <line x1="300" y1="220" x2="360" y2="195" stroke="rgba(155,253,78,0.3)" strokeWidth="0.6" />

        {/* Top highlight shine */}
        <polygon points="300,70 310,100 295,115 285,90" fill="rgba(255,255,255,0.55)" />

        {/* Center connection points — lines TO the diamond */}
        {/* These make the diamond appear anchored in the network */}
        <line x1="240" y1="170" x2="120" y2="100" stroke="url(#lineL)" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="240" y1="170" x2="85" y2="170" stroke="url(#lineL)" strokeWidth="1.6" strokeOpacity="0.8" />
        <line x1="240" y1="195" x2="120" y2="235" stroke="url(#lineL)" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="360" y1="170" x2="480" y2="100" stroke="url(#lineR)" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="360" y1="170" x2="515" y2="170" stroke="url(#lineR)" strokeWidth="1.6" strokeOpacity="0.8" />
        <line x1="360" y1="195" x2="480" y2="235" stroke="url(#lineR)" strokeWidth="1.5" strokeOpacity="0.7" />
      </svg>
    </div>
  );
}
