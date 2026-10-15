import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function Icon() {
  const logo = await readFile(path.join(process.cwd(), "public/brand/brainfield-logo.jpg"));
  return new ImageResponse(
    // Render the original crest inside a circle with transparent outer corners.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`data:image/jpeg;base64,${logo.toString("base64")}`}
      alt=""
      width={64}
      height={64}
      style={{ borderRadius: "50%", objectFit: "contain" }}
    />,
    size,
  );
}
