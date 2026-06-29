'use client';

/**
 * HeroNetwork — ETH diamond + glowing node network.
 * Color scheme: teal/cyan (left) → blue (center) → violet/purple (right)
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
          {/* Core glow — blue */}
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="55%"  stopColor="#818cf8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000"    stopOpacity="0" />
          </radialGradient>

          {/* Subtle teal glow under ETH */}
          <radialGradient id="ethHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#000"    stopOpacity="0" />
          </radialGradient>

          {/* Node glow — teal (left) */}
          <filter id="nodeGlowL" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Node burst — teal */}
          <filter id="nodeBurstL" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Node glow — violet (right) */}
          <filter id="nodeGlowR" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Node burst — violet */}
          <filter id="nodeBurstR" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* ETH diamond glow */}
          <filter id="ethGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Line gradients — teal on left side */}
          <linearGradient id="lineL" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.1" />
          </linearGradient>
          {/* Line gradients — purple on right side */}
          <linearGradient id="lineR" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Background core glow */}
        <ellipse cx="300" cy="170" rx="130" ry="110" fill="url(#coreGlow)" className="hnet-breathe" />

        {/* ── LEFT NETWORK (teal/cyan) ── */}
        <line x1="240" y1="170" x2="120" y2="100" stroke="url(#lineL)" strokeWidth="1.3" className="hnet-line hl1" />
        <line x1="240" y1="170" x2="85"  y2="170" stroke="url(#lineL)" strokeWidth="1.5" className="hnet-line hl2" />
        <line x1="240" y1="195" x2="120" y2="235" stroke="url(#lineL)" strokeWidth="1.3" className="hnet-line hl3" />

        <line x1="120" y1="100" x2="30"  y2="65"  stroke="url(#lineL)" strokeWidth="1"   className="hnet-line hl4" />
        <line x1="120" y1="100" x2="35"  y2="125" stroke="url(#lineL)" strokeWidth="0.9" className="hnet-line hl5" />
        <line x1="85"  y1="170" x2="10"  y2="145" stroke="url(#lineL)" strokeWidth="1"   className="hnet-line hl4" />
        <line x1="85"  y1="170" x2="12"  y2="195" stroke="url(#lineL)" strokeWidth="0.9" className="hnet-line hl5" />
        <line x1="120" y1="235" x2="30"  y2="260" stroke="url(#lineL)" strokeWidth="1"   className="hnet-line hl6" />
        <line x1="120" y1="235" x2="40"  y2="210" stroke="url(#lineL)" strokeWidth="0.8" className="hnet-line hl5" />

        <line x1="120" y1="100" x2="85"  y2="170" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity="0.22" className="hnet-line hl7" />
        <line x1="85"  y1="170" x2="120" y2="235" stroke="#22d3ee" strokeWidth="0.7" strokeOpacity="0.22" className="hnet-line hl7" />
        <line x1="35"  y1="125" x2="12"  y2="145" stroke="#22d3ee" strokeWidth="0.6" strokeOpacity="0.15" />

        {/* ── RIGHT NETWORK (violet/purple) ── */}
        <line x1="360" y1="170" x2="480" y2="100" stroke="url(#lineR)" strokeWidth="1.3" className="hnet-line hr1" />
        <line x1="360" y1="170" x2="515" y2="170" stroke="url(#lineR)" strokeWidth="1.5" className="hnet-line hr2" />
        <line x1="360" y1="195" x2="480" y2="235" stroke="url(#lineR)" strokeWidth="1.3" className="hnet-line hr3" />

        <line x1="480" y1="100" x2="570" y2="65"  stroke="url(#lineR)" strokeWidth="1"   className="hnet-line hr4" />
        <line x1="480" y1="100" x2="565" y2="125" stroke="url(#lineR)" strokeWidth="0.9" className="hnet-line hr5" />
        <line x1="515" y1="170" x2="590" y2="145" stroke="url(#lineR)" strokeWidth="1"   className="hnet-line hr4" />
        <line x1="515" y1="170" x2="588" y2="195" stroke="url(#lineR)" strokeWidth="0.9" className="hnet-line hr5" />
        <line x1="480" y1="235" x2="570" y2="260" stroke="url(#lineR)" strokeWidth="1"   className="hnet-line hr6" />
        <line x1="480" y1="235" x2="560" y2="210" stroke="url(#lineR)" strokeWidth="0.8" className="hnet-line hr5" />

        <line x1="480" y1="100" x2="515" y2="170" stroke="#a78bfa" strokeWidth="0.7" strokeOpacity="0.22" className="hnet-line hr7" />
        <line x1="515" y1="170" x2="480" y2="235" stroke="#a78bfa" strokeWidth="0.7" strokeOpacity="0.22" className="hnet-line hr7" />
        <line x1="565" y1="125" x2="588" y2="145" stroke="#a78bfa" strokeWidth="0.6" strokeOpacity="0.15" />

        {/* ── LEFT NODES (teal) ── */}
        <circle cx="120" cy="100" r="7"   fill="#22d3ee" filter="url(#nodeBurstL)" className="hnet-node hn-a" />
        <circle cx="120" cy="100" r="3.5" fill="#22d3ee" />
        <circle cx="85"  cy="170" r="8"   fill="#06b6d4" filter="url(#nodeBurstL)" className="hnet-node hn-b" />
        <circle cx="85"  cy="170" r="4"   fill="#22d3ee" />
        <circle cx="120" cy="235" r="7"   fill="#22d3ee" filter="url(#nodeBurstL)" className="hnet-node hn-a" style={{ animationDelay: '0.8s' }} />
        <circle cx="120" cy="235" r="3.5" fill="#22d3ee" />

        <circle cx="30"  cy="65"  r="4.5" fill="#67e8f9" filter="url(#nodeGlowL)" className="hnet-node hn-c" />
        <circle cx="35"  cy="125" r="3"   fill="#22d3ee" filter="url(#nodeGlowL)" className="hnet-node hn-c" style={{ animationDelay: '0.3s' }} />
        <circle cx="10"  cy="145" r="5"   fill="#06b6d4" filter="url(#nodeBurstL)" className="hnet-node hn-a" style={{ animationDelay: '1.2s' }} />
        <circle cx="12"  cy="195" r="3.5" fill="#22d3ee" filter="url(#nodeGlowL)" className="hnet-node hn-c" style={{ animationDelay: '0.6s' }} />
        <circle cx="30"  cy="260" r="4.5" fill="#67e8f9" filter="url(#nodeGlowL)" className="hnet-node hn-b" style={{ animationDelay: '1.5s' }} />
        <circle cx="40"  cy="210" r="3"   fill="#22d3ee" filter="url(#nodeGlowL)" className="hnet-node hn-c" style={{ animationDelay: '0.9s' }} />

        {/* ── RIGHT NODES (violet/purple) ── */}
        <circle cx="480" cy="100" r="7"   fill="#a78bfa" filter="url(#nodeBurstR)" className="hnet-node hn-b" style={{ animationDelay: '0.4s' }} />
        <circle cx="480" cy="100" r="3.5" fill="#c4b5fd" />
        <circle cx="515" cy="170" r="8"   fill="#8b5cf6" filter="url(#nodeBurstR)" className="hnet-node hn-a" style={{ animationDelay: '0.7s' }} />
        <circle cx="515" cy="170" r="4"   fill="#a78bfa" />
        <circle cx="480" cy="235" r="7"   fill="#a78bfa" filter="url(#nodeBurstR)" className="hnet-node hn-c" style={{ animationDelay: '1.1s' }} />
        <circle cx="480" cy="235" r="3.5" fill="#c4b5fd" />

        <circle cx="570" cy="65"  r="4.5" fill="#c4b5fd" filter="url(#nodeGlowR)" className="hnet-node hn-b" style={{ animationDelay: '0.2s' }} />
        <circle cx="565" cy="125" r="3"   fill="#a78bfa" filter="url(#nodeGlowR)" className="hnet-node hn-c" style={{ animationDelay: '1.0s' }} />
        <circle cx="590" cy="145" r="5"   fill="#8b5cf6" filter="url(#nodeBurstR)" className="hnet-node hn-b" style={{ animationDelay: '0.5s' }} />
        <circle cx="588" cy="195" r="3.5" fill="#a78bfa" filter="url(#nodeGlowR)" className="hnet-node hn-a" style={{ animationDelay: '1.3s' }} />
        <circle cx="570" cy="260" r="4.5" fill="#c4b5fd" filter="url(#nodeGlowR)" className="hnet-node hn-c" style={{ animationDelay: '0.8s' }} />
        <circle cx="560" cy="210" r="3"   fill="#a78bfa" filter="url(#nodeGlowR)" className="hnet-node hn-b" style={{ animationDelay: '1.6s' }} />

        {/* ── ETH DIAMOND — crystal white-blue ── */}
        {/* Outer halo */}
        <ellipse cx="300" cy="172" rx="72" ry="82" fill="url(#ethHalo)" filter="url(#ethGlow)" className="hnet-breathe" />

        {/* Shadow reflection bottom */}
        <ellipse cx="300" cy="285" rx="55" ry="12" fill="#60a5fa" fillOpacity="0.12" filter="url(#nodeGlowL)" />

        {/* Diamond facets — crystal / ice look */}
        <polygon points="300,65 240,170 300,145"  fill="rgba(186,230,255,0.6)" />
        <polygon points="300,65 360,170 300,145"  fill="rgba(220,240,255,0.75)" />
        <polygon points="240,170 300,145 300,220 240,195" fill="rgba(96,165,250,0.22)" />
        <polygon points="360,170 300,145 300,220 360,195" fill="rgba(129,140,248,0.3)" />
        <polygon points="240,195 300,220 300,280" fill="rgba(147,197,253,0.5)" />
        <polygon points="360,195 300,220 300,280" fill="rgba(167,139,250,0.55)" />

        {/* Diamond outline — blue glow */}
        <polygon
          points="300,65 360,170 300,280 240,170"
          fill="none"
          stroke="rgba(96,165,250,0.65)"
          strokeWidth="1.3"
          filter="url(#ethGlow)"
          className="hnet-breathe"
        />

        {/* Internal lines */}
        <line x1="300" y1="65"  x2="300" y2="145" stroke="rgba(255,255,255,0.38)" strokeWidth="0.8" />
        <line x1="240" y1="170" x2="360" y2="170" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
        <line x1="300" y1="220" x2="300" y2="280" stroke="rgba(147,197,253,0.45)" strokeWidth="0.9" />
        <line x1="300" y1="145" x2="240" y2="170" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
        <line x1="300" y1="145" x2="360" y2="170" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
        <line x1="300" y1="220" x2="240" y2="195" stroke="rgba(96,165,250,0.35)"  strokeWidth="0.7" />
        <line x1="300" y1="220" x2="360" y2="195" stroke="rgba(167,139,250,0.35)" strokeWidth="0.7" />

        {/* Top highlight shine */}
        <polygon points="300,70 310,100 295,115 285,90" fill="rgba(255,255,255,0.6)" />
        {/* Secondary left shine */}
        <polygon points="250,168 270,155 268,178" fill="rgba(255,255,255,0.15)" />

        {/* Lines anchoring diamond to network */}
        <line x1="240" y1="170" x2="120" y2="100" stroke="url(#lineL)" strokeWidth="1.6" strokeOpacity="0.75" />
        <line x1="240" y1="170" x2="85"  y2="170" stroke="url(#lineL)" strokeWidth="1.7" strokeOpacity="0.85" />
        <line x1="240" y1="195" x2="120" y2="235" stroke="url(#lineL)" strokeWidth="1.6" strokeOpacity="0.75" />
        <line x1="360" y1="170" x2="480" y2="100" stroke="url(#lineR)" strokeWidth="1.6" strokeOpacity="0.75" />
        <line x1="360" y1="170" x2="515" y2="170" stroke="url(#lineR)" strokeWidth="1.7" strokeOpacity="0.85" />
        <line x1="360" y1="195" x2="480" y2="235" stroke="url(#lineR)" strokeWidth="1.6" strokeOpacity="0.75" />
      </svg>
    </div>
  );
}
