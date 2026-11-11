import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './pearlButton.css';

type Common = { children: ReactNode; compact?: boolean; subtle?: boolean; tone?: 'neutral' | 'solid'; className?: string };
type Props = Common & (
  | { to: string; href?: never }
  | { href: string; to?: never }
  | (ButtonHTMLAttributes<HTMLButtonElement> & { to?: never; href?: never })
);

/** Shared nacre capsule used by the approved FOR U interface. */
export default function PearlButton(props: Props) {
  const { children, compact, subtle, tone, className = '', ...rest } = props;
  const classes = `foru-pearl-button${compact ? ' is-compact' : ''}${subtle ? ' is-subtle' : ''}${tone ? ` is-${tone}` : ''} ${className}`;
  const content = <span>{children}</span>;
  if ('to' in rest && typeof rest.to === 'string') return <Link className={classes} to={rest.to}>{content}</Link>;
  if ('href' in rest && typeof rest.href === 'string') return <a className={classes} href={rest.href}>{content}</a>;
  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return <button {...buttonProps} type={buttonProps.type ?? 'button'} className={classes}>{content}</button>;
}
