import type { GenerationStage } from "@orbis/shared";
import { useElapsedSeconds } from "../hooks/useElapsedSeconds";

export interface GenerationProgressProps {
  stage?: GenerationStage;
  /** Chế độ chạm: tên đối tượng mà mô hình thị giác nhận diện được. */
  tapSubject?: string;
  /** Có từ giai đoạn vẽ trở đi. */
  pageTitle?: string;
  /** Thời điểm bắt đầu sinh trang (epoch ms). */
  startedAt?: number;
}

const ELAPSED_AFTER_SECONDS = 8;

function label(stage: GenerationStage | undefined, tapSubject: string | undefined, pageTitle: string | undefined): string {
  switch (stage) {
    case "searching":
      return "Đang tra cứu thông tin trên web";
    case "authoring":
      return tapSubject ? `Đang soạn nội dung về ${tapSubject}` : "Đang soạn nội dung trang";
    case "drawing":
      return pageTitle ? `Đang vẽ ${pageTitle}` : "Đang vẽ trang";
    default:
      return tapSubject ? `Đang nhận diện ${tapSubject}` : "Đang khởi tạo";
  }
}

export function GenerationProgress({ stage, tapSubject, pageTitle, startedAt }: GenerationProgressProps) {
  const elapsed = useElapsedSeconds(startedAt);
  const showElapsed = elapsed !== null && elapsed >= ELAPSED_AFTER_SECONDS;

  return (
    <div className="generation-progress" role="status" aria-live="polite">
      <span className="generation-progress-spinner" aria-hidden="true" />
      <span className="generation-progress-label">
        {label(stage, tapSubject, pageTitle)}
        <span className="generation-progress-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </span>
      {showElapsed && <span className="generation-progress-elapsed">{elapsed} giây</span>}
    </div>
  );
}
