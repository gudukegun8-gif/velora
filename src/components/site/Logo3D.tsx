interface Logo3DProps {
  compact?: boolean;
}

/**
 * CSS-only 3D presentation of the VÉLORA wordmark.
 *
 * Metallic gold gradient text with a dark-bronze extruded depth stack and a
 * subtle top highlight. On hover the wordmark tilts gently in 3D space.
 * Pure CSS — no JavaScript mousemove. Decorative: parent links carry the
 * accessible label, so this is aria-hidden.
 */
export function Logo3D({ compact = false }: Logo3DProps) {
  return (
    <span
      className="group/logo3d inline-block select-none"
      style={{ perspective: "900px" }}
    >
      <span
        aria-hidden="true"
        className="inline-block font-display font-semibold tracking-[0.1em] transition-transform duration-500 ease-out motion-reduce:transform-none group-hover/logo3d:[transform:rotateX(8deg)_rotateY(-10deg)]"
        style={{
          fontSize: compact ? "1.4rem" : "2rem",
          lineHeight: 1,
          color: "transparent",
          backgroundImage:
            "linear-gradient(180deg,#F9E79A 0%,#F0D47C 26%,#D9B53A 48%,#C9A227 62%,#9A7A1E 82%,#8A6D1B 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          transformStyle: "preserve-3d",
          // Top highlight first, then a 5-layer dark-bronze extrusion
          // (#5c430f → deep shadow), finished with a soft ambient drop.
          textShadow:
            "0 -1px 1px rgba(255,246,205,0.38)," +
            "1px 1px 0 #5c430f," +
            "2px 2px 0 #4e380c," +
            "3px 3px 0 #402d0a," +
            "4px 4px 0 #312306," +
            "5px 5px 0 #231a04," +
            "7px 8px 16px rgba(0,0,0,0.55)",
        }}
      >
        VÉLORA
      </span>
    </span>
  );
}
