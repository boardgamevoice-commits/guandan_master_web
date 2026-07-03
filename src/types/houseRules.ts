/** 抗贡房规预设 ID — 类型层，domain 与 stores 共用 */
export type AntiTributePresetId =
  | 'combined_double_joker'
  | 'double_down_joker_split'
  | 'four_jokers'
  | 'disabled';

export const DEFAULT_ANTI_TRIBUTE_PRESET: AntiTributePresetId =
  'combined_double_joker';
