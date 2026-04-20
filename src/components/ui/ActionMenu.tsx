import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ActionItem = {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger";
  show?: boolean;
};

type Props = {
  items: ActionItem[];
  align?: "right" | "left";
};

export function ActionMenu({ items, align = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const visible = items.filter((i) => i.show !== false);

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({
        top: r.bottom + window.scrollY + 4,
        left: align === "right"
          ? r.right + window.scrollX - 176 // w-44 = 176px
          : r.left + window.scrollX,
      });
    }
  }, [open, align]);

  if (visible.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
      >
        <MoreVertical size={16} className="text-gray-400" />
      </button>
      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: pos.top, left: pos.left }}
              className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44"
            >
              {visible.map((it, i) => {
                const Icon = it.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      it.onClick();
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition text-left
                      ${it.variant === "danger" ? "text-red-600" : "text-gray-700"}`}
                  >
                    {Icon && <Icon size={15} />}
                    {it.label}
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
