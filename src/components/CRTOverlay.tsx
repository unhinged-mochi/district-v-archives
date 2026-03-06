import { useEffect } from "react";

interface CRTOverlayProps {
  crtEnabled?: boolean;
  flickerEnabled?: boolean;
}

export default function CRTOverlay({
  crtEnabled = true,
  flickerEnabled = true,
}: CRTOverlayProps) {
  // Screen jitter effect — random 1px horizontal shift every 10-15s
  useEffect(() => {
    if (!flickerEnabled) {
      return;
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    let innerTimeout: ReturnType<typeof setTimeout>;

    const scheduleJitter = () => {
      const delay = 10_000 + Math.random() * 5000;
      timeout = setTimeout(() => {
        const wrapper = document.getElementById("crt-content-wrapper");
        if (wrapper) {
          wrapper.style.marginLeft = `${Math.random() > 0.5 ? 1 : -1}px`;
          innerTimeout = setTimeout(() => {
            wrapper.style.marginLeft = "";
          }, 50);
        }
        scheduleJitter();
      }, delay);
    };

    scheduleJitter();
    return () => {
      clearTimeout(timeout);
      clearTimeout(innerTimeout);
    };
  }, [flickerEnabled]);

  return (
    <>
      {/* Animated scrolling scanlines */}
      {crtEnabled && <div className="crt-scanlines crt-scanline-scroll" />}

      {/* Screen vignette */}
      {crtEnabled && <div className="crt-vignette" />}

      {/* Subtle flicker effect */}
      {flickerEnabled && <div className="crt-flicker-effect" />}
    </>
  );
}
