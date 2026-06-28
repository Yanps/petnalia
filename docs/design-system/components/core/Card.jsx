import React from "react";

/** Card — surface container. Compose with header/body/footer or `pad`. */
export function Card({ children, interactive = false, flat = false, pad = false, as = "div", className = "", ...rest }) {
  const Tag = as;
  const cls = [
    "vn-card",
    interactive && "vn-card--interactive",
    flat && "vn-card--flat",
    pad && "vn-card--pad",
    className,
  ].filter(Boolean).join(" ");
  return <Tag className={cls} {...rest}>{children}</Tag>;
}

export function CardHeader({ children, className = "", ...rest }) {
  return <div className={["vn-card__header", className].filter(Boolean).join(" ")} {...rest}>{children}</div>;
}
export function CardBody({ children, className = "", ...rest }) {
  return <div className={["vn-card__body", className].filter(Boolean).join(" ")} {...rest}>{children}</div>;
}
export function CardFooter({ children, className = "", ...rest }) {
  return <div className={["vn-card__footer", className].filter(Boolean).join(" ")} {...rest}>{children}</div>;
}
