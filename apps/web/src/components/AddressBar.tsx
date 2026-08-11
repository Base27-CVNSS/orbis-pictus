import { useState } from "react";
import type { Node } from "@orbis/shared";
import { classNames } from "../lib/classNames";

interface AddressBarProps {
  trail: Node[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onSubmit: (query: string) => void;
  disabled: boolean;
  /** Hiển thị thay ô nhập khi một thao tác chạm đang được xử lý, trước khi ảnh mới xuất hiện. */
  pendingLabel?: string;
  editMode: boolean;
}

export function AddressBar({ trail, currentIndex, onNavigate, onSubmit, disabled, pendingLabel, editMode }: AddressBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    if (!query || disabled) return;
    onSubmit(query);
    setValue("");
  };

  return (
    <form className="address-bar" onSubmit={handleSubmit}>
      {trail.length > 0 && (
        <div className="breadcrumbs" aria-label="Đường dẫn khám phá">
          {trail.map((node, i) => (
            <span key={node.id} className="crumb-wrap">
              <button
                type="button"
                className={classNames("crumb", { "crumb-current": i === currentIndex })}
                onClick={() => onNavigate(i)}
                title={`Mở lại: ${node.page_title}`}
              >
                {node.page_title}
              </button>
              {i < trail.length - 1 && <span className="crumb-sep">/</span>}
            </span>
          ))}
        </div>
      )}
      {pendingLabel ? (
        <div className="address-pending">Đang mở: {pendingLabel}…</div>
      ) : (
        <input
          className="address-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={editMode ? "Nhập lệnh để chỉnh sửa trang này…" : "Nhập bất kỳ chủ đề nào…"}
          aria-label={editMode ? "Lệnh chỉnh sửa trang" : "Chủ đề muốn khám phá"}
          disabled={disabled}
        />
      )}
    </form>
  );
}
