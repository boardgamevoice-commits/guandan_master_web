import type { HouseRules, ResultType, Team } from '@/types/game';

export interface AceEvaluation {
  passed: boolean;
  message: string | null;
}

interface AceInput {
  winner: Team;
  resultType: ResultType;
  beforeOurLevel: number;
  beforeOpponentLevel: number;
  afterOurLevel: number;
  afterOpponentLevel: number;
  houseRules: HouseRules;
}

/**
 * 过 A 判定（简化版）：
 * - 赢家到达 A(14) 后的后续胜利才有机会过 A。
 * - 若房规要求“双下过 A”，则必须双下。
 */
export function evaluateAce(input: AceInput): AceEvaluation {
  const beforeWinnerLevel =
    input.winner === 'our' ? input.beforeOurLevel : input.beforeOpponentLevel;
  const afterWinnerLevel =
    input.winner === 'our' ? input.afterOurLevel : input.afterOpponentLevel;

  if (afterWinnerLevel < 14) {
    return { passed: false, message: null };
  }

  if (beforeWinnerLevel < 14 && afterWinnerLevel === 14) {
    return { passed: false, message: `${teamLabel(input.winner)}到达 A，继续争过 A` };
  }

  if (input.houseRules.aceRequiresDoubleDown && input.resultType !== 'double_down') {
    return {
      passed: false,
      message: `${teamLabel(input.winner)}打 A 失败：房规要求双下过 A`,
    };
  }

  return { passed: true, message: `${teamLabel(input.winner)}过 A 成功` };
}

function teamLabel(team: Team): string {
  return team === 'our' ? '南北队' : '东西队';
}
