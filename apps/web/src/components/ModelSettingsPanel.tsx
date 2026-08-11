import { useEffect, useRef, useState } from "react";
import type { ModelSettings, ProviderOption } from "@orbis/shared";
import { pruneEmptyPrefs, type ModelPrefs } from "../lib/persistedPrefs";
import { classNames } from "../lib/classNames";
import { useDismiss } from "../hooks/useDismiss";

interface ModelSettingsPanelProps {
  settings: ModelSettings;
  prefs: ModelPrefs;
  onChange: (prefs: ModelPrefs) => void;
  disabled: boolean;
}

const CUSTOM = "__custom__";
const PANEL_WIDTH = 320;

function defaultLabel(current: string): string {
  return current ? `Mặc định máy chủ (${current})` : "Mặc định máy chủ";
}

interface FieldProps {
  label: string;
  disabled: boolean;
}

function ProviderField({
  label,
  options,
  current,
  value,
  onChange,
  disabled,
}: FieldProps & {
  options: ProviderOption[];
  current: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label className="model-settings-row">
      <span className="model-settings-label">{label}</span>
      <select
        className="style-picker-select"
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        <option value="">{defaultLabel(current)}</option>
        {options.map((option) => (
          <option key={option.name} value={option.name} disabled={!option.available}>
            {option.label}
            {option.available ? "" : " - chưa có API key"}
          </option>
        ))}
      </select>
    </label>
  );
}

function ModelField({
  label,
  models,
  current,
  value,
  onChange,
  disabled,
}: FieldProps & {
  models: string[];
  current: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const typed = value !== undefined && value !== "" && !models.includes(value);
  const [customMode, setCustomMode] = useState(typed);
  const showCustom = customMode || typed;

  return (
    <label className="model-settings-row">
      <span className="model-settings-label">{label}</span>
      <span className="model-settings-control">
        <select
          className="style-picker-select"
          value={showCustom ? CUSTOM : (value ?? "")}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.value === CUSTOM) {
              setCustomMode(true);
              return;
            }
            setCustomMode(false);
            onChange(e.target.value || undefined);
          }}
        >
          <option value="">{defaultLabel(current)}</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
          <option value={CUSTOM}>Tùy chỉnh…</option>
        </select>
        {showCustom && (
          <input
            className="model-settings-input"
            type="text"
            value={typed ? value : ""}
            placeholder="ID model"
            spellCheck={false}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value || undefined)}
          />
        )}
      </span>
    </label>
  );
}

