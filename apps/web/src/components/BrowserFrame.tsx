import type { ReactNode } from "react";

interface BrowserFrameProps {
  addressBar: ReactNode;
  toolbar?: ReactNode;
  /** Trở về trang bắt đầu. */
  onHome?: () => void;
  homeDisabled?: boolean;
  children: ReactNode;
}

export function BrowserFrame({ addressBar, toolbar, onHome, homeDisabled, children }: BrowserFrameProps) {
  return (
    <div className="browser-frame">
      <div className="browser-titlebar">
        <div className="window-dots" aria-hidden="true">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        {onHome && (
          <button
            type="button"
            className="home-button"
            onClick={onHome}
            disabled={homeDisabled}
            title="Trở về trang bắt đầu"
          >
            <span aria-hidden="true">⌂</span>
            <span className="home-button-text">Trang chủ</span>
          </button>
        )}
        {addressBar}
      </div>
      {toolbar && <div className="browser-toolbar" aria-label="Công cụ tạo trang">{toolbar}</div>}
      <div className="browser-content">{children}</div>
    </div>
  );
}
