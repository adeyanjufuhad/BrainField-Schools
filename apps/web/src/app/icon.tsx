import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Interim favicon; the supplied detailed school crest remains in the page header. */
export default function Icon() {
  return new ImageResponse(<div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#386641", color:"#ffffff", fontSize:22, fontWeight:700, borderRadius:6 }}>B</div>, size);
}
