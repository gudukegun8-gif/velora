import Image from "next/image";

interface Logo3DProps {
  compact?: boolean;
}

/**
 * VÉLORA brand mark — the real logo image, presented with a premium 3D
 * treatment: layered gold drop-shadows for depth and a gentle tilt on hover.
 * Pure CSS (see `.logo-3d` in globals.css), motion-reduce safe.
 * Decorative: parent links carry the accessible label, so alt is empty.
 */
export function Logo3D({ compact = false }: Logo3DProps) {
  return (
    <span className="logo-3d">
      <Image
        src="/images/logo-v2.webp"
        alt=""
        width={compact ? 112 : 144}
        height={compact ? 112 : 144}
        priority
        className={compact ? "h-14 w-14 object-contain" : "h-16 w-16 object-contain"}
      />
    </span>
  );
}
