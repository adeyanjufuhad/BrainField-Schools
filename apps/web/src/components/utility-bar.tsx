import { MobileIcon } from "@radix-ui/react-icons";
import { formatPhone, phoneHref, school } from "@/content/school";

export function UtilityBar() {
  const [mainPhone] = school.phones;
  return <div className="utility-bar"><div className="page-shell utility-inner"><span>{school.officialMotto}.</span><a href={phoneHref(mainPhone)}><MobileIcon />Call {formatPhone(mainPhone)}</a></div></div>;
}
