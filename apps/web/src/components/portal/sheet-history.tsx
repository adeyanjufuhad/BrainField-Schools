const actionLabels: Record<string, string> = {
  sheet_submitted: "Submitted", sheet_accepted: "Accepted", sheet_returned: "Returned for correction",
  class_approved: "Class approved", vp_approved: "Final approval (VP)", vp_returned: "Returned by the VP", published: "Published",
};

const when = (date: Date) => date.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

export function WorkflowHistory({ events, title = "History" }: { events: { action: string; reason: string | null; at: Date; actor: string; subject?: string | null; revision?: number | null }[]; title?: string }) {
  if (!events.length) return null;
  return <section className="workflow-history" aria-labelledby="history-title">
    <h2 id="history-title">{title}</h2>
    <ol>{events.map((event, index) => <li key={index}>
      <strong>{actionLabels[event.action] ?? event.action}{event.subject ? ` · ${event.subject}` : ""}{event.revision ? ` · revision ${event.revision}` : ""}</strong>
      <span>{event.actor} · <time dateTime={event.at.toISOString()}>{when(event.at)}</time></span>
      {event.reason && <p>“{event.reason}”</p>}
    </li>)}</ol>
  </section>;
}
