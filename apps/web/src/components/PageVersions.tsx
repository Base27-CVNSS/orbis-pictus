import { useRef, useState } from "react";
import type { VersionSummary } from "@orbis/shared";
import { useDismiss } from "../hooks/useDismiss";

interface PageVersionsProps {
  versions: VersionSummary[];
  currentId: string | undefined;
  onOpen: (id: string) => void;
  onSetDefault: (id: string) => void;
  hidden: boolean;
}

export function BranchIcon({ strokeWidth = 2 }: { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 21.3l-5.8 3.05 1.1-6.45L2.6 9.35l6.5-.95z" />
    </svg>
  );
}

export function PageVersions({ versions, currentId, onOpen, onSetDefault, hidden }: PageVersionsProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useDismiss(open, () => setOpen(false), rootRef);
  if (hidden || versions.length < 2) return null;

  return (
    <div className="page-versions" ref={rootRef}>
      <button
        type="button"
        className="page-versions-button"
        aria-expanded={open}
        aria-label="Các phiên bản của trang"
        title="Các phiên bản của trang"
        onClick={() => setOpen((v) => !v)}
      >
        <BranchIcon />
        <span className="page-versions-count">{versions.length}</span>
      </button>

      {open && (
        <div className="page-versions-popover" role="menu" aria-label="Danh sách phiên bản">
          <div className="page-versions-head">
            <p className="page-versions-eyebrow">Các phiên bản của trang</p>
          </div>
          <div className="page-versions-list">
            {versions.map((v) => {
              const onScreen = v.id === currentId;
              return (
                <div key={v.id} className="page-version" aria-current={onScreen}>
                  <button
                    type="button"
                    className="page-version-open"
                    onClick={() => {
                      if (!onScreen) onOpen(v.id);
                      setOpen(false);
                    }}
                  >
                    <span className="page-version-thumb">
                      {v.image_url ? <img src={v.image_url} alt="" /> : <span className="page-version-thumb-empty" />}
                    </span>
                    <span className="page-version-text">
                      <span className="page-version-title">{v.page_title}</span>
                      <span className="page-version-meta">{v.edit_command ?? "Trang gốc"}</span>
                    </span>
                    {onScreen && <span className="page-version-current">Đang hiển thị</span>}
                  </button>
                  <button
                    type="button"
                    className="page-version-star"
                    aria-pressed={v.is_default}
                    aria-label={v.is_default ? "Phiên bản mặc định" : "Đặt làm phiên bản mặc định"}
                    title={v.is_default ? "Đang là mặc định" : "Đặt làm mặc định"}
                    onClick={() => onSetDefault(v.id)}
                  >
                    <StarIcon />
                  </button>
                </div>
              );
            })}
          </div>
          <p className="page-versions-foot">★ là phiên bản mở mặc định. Dòng được tô sáng đang hiển thị.</p>
        </div>
      )}
    </div>
  );
}
