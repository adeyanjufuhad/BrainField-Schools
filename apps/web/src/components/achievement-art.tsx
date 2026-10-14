import { GlobeIcon, LightningBoltIcon, StarIcon } from "@radix-ui/react-icons";

export function AchievementArt({ theme }: { theme: "global" | "science" | "champion" }) {
  return <div className={`story-art story-art-${theme}`} aria-hidden="true">
    <span className="story-orbit orbit-one" /><span className="story-orbit orbit-two" />
    <span className="story-art-icon">{theme === "global" ? <GlobeIcon /> : theme === "champion" ? <StarIcon /> : <LightningBoltIcon />}</span>
    <span className="story-art-word">{theme === "global" ? "LAGOS → TOKYO" : theme === "champion" ? "DETERMINATION. FOCUS." : "THINK. DISCOVER. SPARK."}</span>
  </div>;
}
