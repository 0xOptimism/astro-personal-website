export const MODEL_SKIN_STORAGE_KEY = 'selected-model-skin';
export const MODEL_SKIN_CHANGE_EVENT = 'model-skin-change';

export const MODEL_SKINS = [
  { id: 'brand-default', label: 'Yannis', skin: '', accent: '#0f766e', pulse: '#e4a02b' },
  { id: 'grok-46', label: 'Grok 4.6', skin: 'grok-46', accent: '#c8ff4d', pulse: '#ff3d7a' },
  { id: 'claude-opus-5', label: 'Claude Opus 5', skin: 'claude-opus-5', accent: '#a34a28', pulse: '#3f5468' },
  { id: 'kimi-k3', label: 'Kimi K3', skin: 'kimi-k3', accent: '#9db8ff', pulse: '#ffb86b' },
  { id: 'astra-6-ultra', label: 'Astra 6 Ultra', skin: 'astra-6-ultra', accent: '#b54127', pulse: '#ece6db' },
] as const;

export type ModelSkin = (typeof MODEL_SKINS)[number]['skin'];

// Both the first-paint script and the interactive switcher use this allowlist.
export const MODEL_SKIN_ALIASES: Record<string, ModelSkin> = {
  ...Object.fromEntries(MODEL_SKINS.map(({ skin }) => [skin, skin])),
  'gpt-55-sol-high': 'astra-6-ultra',
  'gpt-56-sol-high': 'astra-6-ultra',
};

export function normalizeModelSkin(value: unknown): ModelSkin {
  return typeof value === 'string' && Object.hasOwn(MODEL_SKIN_ALIASES, value)
    ? MODEL_SKIN_ALIASES[value]
    : '';
}

// Download only the families used by the selected design. Astra and the default
// design use installed system fonts and never need a font stylesheet.
export const MODEL_FONT_STYLESHEETS: Partial<Record<ModelSkin, string>> = {
  'grok-46': 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap',
  'claude-opus-5': 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600&display=swap',
  'kimi-k3': 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@400;500;600;700&family=Unbounded:wght@500;600;700;800&display=swap',
};

type SkinStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function persistModelSkin(
  skin: ModelSkin,
  getStorage: () => SkinStorage = () => window.localStorage,
): void {
  try {
    const storage = getStorage();
    if (skin) storage.setItem(MODEL_SKIN_STORAGE_KEY, skin);
    else storage.removeItem(MODEL_SKIN_STORAGE_KEY);
  } catch {
    // The selection still works when storage is blocked or full.
  }
}
