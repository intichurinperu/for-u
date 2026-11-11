import { useEffect, useState } from 'react';
export default function AnimatedMetric({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplay(value); return; }
    let frame = 0;
    let start: number | undefined;
    frame = requestAnimationFrame(function step(now) {
      start ??= now;
      const progress = Math.min(1, (now - start) / 650);
      setDisplay(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <><span aria-hidden="true">{display.toLocaleString('es-PE')}</span><span className="sr-only">{value.toLocaleString('es-PE')}</span></>;
}
