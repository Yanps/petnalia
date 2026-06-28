import React from "react";

export interface RadiusSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Current radius (km). @default 5 */
  value?: number;
  /** @default 1 */
  min?: number;
  /** @default 25 */
  max?: number;
  /** @default 1 */
  step?: number;
  onChange?: (km: number) => void;
  /** Live result count shown under the slider. */
  resultCount?: number;
  areaLabel?: string;
  /** Render the CoverageMap preview. @default true */
  showMap?: boolean;
}
/** Radius slider + live CoverageMap preview for home-visit search. */
export function RadiusSelector(props: RadiusSelectorProps): JSX.Element;
