import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { ReportCard } from "@/components/portal/report-card";
import { requireActor } from "@/lib/portal/actor";
import { studentReports } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "My results" };

export default async function Results() {
  const actor = await requireActor();
  if (actor.kind !== "student") redirect("/portal");
  const reports = await studentReports(actor);
  return <PortalShell actor={actor} current="/portal/results" title="My results" description="Your published report cards. Results appear here only after the school publishes them.">
    {reports.length ? reports.map(report => <ReportCard key={report.id} report={report} />)
      : <div className="portal-empty"><h2>No published results yet</h2><p>Your report card will appear here once your class’s results have been approved and published.</p></div>}
  </PortalShell>;
}
