import React from "react";

export interface NavLink {
  id: string;
  label: React.ReactNode;
}
export interface HeaderUser {
  name: string;
  photo?: string;
  status?: "online" | "busy" | "offline";
}
export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Horizontal logo lockup URL. Falls back to mark + wordmark. */
  logoSrc?: string;
  /** @default "PetNalia" */
  brand?: string;
  links?: NavLink[];
  /** Active link id. */
  active?: string;
  /** Current city label. */
  city?: string;
  /** Signed-in user; omit to show the "Entrar" button. */
  user?: HeaderUser;
  /** Show the notification dot. */
  unread?: boolean;
  onNav?: (id: string) => void;
  /** Render a mobile menu button. */
  onMenu?: () => void;
  onLogin?: () => void;
  /** Hide nav links (e.g. checkout). @default false */
  compact?: boolean;
}
/**
 * Global navigation bar — logo, links, location, notifications, avatar.
 * Sticky + blurred (`--z-sticky`).
 *
 * @startingPoint section="Organisms" subtitle="Global header / navbar" viewport="1200x68"
 */
export function Header(props: HeaderProps): JSX.Element;
