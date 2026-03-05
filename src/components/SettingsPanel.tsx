interface Settings {
  crtEnabled: boolean;
  flickerEnabled: boolean;
  backgroundEnabled: boolean;
}

interface SettingsPanelProps {
  settings: Settings;
  onToggle: (key: keyof Settings) => void;
  onClose: () => void;
}

function Toggle({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div
      className="flex items-center justify-between py-2 cursor-pointer text-terminal-amber"
      onClick={onToggle}
    >
      <span className="text-sm">{label}</span>
      <span
        className="text-sm font-bold px-2 py-0.5 border"
        style={{
          borderColor: enabled ? 'var(--color-terminal-amber)' : 'var(--color-terminal-amber-dim)',
          color: enabled ? 'var(--color-terminal-amber)' : 'var(--color-terminal-amber-dim)',
          backgroundColor: enabled ? 'color-mix(in oklch, var(--color-terminal-amber) 15%, transparent)' : 'transparent',
        }}
      >
        {enabled ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}

export default function SettingsPanel({ settings, onToggle, onClose }: SettingsPanelProps) {
  return (
    <div
      className="fixed inset-0 z-[8999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-80 font-mono border border-terminal-amber bg-terminal-bg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="text-sm font-bold mb-3 pb-2 border-b border-terminal-amber text-terminal-amber flex justify-between"
        >
          <span>TERMINAL SETTINGS</span>
          <button className="close-btn" onClick={onClose}>[X]</button>
        </div>

        <Toggle label="CRT SCANLINES" enabled={settings.crtEnabled} onToggle={() => onToggle('crtEnabled')} />
        <Toggle label="SCREEN FLICKER" enabled={settings.flickerEnabled} onToggle={() => onToggle('flickerEnabled')} />
        <Toggle label="PARTICLE BACKGROUND" enabled={settings.backgroundEnabled} onToggle={() => onToggle('backgroundEnabled')} />

        <div
          className="text-[10px] mt-4 pt-2 border-t border-terminal-amber text-terminal-amber-dim text-center"
        >
          EFFECTS AUTO-DISABLED FOR REDUCED MOTION PREFERENCE
        </div>
      </div>
    </div>
  );
}
