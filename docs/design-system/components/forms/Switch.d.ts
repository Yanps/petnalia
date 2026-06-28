import React from "react";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}
/** On/off toggle (maps to shadcn/ui Switch). Prefer for instant-apply settings. */
export function Switch(props: SwitchProps): JSX.Element;
