'use client';

interface EthLogoProps {
  size?: number;
  glow?: boolean;
  className?: string;
}

export function EthLogo({ size = 28, glow = true, className = '' }: EthLogoProps) {
  return (
    <svg
      viewBox="0 0 28 44"
      fill="none"
      width={size}
      height="auto"
      className={className}
      style={glow ? { filter: 'drop-shadow(0 0 10px rgba(155,253,78,.75))' } : undefined}
    >
      <polygon points="14,0 0,22 14,16"  fill="#9bfd4e" opacity=".75" />
      <polygon points="14,0 28,22 14,16" fill="#9bfd4e" />
      <polygon points="0,25 14,44 14,31"  fill="#9bfd4e" opacity=".75" />
      <polygon points="28,25 14,44 14,31" fill="#9bfd4e" />
      <polygon points="0,22 14,16 14,31 0,25"  fill="#9bfd4e" opacity=".45" />
      <polygon points="28,22 14,16 14,31 28,25" fill="#9bfd4e" opacity=".65" />
    </svg>
  );
}
