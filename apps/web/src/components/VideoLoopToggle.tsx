import type { VideoStatus } from "@orbis/shared";
import { classNames } from "../lib/classNames";

interface VideoLoopToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled: boolean;
  status: VideoStatus | null | undefined;
}

function describe(enabled: boolean, status: VideoStatus | null | undefined): { label: string; title: string } {
  if (!enabled) {
    return {
      label: "Chuyển động: tắt",
      title: "Thử nghiệm: phát đoạn chuyển động lặp ngắn trên những trang đã có video thay cho ảnh tĩnh",
    };
  }
  if (status === undefined) {
    return {
      label: "Chuyển động: bật",
      title: "Những trang có đoạn chuyển động lặp sẽ tự phát thay cho ảnh tĩnh",
    };
  }
  switch (status) {
    case "ready":
      return { label: "Chuyển động: bật", title: "Đang phát đoạn chuyển động lặp của trang này" };
    case "pending":
      return {
        label: "Chuyển động: đang tạo…",
        title: "Video của trang này đang được tạo và sẽ tự phát khi hoàn tất",
      };
    default:
      return {
        label: "Chuyển động: bật (chưa có video)",
        title:
          "Trang này chưa có đoạn chuyển động. Hãy dùng nút “Tạo chuyển động” để tạo ngay; các trang mới sẽ tự tạo video khi tùy chọn này đang bật.",
      };
  }
}

export function VideoLoopToggle({ enabled, onChange, disabled, status }: VideoLoopToggleProps) {
  const { label, title } = describe(enabled, status);
  const working = enabled && status === "pending";
  return (
    <button
      type="button"
      className={classNames("toolbar-button", { "toolbar-button-active": enabled, "toolbar-button-working": working })}
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      aria-pressed={enabled}
      title={title}
    >
      {label}
    </button>
  );
}
