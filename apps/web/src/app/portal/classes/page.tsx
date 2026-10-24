import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { PortalShell } from "@/components/portal/portal-shell";
import { StatusBadge } from "@/components/portal/status-badge";
import { canOverseeClasses, requireActor } from "@/lib/portal/actor";
import { visibleClasses } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "Class results" };

export default async function Classes() {
  const actor = await requireActor();
  if (!actor.classTeacherOf.length && !canOverseeClasses(actor)) redirect("/portal");
  const classes = await visibleClasses(actor);
  return <PortalShell actor={actor} current="/portal/classes" title="Class results" description="Follow each class from subject sheets to class approval, VP approval and publication.">
    {classes.length ? <div className="table-scroll"><table className="data-table">
      <thead><tr><th scope="col">Class</th><th scope="col">Subject sheets accepted</th><th scope="col">Stage</th><th scope="col"><span className="sr-only">Open</span></th></tr></thead>
      <tbody>{classes.map(item => <tr key={item.id}>
        <th scope="row"><span className="student-name">{item.name}</span><span className="student-id">Class teacher: {item.classTeacherName ?? "not assigned"}</span></th>
        <td>{item.accepted} of {item.subjects}</td>
        <td><StatusBadge status={item.status} /></td>
        <td className="row-link"><Link href={`/portal/classes/${item.id}`}>Open <ArrowRightIcon aria-hidden="true" /><span className="sr-only"> {item.name}</span></Link></td>
      </tr>)}</tbody>
    </table></div> : <div className="portal-empty"><h2>No classes yet</h2><p>No classes are assigned to you for this term.</p></div>}
  </PortalShell>;
}
