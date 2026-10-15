import Image from "next/image";
import { photoForAchievement } from "@/content/photos";
import { AchievementArt } from "@/components/achievement-art";

export function AchievementPhoto({ id, theme }: { id: string; theme: "global" | "science" | "champion" }) {
  const photo = photoForAchievement(id);
  if (!photo) return <AchievementArt theme={theme} />;
  return <div className="story-photo"><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 767px) 100vw, 50vw" /><span className="story-photo-credit">Photo: {photo.credit}</span></div>;
}
