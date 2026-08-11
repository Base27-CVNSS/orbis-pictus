import { classNames } from "../lib/classNames";

interface WebSearchToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled: boolean;
}

export function WebSearchToggle({ enabled, onChange, disabled }: WebSearchToggleProps) {
  return (
    <button
      type="button"
      className={classNames("toolbar-button", { "toolbar-button-active": enabled })}
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      aria-pressed={enabled}
      title="Dùng tìm kiếm web để làm căn cứ cho nội dung trang mới"
    >
      Tìm web: {enabled ? "bật" : "tắt"}
    </button>
  );
}
