import { describe, expect, it, vi } from 'vitest';
import {
  MODEL_FONT_STYLESHEETS,
  MODEL_SKIN_STORAGE_KEY,
  normalizeModelSkin,
  persistModelSkin,
} from '../src/lib/model-skins';

describe('saved design preferences', () => {
  it.each(['gpt-55-sol-high', 'gpt-56-sol-high'])('migrates %s to Astra', (skin) => {
    expect(normalizeModelSkin(skin)).toBe('astra-6-ultra');
  });

  it.each([null, undefined, '', 'unknown-theme', 'constructor', '__proto__'])('rejects invalid preference %s', (skin) => {
    expect(normalizeModelSkin(skin)).toBe('');
  });

  it.each(['astra-6-ultra', 'grok-46', 'claude-opus-5', 'kimi-k3'])('preserves supported preference %s', (skin) => {
    expect(normalizeModelSkin(skin)).toBe(skin);
  });

  it('works even when accessing browser storage is forbidden', () => {
    expect(() => persistModelSkin('astra-6-ultra', () => {
      throw new DOMException('Storage blocked', 'SecurityError');
    })).not.toThrow();
  });

  it('tolerates quota failures and removes the preference for the default design', () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); }),
      removeItem: vi.fn(),
    };
    expect(() => persistModelSkin('astra-6-ultra', () => storage)).not.toThrow();
    persistModelSkin('', () => storage);
    expect(storage.removeItem).toHaveBeenCalledWith(MODEL_SKIN_STORAGE_KEY);
  });

  it('does not request web fonts for Astra or the default design', () => {
    expect(MODEL_FONT_STYLESHEETS['astra-6-ultra']).toBeUndefined();
    expect(MODEL_FONT_STYLESHEETS['']).toBeUndefined();
  });
});
