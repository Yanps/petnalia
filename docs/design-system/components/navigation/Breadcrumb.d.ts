import React from "react";

export interface Crumb {
  label: React.ReactNode;
  href?: string;
}
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Trail items, root → current. Last item renders as current page. */
  items: Crumb[];
}
/** Breadcrumb trail (maps to shadcn/ui Breadcrumb). */
export function Breadcrumb(props: BreadcrumbProps): JSX.Element;
