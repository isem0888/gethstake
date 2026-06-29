'use client';

import { EthLogo } from './EthLogo';

const EthTiny = ({ w = 10 }: { w?: number }) => (
  <svg viewBox="0 0 28 44" fill="none" width={w} style={{ display: 'block' }}>
    <polygon points="14,0 0,22 14,16" fill="#9bfd4e" opacity=".75" />
    <polygon points="14,0 28,22 14,16" fill="#9bfd4e" />
    <polygon points="0,25 14,44 14,31" fill="#9bfd4e" opacity=".75" />
    <polygon points="28,25 14,44 14,31" fill="#9bfd4e" />
    <polygon points="0,22 14,16 14,31 0,25" fill="#9bfd4e" opacity=".45" />
    <polygon points="28,22 14,16 14,31 28,25" fill="#9bfd4e" opacity=".65" />
  </svg>
);

interface NodeProps {
  size: number;
  ethSize: number;
  orbitRadius: number;
  duration: number;
  delay?: number;
  label?: string;
  reverse?: boolean;
}

function OrbitalNode({ size, ethSize, orbitRadius, duration, delay = 0, label, reverse = false }: NodeProps) {
  const dir = reverse ? 'reverse' : 'normal';
  return (
    <div style={{
      position: 'absolute',
      width: orbitRadius * 2,
      height: orbitRadius * 2,
      borderRadius: '50%',
      animation: `orbSpin ${duration}s linear ${delay}s infinite ${dir}`,
    }}>
      <div style={{
        position: 'absolute',
        top: -size / 2,
        left: '50%',
        animation: `orbCounter ${duration}s linear ${delay}s infinite ${reverse ? 'normal' : 'reverse'}`,
        transformOrigin: '50% 50%',
      }}>
        <div style={{
          width: size,
          height: size,
          marginLeft: -size / 2,
          background: 'linear-gradient(160deg,#0e1a0f,#060a07)',
          clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
          border: '1px solid rgba(155,253,78,.45)',
          boxShadow: '0 0 14px rgba(155,253,78,.25), inset 0 0 10px rgba(155,253,78,.1)',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
        }}>
          <EthTiny w={ethSize} />
          {label && (
            <div style={{
              position: 'absolute',
              bottom: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontSize: 9,
              fontFamily: "'Chakra Petch',sans-serif",
              color: '#9bfd4e',
              letterSpacing: '.5px',
              opacity: .75,
            }}>{label}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HeroOrb() {
  return (
    <div className="orb-wrap">
      {/* Core glow */}
      <div className="orb-core-glow" />

      {/* Orbit rings */}
      <div className="orb-ring or1" />
      <div className="orb-ring or2" />
      <div className="orb-ring or3" />

      {/* Scan line */}
      <div className="orb-scan" />

      {/* Orbiting nodes — inner ring */}
      <OrbitalNode size={38} ethSize={11} orbitRadius={62} duration={5.8} label="8 ETH" />

      {/* Orbiting nodes — mid ring (2 nodes, opposite) */}
      <OrbitalNode size={30} ethSize={9} orbitRadius={98} duration={9.5} delay={0} />
      <OrbitalNode size={30} ethSize={9} orbitRadius={98} duration={9.5} delay={-4.75} reverse label="+10.2%" />

      {/* Orbiting node — outer ring */}
      <OrbitalNode size={24} ethSize={7} orbitRadius={136} duration={16} delay={-5} label="Validator" />

      {/* Corner sparkles */}
      {[
        { top: '14%', left: '8%', s: 3 },
        { top: '22%', right: '6%', s: 2.5 },
        { bottom: '18%', left: '12%', s: 2 },
        { bottom: '26%', right: '10%', s: 3.5 },
        { top: '48%', left: '2%', s: 2 },
        { top: '38%', right: '3%', s: 2.5 },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          ...p as any,
          width: p.s,
          height: p.s,
          borderRadius: '50%',
          background: '#9bfd4e',
          opacity: .6,
          animation: `sparkle ${2.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite alternate`,
        }} />
      ))}

      {/* ETH center */}
      <div className="orb-center">
        <div className="orb-center-ring" />
        <EthLogo size={56} className="eth-svg" />
      </div>

      {/* Bottom platform */}
      <div className="orb-platform" />
    </div>
  );
}
