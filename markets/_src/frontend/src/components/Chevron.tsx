export function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d={dir === "left" ? "M14 4 L7 11 L14 18" : "M8 4 L15 11 L8 18"} />
    </svg>
  );
}
