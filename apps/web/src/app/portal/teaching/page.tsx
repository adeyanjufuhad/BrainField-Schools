import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { PortalShell } from "@/components/portal/portal-shell";
import { StatusBadge } from "@/components/portal/status-badge";
import { requireActor } from "@/lib/portal/actor";
import { teachingSheets } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "My score sheets" };

export default async function Teaching() {
  const actor = await requireActor();
  if (!actor.teachesSubjects) redirect("/portal");
  const sheets = await teachingSheets(actor);
  return <PortalShell actor={actor} current="/portal/teaching" title="My score sheets" description="Enter CA and exam scores for each class you teach, then submit each sheet to the class teacher.">
    <div className="table-scroll"><table className="data-table">
      <thead><tr><th scope="col">Class and subject</th><th scope="col">Progress</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Open</span></th></tr></thead>
      <tbody>{sheets.map(sheet => <tr key={sheet.id}>
        <th scope="row"><span className="student-name">{sheet.subjectName}</span><span className="student-id">{sheet.className}</span></th>
        <td>{sheet.completed} of {sheet.students} students complete</td>
        <td><StatusBadge status={sheet.status} />{sheet.returnReason && sheet.status === "returned" && <p className="row-note">“{sheet.returnReason}”</p>}</td>
        <td className="row-link"><Link href={`/portal/teaching/${sheet.id}`}>{["draft", "returned"].includes(sheet.status) ? "Enter scores" : "View"} <ArrowRightIcon aria-hidden="true" /><span className="sr-only"> for {sheet.subjectName}, {sheet.className}</span></Link></td>
      </tr>)}</tbody>
    </table></div>
  </PortalShell>;
}
