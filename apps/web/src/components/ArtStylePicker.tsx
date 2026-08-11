import type { ArtStyleOption } from "@orbis/shared";

interface ArtStylePickerProps {
  styles: ArtStyleOption[];
  value: string;
  onChange: (style: string) => void;
  disabled: boolean;
}

const STYLE_LABELS_VI: Record<string, string> = {
  felt: "Len nỉ",
  papercut: "Cắt giấy",
  riso: "In Risograph",
  pixel: "Pixel",
  editorial: "Minh họa biên tập",
  tiltshift: "Tilt-shift",
};

export function ArtStylePicker({ styles, value, onChange, disabled }: ArtStylePickerProps) {
  if (styles.length < 2) return null;

  return (
    <label className="style-picker">
      <span className="style-picker-caption">Phong cách</span>
      <select
        className="style-picker-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        title="Phong cách hiển thị cho các trang được tạo từ thời điểm này; trang đã tạo giữ nguyên"
      >
        {styles.map((style) => (
          <option key={style.name} value={style.name}>
            {STYLE_LABELS_VI[style.name] ?? style.label}
          </option>
        ))}
      </select>
    </label>
  );
}