function ChoiceField({
  label,
  choices,
  current,
  value,
  onChange,
  disabled,
}: FieldProps & {
  choices: string[];
  current: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  if (choices.length === 0) return null;
  return (
    <label className="model-settings-row">
      <span className="model-settings-label">{label}</span>
      <select
        className="style-picker-select"
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        <option value="">{defaultLabel(current)}</option>
        {choices.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ModelSettingsPanel({ settings, prefs, onChange, disabled }: ModelSettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState({ top: 0, left: 0 });

  const placeUnderButton = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnchor({ top: rect.bottom + 8, left: Math.max(8, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 12)) });
  };

  useDismiss(open, () => setOpen(false), rootRef);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", placeUnderButton);
    window.addEventListener("scroll", placeUnderButton, true);
    return () => {
      window.removeEventListener("resize", placeUnderButton);
      window.removeEventListener("scroll", placeUnderButton, true);
    };
  }, [open]);

  if (settings.image.providers.length === 0) return null;

  const update = <K extends keyof ModelPrefs>(key: K, value: ModelPrefs[K]) => onChange({ ...prefs, [key]: value });

  const changeProvider = (providerKey: "image_provider" | "video_provider", modelKey: "image_model" | "video_model") =>
    (value: string | undefined) => onChange({ ...prefs, [providerKey]: value, [modelKey]: undefined });

  const changed = Object.keys(pruneEmptyPrefs(prefs)).length;
  const activeImageProvider = prefs.image_provider ?? settings.image.provider;
  const activeVideoProvider = prefs.video_provider ?? settings.video.provider;

  const defaultModelFor = (picked: string, serverProvider: string, serverModel: string): string =>
    picked === serverProvider ? serverModel : "";

  return (
    <div className="model-settings" ref={rootRef}>
      <button
        type="button"
        ref={buttonRef}
        className={classNames("toolbar-button", { "toolbar-button-active": changed > 0 })}
        onClick={() => {
          if (!open) placeUnderButton();
          setOpen((v) => !v);
        }}
        title="Chọn nhà cung cấp và model dùng để tạo ảnh/video cho các trang mới"
        aria-expanded={open}
      >
        ⚙ Model{changed > 0 ? ` (${changed})` : ""}
      </button>

      {open && (
        <div className="model-settings-panel" style={{ top: anchor.top, left: anchor.left }}>
          <p className="model-settings-title">Ảnh</p>
          <ProviderField
            label="Nhà cung cấp"
            options={settings.image.providers}
            current={settings.image.provider}
            value={prefs.image_provider}
            onChange={changeProvider("image_provider", "image_model")}
            disabled={disabled}
          />
          <ModelField
            label="Model"
            models={settings.image.providers.find((p) => p.name === activeImageProvider)?.models ?? []}
            current={defaultModelFor(activeImageProvider, settings.image.provider, settings.image.model)}
            value={prefs.image_model}
            onChange={(v) => update("image_model", v)}
            disabled={disabled}
          />
          {activeImageProvider === "gemini" && (
            <ChoiceField
              label="Kích thước ảnh"
              choices={settings.extras.geminiImageSizes}
              current={settings.extras.geminiImageSize}
              value={prefs.gemini_image_size}
              onChange={(v) => update("gemini_image_size", v)}
              disabled={disabled}
            />
          )}
          {activeImageProvider === "openai" && (
            <ChoiceField
              label="Chất lượng"
              choices={settings.extras.openaiImageQualities}
              current={settings.extras.openaiImageQuality}
              value={prefs.openai_image_quality}
              onChange={(v) => update("openai_image_quality", v)}
              disabled={disabled}
            />
          )}
          {activeImageProvider === "ark" && (
            <ModelField
              label="Model dự phòng"
              models={settings.image.providers.find((p) => p.name === "ark")?.models ?? []}
              current={settings.extras.arkFallbackModel}
              value={prefs.ark_fallback_model}
              onChange={(v) => update("ark_fallback_model", v)}
              disabled={disabled}
            />
          )}

          <p className="model-settings-title">Video</p>
          <ProviderField
            label="Nhà cung cấp"
            options={settings.video.providers}
            current={settings.video.provider}
            value={prefs.video_provider}
            onChange={changeProvider("video_provider", "video_model")}
            disabled={disabled}
          />
          <ModelField
            label="Model"
            models={settings.video.providers.find((p) => p.name === activeVideoProvider)?.models ?? []}
            current={defaultModelFor(activeVideoProvider, settings.video.provider, settings.video.model)}
            value={prefs.video_model}
            onChange={(v) => update("video_model", v)}
            disabled={disabled}
          />
          <ChoiceField
            label="Độ phân giải"
            choices={settings.video.resolutions}
            current={settings.video.resolution}
            value={prefs.video_resolution}
            onChange={(v) => update("video_resolution", v)}
            disabled={disabled}
          />
          <label className="model-settings-row">
            <span className="model-settings-label">Thời lượng (giây)</span>
            <input
              className="model-settings-input"
              type="number"
              min={1}
              step={1}
              max={settings.video.maxDurationSeconds}
              placeholder={String(settings.video.durationSeconds)}
              value={prefs.video_duration_seconds ?? ""}
              disabled={disabled}
              onChange={(e) => {
                const n = Math.floor(Number(e.target.value));
                update("video_duration_seconds", e.target.value === "" || !Number.isFinite(n) || n <= 0 ? undefined : n);
              }}
            />
          </label>

          <p className="model-settings-note">
            Chỉ áp dụng cho trang mới. Mỗi yêu cầu video tối đa {settings.video.maxDurationSeconds} giây.
          </p>
          <div className="model-settings-actions">
            <button type="button" className="toolbar-button" onClick={() => onChange({})} disabled={disabled || changed === 0}>
              Khôi phục mặc định máy chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
