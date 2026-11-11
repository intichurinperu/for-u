import { ButtonSecondary as DSButtonSecondary } from './DesignSystem';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type MagicButtonBaseProps = {
  children: ReactNode;
  variant?: 'primary' | 'soft' | 'ghost';
  className?: string;
};

type MagicButtonProps =
  | (MagicButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never; href?: never })
  | (MagicButtonBaseProps & LinkProps & { to: string; href?: never })
  | (MagicButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: never });

export default function MagicButton(props: MagicButtonProps) {
  const { children, variant = 'primary', className = '', ...rest } = props;
  const classes = `magic-button magic-button-${variant} ${className}`.trim();

  if ('to' in props && props.to) {
    const { to, ...linkRest } = rest as LinkProps;
    return <Link to={to} className={classes} {...linkRest}>{children}</Link>;
  }

  if ('href' in props && props.href) {
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return <a className={classes} {...anchorRest}>{children}</a>;
  }

  return <DSButtonSecondary type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</DSButtonSecondary>;
}
