import { useEffect, useRef } from "react";
import type { CachedTap } from "@orbis/shared";
import { useDismiss } from "../hooks/useDismiss";

interface TapVariantPanelProps {
  tap: CachedTap;
  onOpen: (childId: string) => void;
  onDrawNew: (tap: CachedTap) => void;
  onClose: () => void;
  busy: boolean;
  readOnly?: boolean;
}

export function TapVariantPanel({ tap, onOpen, onDrawNew, onClose, busy, readOnly = false }: TapVariantPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useDismiss(true, onClose);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const versions = [...tap.children].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="tap-panel-backdrop" onClick={onClose}>
      <div
        className="tap-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Các phiên bản của ${tap.subject}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tap-panel-header">
          <div>
            <p className="tap-panel-eyebrow">Đã khám phá trước đây</p>
            <h2 className="tap-panel-title">{tap.subject}</h2>
          </div>
          <button ref={closeRef} type="button" className="tap-panel-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>

        <ul className="tap-panel-list">
          {versions.map((child, index) => (
            <li key={child.id}>
              <button type="button" className="tap-panel-version" disabled={busy} onClick={() => onOpen(child.id)}>
                {child.image_url ? (
                  <img className="tap-panel-thumb" src={child.image_url} alt="" loading="lazy" />
                ) : (
                  <span className="tap-panel-thumb tap-panel-thumb--empty" aria-hidden="true" />
                )}
                <span className="tap-panel-version-text">
                  <span className="tap-panel-version-title">{child.page_title}</span>
                  <span className="tap-panel-version-meta">
                    {index === 0 ? "Mới nhất" : `Phiên bản ${versions.length - index}`} · mở tức thì
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="tap-panel-actions">
          {readOnly ? (
            <p className="tap-panel-note">Đây là bản demo chỉ đọc. Chọn một phiên bản phía trên để mở.</p>
          ) : (
            <>
              <button type="button" className="tap-panel-draw" disabled={busy} onClick={() => onDrawNew(tap)}>
                Vẽ phiên bản mới
              </button>
              <p className="tap-panel-note">
                {busy
                  ? "Một trang khác đang được tạo. Hãy chờ hoàn tất trước khi mở hoặc vẽ thêm phiên bản."
                  : "Vẽ phiên bản mới sẽ tạo một ảnh mới và sử dụng hạn mức API."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
