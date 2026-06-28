import React from "react";
import { Avatar } from "../core/Avatar.jsx";
import { Rating } from "../core/Rating.jsx";

/** ReviewItem — a single review: avatar, name, rating, text, date. */
export function ReviewItem({ author, meta, rating, text, date, avatar, divider = true, className = "", ...rest }) {
  return (
    <div
      className={["vn-review", className].filter(Boolean).join(" ")}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-4) 0", borderBottom: divider ? "1px solid var(--border)" : "none" }}
      {...rest}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Avatar src={avatar} name={author} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "var(--small-size)", fontWeight: "var(--fw-semibold)", color: "var(--text)" }}>{author}</div>
          {(meta || date) && (
            <div style={{ fontSize: "var(--caption-size)", color: "var(--text-muted)" }}>
              {meta}{meta && date ? " · " : ""}{date}
            </div>
          )}
        </div>
        {typeof rating === "number" && <Rating value={rating} showValue={false} />}
      </div>
      {text && <p style={{ margin: 0, fontSize: "var(--small-size)", lineHeight: 1.55, color: "var(--text-secondary)" }}>{text}</p>}
    </div>
  );
}
