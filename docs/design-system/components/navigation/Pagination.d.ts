import React from "react";

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Total page count. */
  total: number;
  /** Current page (1-based). */
  page: number;
  onChange?: (page: number) => void;
}
/** Page navigation with prev/next and ellipsis (maps to shadcn/ui Pagination). */
export function Pagination(props: PaginationProps): JSX.Element;
