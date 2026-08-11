import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DEMO_ROOT_ID, type Node } from "@orbis/shared";
import { deleteNode, fetchGalleryPage } from "../lib/api";
import { useCancellableEffect } from "../hooks/useCancellableEffect";
import { BranchIcon } from "./PageVersions";

const GALLERY_PAGE_SIZE = 12;

const SUGGESTIONS = [
  "Hệ sinh thái rạn san hô",
  "Sứ mệnh Apollo 11 hoạt động như thế nào",
  "Khám phá ẩm thực đường phố Tokyo",
  "Lịch sử máy in",
];

function thumbnailUrl(node: Node): string | undefined {
  return node.image_variants["16:9"] ?? Object.values(node.image_variants)[0];
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

type DeleteFlow = { id: string; phase: "confirm" | "deleting" | "error"; message?: string };

export function Landing({ onSuggestion }: { onSuggestion: (query: string) => void }) {
  const [gallery, setGallery] = useState<Node[] | null>(null);
  const [versionCounts, setVersionCounts] = useState<Record<string, number>>({});
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [deleteFlow, setDeleteFlow] = useState<DeleteFlow | null>(null);
  const loadingRef = useRef(false);

  useCancellableEffect((cancelled) => {
    fetchGalleryPage(GALLERY_PAGE_SIZE)
      .then((page) => {
        if (cancelled()) return;
        setGallery(page.nodes);
        setVersionCounts(page.versionCounts);
        setCursor(page.nextCursor);
      })
      .catch(() => {
        if (!cancelled()) setGallery([]);
      });
  }, []);

  const loadMore = useCallback(() => {
    if (cursor === null || loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);
    fetchGalleryPage(GALLERY_PAGE_SIZE, cursor)
      .then((page) => {
        setGallery((prev) => [...(prev ?? []), ...page.nodes]);
        setVersionCounts((prev) => ({ ...prev, ...page.versionCounts }));
        setCursor(page.nextCursor);
      })
      .catch(() => setLoadMoreError(true))
      .finally(() => {
        loadingRef.current = false;
        setLoadingMore(false);
      });
  }, [cursor]);

  const confirmDelete = useCallback((id: string) => {
    setDeleteFlow({ id, phase: "deleting" });
    deleteNode(id)
      .then(() => {
        setGallery((prev) => (prev ?? []).filter((n) => n.id !== id));
        setVersionCounts((prev) => {
          const { [id]: _removed, ...rest } = prev;
          return rest;
        });
        setDeleteFlow(null);
      })
      .catch((err: unknown) => {
        setDeleteFlow({ id, phase: "error", message: err instanceof Error ? err.message : "Không thể xóa trang" });
      });
  }, []);

  return (
    <div className="landing">
      <p className="landing-copy">
        Trang phía trên là bản demo trực tiếp: chạm vào một điểm phát sáng để mở nội dung, rồi dùng đường dẫn để quay lại. Demo chỉ đọc nên bạn có thể thử mà không tiêu tốn hạn mức tạo ảnh.
      </p>
      <p className="landing-copy">
        Muốn tự khám phá? Hãy nhập bất kỳ chủ đề nào vào thanh địa chỉ. Mỗi trang được tạo theo thời gian thực thành một hình ảnh duy nhất, không phải HTML; chạm vào một đối tượng trong ảnh sẽ mở một trang mới về chính đối tượng đó.
      </p>

      {gallery === null && <p className="landing-loading">Đang tải ví dụ…</p>}

      {gallery !== null && gallery.length > 0 && (
        <>
          <div className="landing-gallery">
            {gallery.map((node) => {
              const count = versionCounts[node.id] ?? 0;
              const flow = deleteFlow?.id === node.id ? deleteFlow : null;
              return (
                <Link key={node.id} to={`/n/${node.id}`} className="gallery-card">
                  {thumbnailUrl(node) && <img src={thumbnailUrl(node)} alt="" loading="lazy" />}
                  {count > 1 && (
                    <span className="card-branch-badge" title={`${count} phiên bản`}>
                      <BranchIcon strokeWidth={2.4} />
                      {count}
                    </span>
                  )}
                  {node.id !== DEMO_ROOT_ID && (
                    <button
                      type="button"
                      className="card-delete-button"
                      aria-label="Xóa trang này"
                      title="Xóa trang này"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteFlow({ id: node.id, phase: "confirm" });
                      }}
                    >
                      <TrashIcon />
                    </button>
                  )}
                  <span className="gallery-card-title">{node.page_title}</span>

                  {flow && (
                    <div className="card-delete-overlay" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      {flow.phase === "error" ? (
                        <>
                          <p className="card-delete-message">{flow.message}</p>
                          <button type="button" className="card-delete-dismiss" onClick={() => setDeleteFlow(null)}>
                            Đóng
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="card-delete-message">
                            Xóa trang này và toàn bộ nhánh nội dung bên dưới? Thao tác này không thể hoàn tác.
                          </p>
                          <div className="card-delete-actions">
                            <button
                              type="button"
                              className="card-delete-confirm"
                              disabled={flow.phase === "deleting"}
                              onClick={() => confirmDelete(node.id)}
                            >
                              {flow.phase === "deleting" ? "Đang xóa…" : "Xóa"}
                            </button>
                            <button
                              type="button"
                              className="card-delete-cancel"
                              disabled={flow.phase === "deleting"}
                              onClick={() => setDeleteFlow(null)}
                            >
                              Hủy
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {loadMoreError && <p className="landing-error">Không thể tải thêm trang. Hãy thử lại.</p>}

          {cursor !== null && (
            <button type="button" className="load-more" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Đang tải…" : "Tải thêm"}
            </button>
          )}
        </>
      )}

      {gallery !== null && gallery.length === 0 && (
        <div className="landing-suggestions">
          <p>Chưa biết bắt đầu từ đâu? Hãy thử một chủ đề:</p>
          <div className="suggestion-chips">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="suggestion-chip" onClick={() => onSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
