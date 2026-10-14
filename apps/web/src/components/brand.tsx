import Image from "next/image";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? "brand-light" : ""}`}>
      <Image src="/brand/brainfield-logo.jpg" width={56} height={56} alt="" className="brand-crest" />
      <span className="brand-wordmark">Brainfield<span className="brand-subtitle">S C H O O L S · L A G O S</span></span>
    </span>
  );
}
