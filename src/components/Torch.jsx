import { useEffect, useRef } from 'react';

/** A soft light that follows the mouse (used in dark mode only). */
export default function Torch() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches) return undefined;

    let frame = 0;
    const move = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--x', `${e.clientX}px`);
        el.style.setProperty('--y', `${e.clientY}px`);
        el.style.opacity = '1';
      });
    };
    const hide = () => {
      el.style.opacity = '0';
    };

    window.addEventListener('pointermove', move);
    document.documentElement.addEventListener('mouseleave', hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('mouseleave', hide);
    };
  }, []);

  return <div ref={ref} className="torch" aria-hidden="true" />;
}
