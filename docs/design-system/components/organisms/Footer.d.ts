import React from "react";
import { IconName } from "../core/Icon";

export interface FooterLink {
  label: React.ReactNode;
  href?: string;
}
export interface FooterColumn {
  title: React.ReactNode;
  links: FooterLink[];
}
export interface SocialLink {
  icon: IconName;
  label: string;
  href?: string;
}
export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  logoSrc?: string;
  brand?: string;
  tagline?: string;
  columns?: FooterColumn[];
  social?: SocialLink[];
}
/** Global site footer — logo, tagline, link columns, legal + trust row. */
export function Footer(props: FooterProps): JSX.Element;
