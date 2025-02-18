// src/types/OmikenZod.ts
import { z } from 'zod';
import { omikujiSchema, placeSchema, CommentRulesSchema, TimerRulesSchema, MetaRulesSchema } from './OmikenSchemas';
import { commentThresholdSchema, timerThresholdSchema, metaThresholdSchema } from './OmikenThresholdSchemas';

// おみくじデータの型定義
export type OmikenType = {
 [K in RuleCategory]: Record<string, RulesTypeMap<K>>;
} & {
 omikujis: Record<string, OmikujiType>;
 places: Record<string, PlaceType>;
};

export type OmikenTypeMap<T extends RuleCategory | 'omikujis' | 'places'> = T extends RuleCategory
 ? RulesTypeMap<T>
 : T extends 'omikujis'
   ? OmikujiType
   : PlaceType;

// 基本的なカテゴリー定義
export const ruleCategories = ['comments', 'timers', 'metas'] as const;
export type RuleCategory = (typeof ruleCategories)[number];
export type OmikenCategory = RuleCategory | 'omikujis' | 'places';

// rules
export type RulesType = CommentRulesType | TimerRulesType | MetaRulesType;
export type CommentRulesType = z.infer<typeof CommentRulesSchema>;
export type TimerRulesType = z.infer<typeof TimerRulesSchema>;
export type MetaRulesType = z.infer<typeof MetaRulesSchema>;

export type RulesTypeMap<T extends RuleCategory> = {
 comments: CommentRulesType;
 timers: TimerRulesType;
 metas: MetaRulesType;
}[T];

// omikujis/places
export type OmikujiType = z.infer<typeof omikujiSchema>;
export type PlaceType = z.infer<typeof placeSchema>;
export type PlaceValueType = PlaceType['values'][number];

// Threshold関連の型定義
export type ThresholdSchemas = {
 comments: typeof commentThresholdSchema;
 timers: typeof timerThresholdSchema;
 metas: typeof metaThresholdSchema;
};

export type ThresholdTypes = ThresholdTypesMap[RuleCategory];
export type ThresholdTypesMap = {
 [K in keyof ThresholdSchemas]: z.infer<ThresholdSchemas[K]>;
};

export type CriterionTypes = CriterionTypesMap[RuleCategory];
export type CriterionTypesMap = {
 [K in keyof ThresholdTypesMap]: ThresholdTypesMap[K]['criteria'][number];
};
