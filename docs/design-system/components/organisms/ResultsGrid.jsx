import React from "react";
import { VetCard } from "../domain/VetCard.jsx";
import { EmptyState } from "../feedback/EmptyState.jsx";
import { Skeleton } from "../core/Skeleton.jsx";
import { Card } from "../core/Card.jsx";

function VetCardSkeleton() {
  return (
    <Card>
      <div style={{ display: "flex", gap: "var(--space-4)", padding: "var(--space-5)" }}>
        <Skeleton circle height={72} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <Skeleton width="60%" height={18} />
          <Skeleton width="40%" height={14} />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Skeleton width={90} height={22} radius="9999px" />
            <Skeleton width={70} height={22} radius="9999px" />
          </div>
        </div>
      </div>
      <div style={{ padding: "var(--space-4) var(--space-5)", borderTop: "1px solid var(--border)" }}>
        <Skeleton width="100%" height={36} />
      </div>
    </Card>
  );
}

/**
 * ResultsGrid — responsive grid of VetCards with loading, empty, and
 * loaded states. Organism: composes VetCard + EmptyState + Skeleton.
 */
export function ResultsGrid({ vets = [], loading = false, columns = 2, skeletonCount = 4, onVet, onClear, emptyTitle = "Nenhum veterinário encontrado", emptyDescription = "Tente ampliar a distância ou remover alguns filtros.", className = "", ...rest }) {
  const grid = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: "var(--space-4)",
  };

  if (loading) {
    return (
      <div className={className} style={grid} {...rest}>
        {Array.from({ length: skeletonCount }).map((_, i) => <VetCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!vets.length) {
    return (
      <Card className={className} {...rest}>
        <EmptyState icon="search" title={emptyTitle} description={emptyDescription} action="Limpar filtros" actionIcon="x" onAction={onClear} />
      </Card>
    );
  }

  return (
    <div className={className} style={grid} {...rest}>
      {vets.map((v) => (
        <VetCard key={v.id} {...v} nextAvailable={v.next ?? v.nextAvailable} onSchedule={() => onVet && onVet(v.id)} onClick={() => onVet && onVet(v.id)} />
      ))}
    </div>
  );
}
