interface Settings {
  backgroundEnabled: boolean;
  crtEnabled: boolean;
  flickerEnabled: boolean;
}

interface SettingsPanelProps {
  onClose: () => void;
  onToggle: (key: keyof Settings) => void;
  settings: Settings;
}

function Toggle({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent py-2 text-left font-mono text-terminal-amber"
      onClick={onToggle}
      type="button"
    >
      <span className="text-sm">{label}</span>
      <span
        className="border px-2 py-0.5 font-bold text-sm"
        style={{
          borderColor: enabled
            ? "var(--color-terminal-amber)"
            : "var(--color-terminal-amber-dim)",
          color: enabled
            ? "var(--color-terminal-amber)"
            : "var(--color-terminal-amber-dim)",
          backgroundColor: enabled
            ? "color-mix(in oklch, var(--color-terminal-amber) 15%, transparent)"
            : "transparent",
        }}
      >
        {enabled ? "ON" : "OFF"}
      </span>
    </button>
  );
}

export default function SettingsPanel({
  settings,
  onToggle,
  onClose,
}: SettingsPanelProps) {
  return (
    <button
      aria-label="Close settings"
      className="fixed inset-0 z-[8999] flex items-center justify-center border-none bg-transparent p-0"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      type="button"
    >
      <div
        className="w-80 border border-terminal-amber bg-terminal-bg p-4 font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex justify-between border-terminal-amber border-b pb-2 font-bold text-sm text-terminal-amber">
          <span>TERMINAL SETTINGS</span>
          <button className="close-btn" onClick={onClose} type="button">
            [X]
          </button>
        </div>

        <Toggle
          enabled={settings.crtEnabled}
          label="CRT SCANLINES"
          onToggle={() => onToggle("crtEnabled")}
        />
        <Toggle
          enabled={settings.flickerEnabled}
          label="SCREEN FLICKER"
          onToggle={() => onToggle("flickerEnabled")}
        />
        <Toggle
          enabled={settings.backgroundEnabled}
          label="PARTICLE BACKGROUND"
          onToggle={() => onToggle("backgroundEnabled")}
        />

        <div className="mt-4 border-terminal-amber border-t pt-2 text-center text-[10px] text-terminal-amber-dim">
          EFFECTS AUTO-DISABLED FOR REDUCED MOTION PREFERENCE
        </div>
      </div>
    </button>
  );
}
