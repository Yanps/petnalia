import React from "react";
import { IconName } from "../core/Icon";

export interface ServiceItem {
  id?: string;
  name: string;
  description?: string;
  duration?: string;
  price: number | string;
  from?: boolean;
  icon?: IconName;
}
export interface ServicesListProps extends React.HTMLAttributes<HTMLUListElement> {
  services?: ServiceItem[];
  /** Show a per-row "Agendar" button. @default false */
  selectable?: boolean;
  onSelect?: (service: ServiceItem) => void;
}
/** List of a vet's services with icon, price, and optional schedule CTA. */
export function ServicesList(props: ServicesListProps): JSX.Element;
