import { AUTO_COMPOSITION, type ArtStyleOption } from "@orbis/shared";

interface CompositionPickerProps {
  compositions: ArtStyleOption[];
  value: string;
  onChange: (composition: string) => void;
  disabled: boolean;
  artStyle: string;
  autoView: Record<string, string>;
  viewLockedStyles: string[];
}

const VIEW_LABELS_VI: Record<string, string> = {
  auto: "Tự động",
  flat: "Phẳng",
  isometric: "Đẳng cự",
  diorama: "Diorama",
};

function viLabel(option: ArtStyleOption): string {
  return VIEW_LABELS_VI[option.name] ?? option.label;
}

export function CompositionPicker({
  compositions,
  value,
  onChange,
  disabled,
  artStyle,
  autoView,
  viewLockedStyles,
}: CompositionPickerProps) {
  if (compositions.length < 2) return null;

  if (viewLockedStyles.includes(artStyle)) {
    return (
      <label className="style-picker">
        <span className="style-picker-caption">Góc nhìn</span>
        <select className="style-picker-select" value="built-in" disabled title="Phong cách này tự quyết định góc nhìn.">
          <option value="built-in">Cố định theo phong cách</option>
        </select>
      </label>
    );
  }

  const resolvedName = autoView[artStyle];
  const resolved = compositions.find((c) => c.name === resolvedName);
  const resolvedLabel = resolved ? viLabel(resolved) : undefined;
  const options = compositions.map((c) =>
    c.name === AUTO_COMPOSITION && resolvedLabel ? { ...c, label: `Tự động (${resolvedLabel})` } : { ...c, label: viLabel(c) },
  );

  return (
    <label className="style-picker">
      <span className="style-picker-caption">Góc nhìn</span>
      <select
        className="style-picker-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        title="Bố cục/góc nhìn cho trang mới; Tự động cho phép phong cách chọn cách trình bày phù hợp nhất"
      >
        {options.map((composition) => (
          <option key={composition.name} value={composition.name}>
            {composition.label}
          </option>
        ))}
      </select>
    </label>
  );
}
