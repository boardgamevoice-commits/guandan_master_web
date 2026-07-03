import { describe, expect, it } from 'vitest';
import {
  ANTI_TRIBUTE_PRESETS,
  DEFAULT_ANTI_TRIBUTE_PRESET,
  formatAntiTributeSuccess,
  getAntiTributeConfirmMessage,
  getAntiTributePreset,
  isAntiTributeEnabled,
} from './houseRules';

describe('houseRules', () => {
  it('默认预设为国标合计双大王', () => {
    expect(DEFAULT_ANTI_TRIBUTE_PRESET).toBe('combined_double_joker');
  });

  it('包含 4 项抗贡预设', () => {
    expect(ANTI_TRIBUTE_PRESETS).toHaveLength(4);
  });

  it('关闭抗贡时不允许勾选', () => {
    expect(isAntiTributeEnabled('disabled')).toBe(false);
    expect(isAntiTributeEnabled('combined_double_joker')).toBe(true);
  });

  it('抗贡成功文案替换领出者', () => {
    expect(
      formatAntiTributeSuccess('combined_double_joker', '张三'),
    ).toBe('抗贡！张三 领出');
  });

  it('关闭抗贡时无确认文案', () => {
    expect(getAntiTributeConfirmMessage('disabled')).toBe('');
  });

  it('各预设均有确认文案（除 disabled）', () => {
    for (const preset of ANTI_TRIBUTE_PRESETS) {
      if (preset.id === 'disabled') continue;
      expect(getAntiTributePreset(preset.id).confirmMessage.length).toBeGreaterThan(0);
    }
  });
});
