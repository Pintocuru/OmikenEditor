// src/types/OmikenThresholdSchemas.ts
import { z } from 'zod';

// syoken:初見・コメント履歴の種別
export const SyokenCondition = {
 SYOKEN: 1, // 初見
 AGAIN: 2, // 前回のコメントから7日以上経過
 HI: 3, // 上記以外の、その配信枠で1回目のコメント
 ALL: 4 // 上記すべての、その配信枠で1回目のコメント
} as const;
export type SyokenCondition = (typeof SyokenCondition)[keyof typeof SyokenCondition];

// access:ユーザーの役職 0:OFF/1:だれでも/2:メンバー/3:モデレーター/4:管理者
export const AccessCondition = {
 MEMBER: 2,
 MODERATOR: 3,
 ADMIN: 4
} as const;
export type AccessCondition = (typeof AccessCondition)[keyof typeof AccessCondition];

// gift:ギフトのRank
export const GiftCondition = {
 All: 0, // 全て(メンバー加入含む)
 Blue: 1, // 200円未満
 LightBlue: 2, // 200円〜499円
 Green: 3, // 500円〜999円
 Yellow: 4, // 1,000円〜1,999円
 Orange: 5, // 2,000円〜4,999円
 Pink: 6, // 5,000円〜9,999円
 Red: 7, // 10,000円以上
 Purple: 8 // 20,000円以上
} as const;
export type GiftCondition = (typeof GiftCondition)[keyof typeof GiftCondition];

// 数値変換
const thresholdValueTransform = z.number().transform((val) => {
 return typeof val !== 'number' || val < 0 ? 0 : val;
});

// count:数値を参照する
export const thresholdCountSchema = z.object({
 comparison: z.enum([
  'min', // 数値以下(未満、～より上はありません)
  'max', // 数値以上
  'equal', // 等しい
  'loop' // 数値をvalue1で割った数
 ]),
 unit: z.enum([
  'draws', // その枠でrulesに該当した回数(個人)
  'gameDraws', // その配信枠でrulesに該当した回数(合計)
  'lc', // 配信枠のコメント数(プラグインで独自に付与)
  'tc', // 総数の個人コメ数(userData.tc)
  'intvlSec' // そのユーザーの前回のコメントからの経過時間(ミリ秒)(userData.interval)
 ]),
 value: thresholdValueTransform
});

// match:文字列を参照する
export const thresholdMatchSchema = z.object({
 target: z.enum([
  'status', // ユーザーごとのstatus
  'comment', // コメント(comment.data.comment)
  'name', // 名前(comment.data.name)
  'displayName' // ニックネーム(comment.data.displayName)
 ]),
 value: z.array(z.string()).default([])
});

// 共通のDraws条件スキーマ
const drawsConditionSchema = z.object({
 comparison: z.enum(['min', 'max', 'equal', 'loop']),
 unit: z.enum(['draws', 'gameDraws']),
 value: thresholdValueTransform
});

// コメント条件用スキーマ
const commentCriterionSchema = z.object({
 conditionType: z.union([
  z.literal('match'),
  z.literal('target'),
  z.literal('coolDown'),
  z.literal('syoken'),
  z.literal('access'),
  z.literal('gift'),
  z.literal('draws'),
  z.literal('count')
 ]),
 isNot: z.boolean().optional(),
 target: z.number().optional(),
 coolDown: z.number().optional(),
 syoken: z.nativeEnum(SyokenCondition).optional(),
 access: z.nativeEnum(AccessCondition).optional(),
 gift: z.nativeEnum(GiftCondition).optional(),
 draws: drawsConditionSchema.optional(),
 count: z
  .object({
   comparison: z.enum(['min', 'max', 'equal', 'loop']),
   unit: z.enum(['point', 'lc', 'tc', 'intvlSec']),
   value: thresholdValueTransform
  })
  .optional(),
 match: z
  .object({
   target: z.enum(['status', 'comment', 'name', 'displayName']),
   value: z.array(z.string()).default([])
  })
  .optional()
});

// タイマー条件用スキーマ
const timerCriterionSchema = z.object({
 conditionType: z.literal('draws'),
 isNot: z.boolean().optional(),
 draws: drawsConditionSchema
});

// メタ条件用スキーマ
const metaCriterionSchema = z.object({
 conditionType: z.enum(['draws', 'metaCount', 'dynamic']),
 isNot: z.boolean().optional(),
 draws: drawsConditionSchema.optional(),
 metaCount: z
  .object({
   comparison: z.enum(['min', 'max', 'equal', 'loop']),
   unit: z.enum(['streamDuration', 'totalGifts', 'followers']),
   value: thresholdValueTransform
  })
  .optional(),
 dynamic: z
  .object({
   comparison: z.enum(['min', 'max', 'different', 'increasing', 'newMaximum']),
   unit: z.enum(['upVote', 'viewer']),
   value: thresholdValueTransform
  })
  .optional()
});

// 3種類のThresholdスキーマ
export const commentThresholdSchema = z.object({
 type: z.literal('comment'),
 isAnd: z.boolean().optional(),
 criteria: z.array(commentCriterionSchema)
});

export const timerThresholdSchema = z.object({
 type: z.literal('timer'),
 isAnd: z.boolean().optional(),
 criteria: z.array(timerCriterionSchema)
});

export const metaThresholdSchema = z.object({
 type: z.literal('meta'),
 isAnd: z.boolean().optional(),
 criteria: z.array(metaCriterionSchema)
});

// 統合されたThresholdスキーマ
export const thresholdSchema = z.discriminatedUnion('type', [
 commentThresholdSchema,
 timerThresholdSchema,
 metaThresholdSchema
]);

// commentのthresholdデフォルト値
export const commentCriterionInit = {
 conditionType: 'match' as const,
 isNot: false as const,
 target: 2 as const,
 coolDown: 3 as const,
 syoken: SyokenCondition.SYOKEN,
 access: AccessCondition.MEMBER,
 gift: GiftCondition.All,
 draws: {
  comparison: 'max' as const,
  unit: 'draws' as const,
  value: 0 as const
 },
 count: {
  comparison: 'max' as const,
  unit: 'draws' as const,
  value: 0 as const
 },
 match: {
  target: 'comment' as const,
  case: 'starts' as const,
  value: ['^おみくじ']
 }
};

// timer の thresholdデフォルト値
export const timerCriterionInit = {
 conditionType: 'draws' as const,
 isNot: false as const,
 draws: {
  comparison: 'max' as const,
  unit: 'gameDraws' as const,
  value: 0 as const
 }
};

// meta の thresholdデフォルト値
export const metaCriterionInit = {
 conditionType: 'dynamic' as const,
 isNot: false as const,
 draws: {
  comparison: 'newMaximum' as const,
  unit: 'upVote' as const,
  value: 0 as const
 }
};
