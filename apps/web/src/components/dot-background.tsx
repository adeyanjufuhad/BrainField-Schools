import DotGrid from "@/components/react-bits/dot-grid";

// React Bits Dot Grid tuned for the forest panels: faint leaf dots that ripple lime near the pointer.
// It renders only during the one-off intro and while someone interacts, so it never animates on its own.
export function DotBackground() {
  return <div className="dot-background" aria-hidden="true"><DotGrid dotSize={4} gap={22} baseColor="#4f8058" activeColor="#a7c957" proximity={150} shockRadius={260} shockStrength={4} fade={0.55} glow={0.6} /></div>;
}
