import type { Metadata, Viewport } from "next";
import "@fontsource-variable/outfit";
import "@fontsource-variable/newsreader";
import "./globals.css";
import { school } from "@/content/school";

export const metadata: Metadata = {
  title: { default: "Brainfield Schools Lagos | Determination and Focus", template: "%s | Brainfield Schools Lagos" },
  description: school.description,
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#386641" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-NG" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
