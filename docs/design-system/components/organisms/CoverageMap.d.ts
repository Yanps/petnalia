import React from "react";

export interface CoveragePin {
  top: number;
  left: number;
  /** Greyed out when false. */
  covered?: boolean;
}
export interface CoverageMapProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the user's address is inside coverage. @default true */
  covered?: boolean;
  /** Service radius in km. @default 8 */
  radiusKm?: number;
  /** Region caption, e.g. "Zona Oeste · São Paulo". */
  areaLabel?: string;
  /** Static-map background URL. Omit for the styled placeholder. */
  mapSrc?: string;
  /** Map height in px. @default 320 */
  height?: number;
  /** Decorative vet pins positioned by %. */
  pins?: CoveragePin[];
}
/** Home-visit coverage map with radius ring, pins, and in/out-of-area status. */
export function CoverageMap(props: CoverageMapProps): JSX.Element;
