import { useEffect, useId, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { X, Infinity as InfinityIcon } from "lucide-react";
import { HEROES } from "../game";
import type { HeroId } from "../game";
export function Logo() {
  return (
    <div className="brand">
      <div className="brand-symbol">
        <InfinityIcon strokeWidth={1.3} />
        <span />
      </div>
      <div>
        INFINITY<small>F L O W</small>
      </div>
    </div>
  );
}
export function HeroArt({
  id,
  className = "",
  style,
}: {
  id: HeroId;
  className?: string;
  style?: CSSProperties;
}) {
  const h = HEROES.find((x) => x.id === id)!;
  return (
    <div
      className={`hero-art art-${id} ${className}`}
      style={{ backgroundPosition: `${h.sheet * 50}% top`, ...style }}
      aria-hidden="true"
    />
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current!.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-button" aria-label="Fechar" onClick={onClose}>
          <X size={19} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Coin({ size = 17 }: { size?: number }) {
  return (
    <span
      className="coin"
      style={{ width: size, height: size, fontSize: size * 0.65 }}
    >
      ✦
    </span>
  );
}
export function Gem({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="m12 2 9 7-9 13L3 9z" fill="#8c79c4" />
      <path d="m12 2 3 7-3 13L9 9z" fill="#c5b6f0" />
      <path d="M3 9h18M12 2 9 9m3-7 3 7" stroke="#e1d7ff" strokeWidth=".7" />
    </svg>
  );
}
