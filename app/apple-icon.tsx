import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f3eee4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: 11, background: "#5a6a72" }} />
        <div style={{ width: 22, height: 22, borderRadius: 11, background: "#6a7d68" }} />
        <div style={{ width: 22, height: 22, borderRadius: 11, background: "#9a5a42" }} />
      </div>
    ),
    { ...size },
  );
}
