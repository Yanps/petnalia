import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Hover lift + pointer cursor for clickable cards. @default false */
  interactive?: boolean;
  /** Remove the resting shadow. @default false */
  flat?: boolean;
  /** Apply standard 24px padding directly (skip Header/Body/Footer). @default false */
  pad?: boolean;
  /** Element tag. @default "div" */
  as?: keyof JSX.IntrinsicElements;
}

/** Surface container with soft elevation and 16px radius. */
export function Card(props: CardProps): JSX.Element;
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
export function CardBody(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>): JSX.Element;
