"use client";

import { DownloadIcon } from "@radix-ui/react-icons";

export function PrintButton() {
  return <button type="button" className="button button-outline button-small no-print" onClick={() => window.print()}><DownloadIcon aria-hidden="true" />Print or save as PDF</button>;
}
