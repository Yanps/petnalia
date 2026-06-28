import React from "react";
import { Input } from "../forms/Input.jsx";
import { AddressPreview } from "../molecules/AddressPreview.jsx";
import { Button } from "../core/Button.jsx";
import { Icon } from "../core/Icon.jsx";
import { EmptyState } from "../feedback/EmptyState.jsx";

/**
 * AddressSelector — search + pick a saved address.
 * Organism: composes Input (search) + AddressPreview (molecules) + Button.
 */
export function AddressSelector({
  addresses = [], selectedId, onSelect, onAdd, onSearch,
  searchValue, onSearchChange, className = "", ...rest
}) {
  return (
    <div className={["vn-addrsel", className].filter(Boolean).join(" ")} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }} {...rest}>
      <Input
        icon="search"
        placeholder="Buscar endereço ou CEP"
        value={searchValue}
        onChange={onSearchChange}
        aria-label="Buscar endereço"
      />

      {addresses.length === 0 ? (
        <EmptyState compact icon="map-pin" title="Nenhum endereço salvo" description="Adicione um endereço para agendar visitas em casa." action="Adicionar endereço" actionIcon="plus" onAction={onAdd} />
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {addresses.map((a) => {
              const active = selectedId === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onSelect && onSelect(a.id)}
                  aria-pressed={active}
                  style={{
                    appearance: "none", textAlign: "left", cursor: "pointer", padding: 0,
                    border: `1.5px solid ${active ? "var(--brand)" : "transparent"}`,
                    borderRadius: "var(--radius-lg)", background: "transparent",
                    transition: "border-color var(--motion-fast) var(--ease-standard)",
                  }}
                >
                  <AddressPreview
                    label={a.label || "Endereço"}
                    address={a.address}
                    distanceKm={a.distanceKm}
                    action={active ? "Selecionado ✓" : "Selecionar"}
                  />
                </button>
              );
            })}
          </div>
          <Button variant="ghost" iconLeft="plus" onClick={onAdd} style={{ alignSelf: "flex-start" }}>Adicionar novo endereço</Button>
        </>
      )}
    </div>
  );
}
