import Image from "next/image";
import Link from "next/link";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { schoolPhotoArchive } from "@/content/photos";

// Competition photos that are not already used by the achievement stories further down the page.
const momentIds = ["eko-contestants", "boab-team", "jubril-eko-desk", "boab-medal", "boab-awards-group"];
const moments = momentIds.map(id => schoolPhotoArchive.find(photo => photo.id === id)!);

export function StudentMoments() {
  return (
    <div className="student-moments">
      <ul className="moments-grid">
        {moments.map((photo, index) => <li key={photo.id}>
          <figure className="moment-tile">
            <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={index === 0 ? "(max-width: 767px) 100vw, 50vw" : "(max-width: 767px) 50vw, 25vw"} />
            <figcaption><span>{photo.year} · {photo.label.split(" · ")[0]}</span>{photo.caption}</figcaption>
          </figure>
        </li>)}
      </ul>
      <div className="moments-footer">
        <p>Competition and award photographs shared by Brainfield Schools Lagos. Some group photographs include students from other schools.</p>
        <Link href="/gallery?category=photos" className="text-link">See all {schoolPhotoArchive.length} photos in the Gallery <ArrowTopRightIcon /></Link>
      </div>
    </div>
  );
}
