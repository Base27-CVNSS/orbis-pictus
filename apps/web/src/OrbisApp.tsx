import { BrowserFrame } from "./components/BrowserFrame";
import { AddressBar } from "./components/AddressBar";
import { PageImage } from "./components/PageImage";
import { AspectRatioPicker } from "./components/AspectRatioPicker";
import { UploadButton } from "./components/UploadButton";
import { WebSearchToggle } from "./components/WebSearchToggle";
import { ArtStylePicker } from "./components/ArtStylePicker";
import { CompositionPicker } from "./components/CompositionPicker";
import { ModelSettingsPanel } from "./components/ModelSettingsPanel";
import { VideoLoopToggle } from "./components/VideoLoopToggle";
import { GenerationProgress } from "./components/GenerationProgress";
import { CachedTapMarkers } from "./components/CachedTapMarkers";
import { PageVersions } from "./components/PageVersions";
import { TapVariantPanel } from "./components/TapVariantPanel";
import { Landing } from "./components/Landing";
import { classNames } from "./lib/classNames";
import { useOrbisController } from "./hooks/useOrbisController";

export function OrbisApp({ initialNodeId }: { initialNodeId?: string }) {
  const {
    hydrating,
    hydrateError,
    sessionId,
    trail,
    currentIndex,
    current,
    config,
    setWebSearch,
    setArtStyle,
    setComposition,
    modelPrefs,
    setModelPrefs,
    notices,
    state,
    isStreaming,
    busy,
    preparingClips,
    lastRequest,
    setActionError,
    isQuotaError,
    bannerMessage,
    aspectRatio,
    variantLoading,
    showLoadingIndicator,
    showLanding,
    isDemo,
    displayRatio,
    imageUrl,
    ripple,
    setRipple,
    imgRef,
    videoLoopEnabled,
    setVideoLoopEnabled,
    idleLoopVideoUrl,
    videoGenerating,
    canGenerateVideo,
    videoRequestPending,
    handleGenerateVideo,
    morphUrl,
    morphActive,
    clearMorph,
    cachedTaps,
    tapDedupMode,
    variantPanelTap,
    versions,
    milestone,
    dismissMilestone,
    handleSearch,
    handleTap,
    handleOpenCachedTap,
    handleInspectCachedTap,
    handleCloseVariantPanel,
    handleDrawNewVariant,
    openExistingChild,
    openVersion,
    handleSetDefaultVersion,
    handleAddressSubmit,
    handleRetry,
    handleNavigate,
    handleRatioChange,
    handleUploaded,
    handleClear,
  } = useOrbisController(initialNodeId);

  if (hydrating) return <div className="loading-screen">Đang tải…</div>;
  if (hydrateError) return <div className="loading-screen">Không thể tải trang này: {hydrateError}</div>;

  return (
    <div className="app-shell">
      <header className="app-masthead">
        <span className="app-wordmark">Orbis Pictus</span>
        <span className="app-tagline">Bách khoa trực quan vô hạn, được AI vẽ khi bạn khám phá</span>
      </header>
      <BrowserFrame
        onHome={handleClear}
        homeDisabled={busy || showLanding || isDemo}
        addressBar={
          <AddressBar
            trail={trail}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
            onSubmit={handleAddressSubmit}
            disabled={busy}
            pendingLabel={isStreaming ? state.tapSubject : undefined}
            editMode={!!current && !isDemo}
          />
        }
        toolbar={
          <>
            <AspectRatioPicker value={aspectRatio} onChange={handleRatioChange} disabled={busy || variantLoading || (!!current && !isDemo)} />
            <WebSearchToggle enabled={config.webSearch} onChange={setWebSearch} disabled={busy} />
            <ArtStylePicker styles={config.artStyles} value={config.artStyle} onChange={setArtStyle} disabled={busy} />
            <CompositionPicker
              compositions={config.compositions}
              value={config.composition}
              onChange={setComposition}
              disabled={busy}
              artStyle={config.artStyle}
              autoView={config.autoView}
              viewLockedStyles={config.viewLockedStyles}
            />
            <ModelSettingsPanel settings={config.modelSettings} prefs={modelPrefs} onChange={setModelPrefs} disabled={busy} />
            {config.videoAvailable && (
              <VideoLoopToggle
                enabled={videoLoopEnabled}
                onChange={setVideoLoopEnabled}
                disabled={busy}
                status={idleLoopVideoUrl ? "ready" : current?.video_status}
              />
            )}
            {canGenerateVideo && (
              <button
                type="button"
                className={classNames("toolbar-button", { "toolbar-button-working": videoRequestPending })}
                onClick={handleGenerateVideo}
                disabled={videoRequestPending}
                title="Tạo video chuyển động lặp và morph chuyển trang nếu còn thiếu (sử dụng hạn mức video)"
              >
                {videoRequestPending ? "Đang khởi tạo…" : "✨ Tạo chuyển động"}
              </button>
            )}
            {config.uploadAvailable && (
              <UploadButton
                sessionId={sessionId}
                disabled={busy || variantLoading || isDemo}
                onUploaded={handleUploaded}
                onError={setActionError}
              />
            )}
          </>
        }
      >
        {showLanding ? (
          <Landing onSuggestion={handleSearch} />
        ) : (
          <PageImage
            imageUrl={imageUrl}
            videoUrl={idleLoopVideoUrl}
            morphUrl={morphUrl}
            morphActive={morphActive}
            onMorphEnded={clearMorph}
            markers={
              <CachedTapMarkers
                taps={cachedTaps}
                mode={tapDedupMode}
                onOpen={handleOpenCachedTap}
                onInspect={handleInspectCachedTap}
                hidden={busy || morphActive}
              />
            }
            versions={
              <PageVersions
                versions={versions}
                currentId={current?.id}
                onOpen={openVersion}
                onSetDefault={handleSetDefaultVersion}
                hidden={busy || morphActive}
              />
            }
            videoGenerating={videoGenerating}
            preparingClips={preparingClips}
            loading={showLoadingIndicator}
            loadingContent={
              isStreaming ? (
                <GenerationProgress
                  stage={state.stage}
                  tapSubject={state.tapSubject}
                  pageTitle={state.pageTitle}
                  startedAt={state.startedAt}
                />
              ) : undefined
            }
            onTap={handleTap}
            ripple={ripple}
            onRippleDone={() => setRipple(null)}
            imgRef={imgRef}
            aspectRatio={displayRatio}
          />
        )}
        {variantPanelTap && (
          <TapVariantPanel
            tap={variantPanelTap}
            onOpen={openExistingChild}
            onDrawNew={handleDrawNewVariant}
            onClose={handleCloseVariantPanel}
            busy={busy}
            readOnly={isDemo}
          />
        )}
        {isStreaming && state.tapSubject && <div className="tap-subject-banner">{state.tapSubject}</div>}
        {bannerMessage && (
          <div className={classNames("error-banner", { "error-banner-quota": isQuotaError })}>
            <span className="error-banner-icon">{isQuotaError ? "⚠️" : "✕"}</span>
            <span className="error-banner-message">{bannerMessage}</span>
            {state.status === "error" && lastRequest && (
              <button type="button" className="error-banner-retry" onClick={handleRetry}>
                Thử lại
              </button>
            )}
          </div>
        )}
        {notices.map((notice) => (
          <div key={`${notice.code}-${notice.requested ?? ""}`} className="notice-banner">
            <span className="notice-banner-icon">ℹ️</span>
            <span className="notice-banner-message">{notice.message}</span>
          </div>
        ))}
        {milestone !== null && (
          <div key={milestone} className="milestone-toast" onAnimationEnd={dismissMilestone}>
            🎉 Bạn đã khám phá {milestone} trang trong phiên này
          </div>
        )}
      </BrowserFrame>
      <p className="app-disclaimer">
        Nội dung tại đây do AI tạo. Hình ảnh và văn bản có thể không chính xác hoặc hoàn toàn hư cấu; không nên dùng làm nguồn sự thật duy nhất.
      </p>
      {isDemo && !showLanding && (
        <div className="landing-below">
          <Landing onSuggestion={handleSearch} />
        </div>
      )}
    </div>
  );
}
