// src/types/Omiken.ts

import {
 baseSchema,
 OneCommePostSchema,
 omikujiSchema,
 placeSchema,
 CommentRulesSchema,
 TimerRulesSchema,
 MetaRulesSchema
} from './OmikenSchemas';
import { z } from 'zod';
import { commentThresholdSchema, metaThresholdSchema, timerThresholdSchema } from './OmikenThresholdSchemas';

///////////////////////////////////
// Omiken
///////////////////////////////////

// Omiken:おみくじ&初見判定ちゃんBOT用型定義
export type OmikenType = {
 comments: Record<string, CommentRulesType>;
 timers: Record<string, TimerRulesType>;
 metas: Record<string, MetaRulesType>;
 omikujis: Record<string, OmikujiType>; // おみくじ
 places: Record<string, PlaceType>; // プレースホルダー
};

// BaseType:基本となる項目
export type BaseType = z.infer<typeof baseSchema>;

// rules:おみくじルールの型定義
export type OmikenRulesType = CommentRulesType | TimerRulesType | MetaRulesType;

export type CommentRulesType = z.infer<typeof CommentRulesSchema>;
export type TimerRulesType = z.infer<typeof TimerRulesSchema>;
export type MetaRulesType = z.infer<typeof MetaRulesSchema>;

// omikujis:おみくじの型定義
export type OmikujiType = z.infer<typeof omikujiSchema>;
// わんコメに渡す投稿情報
export type OneCommePostType = z.infer<typeof OneCommePostSchema>;

// places:プレースホルダーの型定義
export type PlaceType = z.infer<typeof placeSchema>;
export type PlaceValueType = z.infer<typeof placeSchema>['values'][number];

// Threshold の条件型
export type ThresholdType = CommentThreshold | TimerThreshold | MetaThreshold;
export type CriterionType = CommentCriterion | TimerCriterion | MetaCriterion;

// 各Threshold
export type CommentThreshold = z.infer<typeof commentThresholdSchema>;
export type TimerThreshold = z.infer<typeof timerThresholdSchema>;
export type MetaThreshold = z.infer<typeof metaThresholdSchema>;

// 各criteria
export type CommentCriterion = z.infer<typeof commentThresholdSchema>['criteria'][number];
export type TimerCriterion = z.infer<typeof timerThresholdSchema>['criteria'][number];
export type MetaCriterion = z.infer<typeof metaThresholdSchema>['criteria'][number];
