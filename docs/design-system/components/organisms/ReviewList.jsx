import React from "react";
import { ReviewItem } from "../molecules/ReviewItem.jsx";
import { Rating } from "../core/Rating.jsx";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";
import { Skeleton } from "../core/Skeleton.jsx";
import { EmptyState } from "../feedback/EmptyState.jsx";

function Bar({ pct }) {
  return (
    <div style={{ flex: 1, height: 6, borderRadius: "9999px", background: "var(--surface-inset)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "var(--rating)", borderRadius: "9999px" }} />
    </div>
  );
}

/**
 * ReviewList — rating summary + distribution + list of ReviewItem molecules.
 * Organism: composes Rating + ReviewItem (+ Skeleton / EmptyState).
 */
export function ReviewList({ average, total, distribution, reviews = [], loading = false, onMore, className = "", ...rest }) {
  if (loading) {
    return (
      <div className={className} {...rest}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4) 0" }}>
            <Skeleton circle height={32} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <Skeleton width="30%" height={14} />
              <Skeleton width="90%" height={12} />
              <Skeleton width="70%" height={12} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return <EmptyState compact icon="message-circle" title="Ainda sem avaliações" description="Seja o primeiro a avaliar este profissional após a consulta." />;
  }

  const dist = distribution || [];
  return (
    <div className={["vn-reviewlist", className].filter(Boolean).join(" ")} {...rest}>
      <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap", alignItems: "center", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>
            {typeof average === "number" ? average.toFixed(1).replace(".", ",") : "—"}
          </span>
          <Rating value={average || 0} showValue={false} />
          <span style={{ fontSize: "var(--caption-size)", color: "var(--text-muted)" }}>{total} avaliações</span>
        </div>
        {dist.length === 5 && (
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 6 }}>
            {[5, 4, 3, 2, 1].map((star, i) => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 12, fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>{star}</span>
                <Icon name="star" size={12} style={{ color: "var(--rating)", fill: "currentColor" }} />
                <Bar pct={dist[5 - star]} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {reviews.map((r, i) => <ReviewItem key={i} {...r} divider={i < reviews.length - 1} />)}
      </div>

      {onMore && (
        <div style={{ marginTop: "var(--space-3)" }}>
          <Button variant="secondary" block iconRight="chevron-down" onClick={onMore}>Ver todas as avaliações</Button>
        </div>
      )}
    </div>
  );
}
