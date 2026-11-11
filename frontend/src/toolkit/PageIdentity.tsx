import type {ReactNode} from 'react';
export function HeroCopy({modern,children}:{modern:boolean;children:ReactNode}){return modern?<div className="page-hero-copy">{children}</div>:<>{children}</>;}
export function HeroMark({name}:{name:string}){const initials=name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(word=>Array.from(word)[0]).join('').toLocaleUpperCase();return <div className="page-hero-mark" aria-hidden="true"><span className="page-mark-orbit"/><span className="page-mark-ring"/><strong>{initials||'✦'}</strong><i/></div>;}
