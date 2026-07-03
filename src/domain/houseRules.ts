/**
 * 抗贡房规预设 — 依据国标掼蛋及常见地方变体整理。
 * @see docs/PRD-Web.md 附录 C
 */

import type { AntiTributePresetId } from '@/types/houseRules';
export type { AntiTributePresetId } from '@/types/houseRules';
export { DEFAULT_ANTI_TRIBUTE_PRESET } from '@/types/houseRules';

export interface AntiTributePreset {
  id: AntiTributePresetId;
  label: string;
  description: string;
  confirmMessage: string;
  successMessageTemplate: string;
}

export const ANTI_TRIBUTE_PRESETS: readonly AntiTributePreset[] = [
  {
    id: 'combined_double_joker',
    label: '国标：合计双大王',
    description:
      '应进贡方合计持有 2 张大王即可抗贡。单下时末游一人双大王；双下时两下游合计双大王。',
    confirmMessage: '确认进贡方合计抓到 2 张大王？',
    successMessageTemplate: '抗贡！{leader} 领出',
  },
  {
    id: 'double_down_joker_split',
    label: '双下：各一大王或一方双大王',
    description:
      '仅双下局适用：两下游各抓 1 张大王，或任一人抓 2 张大王，则双方均不进贡。单下局仍按合计双大王判定。',
    confirmMessage: '确认双下局满足抗贡条件（各一大王或一方双大王）？',
    successMessageTemplate: '抗贡！{leader} 领出',
  },
  {
    id: 'four_jokers',
    label: '四张王牌',
    description:
      '应进贡的两人合计持有全部 4 张王牌（两大王 + 两小王）时抗贡，头游领出。',
    confirmMessage: '确认进贡方合计抓到全部 4 张王牌？',
    successMessageTemplate: '抗贡！{leader} 领出',
  },
  {
    id: 'disabled',
    label: '关闭抗贡',
    description: '不允许抗贡，必须按名次进贡还贡。',
    confirmMessage: '',
    successMessageTemplate: '',
  },
] as const;

export function getAntiTributePreset(
  id: AntiTributePresetId,
): AntiTributePreset {
  const preset = ANTI_TRIBUTE_PRESETS.find((p) => p.id === id);
  if (!preset) {
    return ANTI_TRIBUTE_PRESETS[0]!;
  }
  return preset;
}

export function isAntiTributeEnabled(presetId: AntiTributePresetId): boolean {
  return presetId !== 'disabled';
}

export function formatAntiTributeSuccess(
  presetId: AntiTributePresetId,
  leaderName: string,
): string {
  const preset = getAntiTributePreset(presetId);
  return preset.successMessageTemplate.replace('{leader}', leaderName);
}

export function getAntiTributeConfirmMessage(
  presetId: AntiTributePresetId,
): string {
  return getAntiTributePreset(presetId).confirmMessage;
}
