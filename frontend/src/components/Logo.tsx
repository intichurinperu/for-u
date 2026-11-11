import './originalLogo.css';
type LogoProps={className?:string;compact?:boolean};
// Frame the original artwork; the source image and its iridescent U remain intact.
export default function Logo({className='',compact=false}:LogoProps){return <span className={`foru-original-logo ${compact?'is-compact':''} ${className}`} role="img" aria-label="FOR U"><img src="/brand/foru-logo.png" alt="" draggable={false}/></span>;}
