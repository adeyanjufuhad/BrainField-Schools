import { CheckCircledIcon, ClockIcon, CounterClockwiseClockIcon, FileTextIcon, LockClosedIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import type { BatchStatus, SheetStatus } from "@/lib/portal/queries";

const labels: Record<SheetStatus | BatchStatus, { text: string; tone: string; Icon: typeof ClockIcon }> = {
  draft: { text: "Draft", tone: "neutral", Icon: FileTextIcon },
  submitted: { text: "Submitted for review", tone: "waiting", Icon: PaperPlaneIcon },
  returned: { text: "Returned for correction", tone: "attention", Icon: CounterClockwiseClockIcon },
  accepted: { text: "Accepted", tone: "done", Icon: CheckCircledIcon },
  compiling: { text: "Collecting subject sheets", tone: "neutral", Icon: ClockIcon },
  class_approved: { text: "Class approved · with the VP", tone: "waiting", Icon: PaperPlaneIcon },
  vp_approved: { text: "VP approved · ready to publish", tone: "done", Icon: CheckCircledIcon },
  published: { text: "Published", tone: "published", Icon: LockClosedIcon },
};

export function StatusBadge({ status }: { status: SheetStatus | BatchStatus }) {
  const { text, tone, Icon } = labels[status];
  return <span className={`status-badge status-${tone}`}><Icon aria-hidden="true" />{text}</span>;
}
