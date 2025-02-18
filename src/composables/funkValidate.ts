// src/composables/funkValidate.ts
import {
 OmikenType,
 OmikujiType,
 PlaceType,
 OmikenCategory,
 CommentRulesType,
 TimerRulesType,
 MetaRulesType,
 OmikenTypeMap
} from '@type';
import {
 CommentRulesSchema,
 MetaRulesSchema,
 OmikenSchema,
 omikujiSchema,
 placeSchema,
 TimerRulesSchema
} from '@/types/OmikenSchemas';
import { z } from 'zod';

// ---

// データadd用バリデーション
const schemas: Record<OmikenCategory, z.ZodType> = {
 comments: CommentRulesSchema,
 timers: TimerRulesSchema,
 metas: MetaRulesSchema,
 omikujis: omikujiSchema,
 places: placeSchema
};
export const OmikenEntryValidate = <T extends OmikenCategory>(type: T, data: unknown): OmikenTypeMap<T> => {
 try {
  return schemas[type].parse(data);
 } catch (e) {
  console.error(`Validation error for ${type}:`, e instanceof Error ? e.message : e);
  return schemas[type].parse({});
 }
};

// メインのバリデーション関数
export function OmikenValidate(data: Partial<OmikenType>): OmikenType {
 try {
  // バリデーション
  const places = OmikenPlacesValidate(data.places);
  const omikujis = OmikenOmikujisValidate(data.omikujis, places);
  const comments = OmikenRulesValidate(data.comments, omikujis) as Record<string, CommentRulesType>;
  const timers = OmikenRulesValidate(data.timers, omikujis) as Record<string, TimerRulesType>;
  const metas = OmikenRulesValidate(data.metas, omikujis) as Record<string, MetaRulesType>;

  return { comments, timers, metas, omikujis, places };
 } catch (error) {
  console.error('Omiken validation failed:', error);
  return OmikenSchema.parse({}) as OmikenType;
 }
}

// プレースホルダーのバリデーション
export const OmikenPlacesValidate = (placesRaw: Partial<Record<string, PlaceType>> = {}): Record<string, PlaceType> => {
 try {
  return Object.entries(placesRaw).reduce(
   (acc, [key, item]) => {
    if (!item) return acc;
    const validKey = OmikenIdValidate(key, item.id);
    acc[validKey] = placeSchema.parse(item);
    return acc;
   },
   {} as Record<string, PlaceType>
  );
 } catch (error) {
  throw wrapError('Places validation error:', error);
 }
};

// おみくじのバリデーション
export const OmikenOmikujisValidate = (
 omikujisRaw: Partial<Record<string, OmikujiType>> = {},
 places: Record<string, PlaceType>
): Record<string, OmikujiType> => {
 try {
  return Object.entries(omikujisRaw).reduce(
   (acc, [key, item]) => {
    if (!item) return acc;
    const validKey = OmikenIdValidate(key, item.id);

    // placeIdsのフィルタリングと重複除去
    item.placeIds = [...new Set(item.placeIds.filter((id) => places[id]))];

    acc[validKey] = omikujiSchema.parse(item);
    return acc;
   },
   {} as Record<string, OmikujiType>
  );
 } catch (error) {
  throw wrapError('Omikujis validation error:', error);
 }
};

// ルールのバリデーション
export const OmikenRulesValidate = (
 rulesRaw: Partial<Record<string, OmikenRulesType>> = {},
 omikujis: Record<string, OmikujiType>
): Record<string, OmikenRulesType> => {
 try {
  // 1. item が undefined でないエントリのみをフィルタリング
  const validEntries = Object.entries(rulesRaw).filter(
   (entry): entry is [string, OmikenRulesType] => entry[1] !== undefined
  );

  // 2. order でソートし、order が未定義の場合はインデックスを基にデフォルト値を設定
  const sortedRules = validEntries
   .map(([key, item]) => ({ key, item }))
   .sort((a, b) => {
    const aOrder = a.item.order ?? Infinity; // order が未定義の場合は無限大として扱う
    const bOrder = b.item.order ?? Infinity;
    return aOrder - bOrder;
   })
   .map((entry, index) => ({
    ...entry,
    item: {
     ...entry.item,
     order: entry.item.order ?? index + 1 // order が未定義の場合はインデックス + 1 を設定
    }
   }));

  // 3. バリデーションとフィルタリング
  const validatedRules = sortedRules.reduce(
   (acc, { key, item }) => {
    // ID のバリデーション
    const validKey = OmikenIdValidate(key, item.id);

    // omikujis に存在する enable のみを残す
    const filteredEnables = item.enables.filter((enable) => omikujis[enable.omikujiId]);

    // ruleType に基づいて適切なスキーマでバリデーション
    const schemaMap = {
     comment: CommentRulesSchema,
     timer: TimerRulesSchema,
     meta: MetaRulesSchema
    };
    const schema = schemaMap[item.ruleType];
    if (!schema) {
     throw new Error(`Unknown rule type: ${item.ruleType}`);
    }

    // バリデーションを実行
    const validatedItem = schema.parse({
     ...item,
     enables: filteredEnables
    });

    // 結果を格納
    acc[validKey] = validatedItem;
    return acc;
   },
   {} as Record<string, OmikenRulesType>
  );

  return validatedRules;
 } catch (error) {
  throw wrapError('Rules validation error:', error);
 }
};

// ヘルパー関数
const OmikenIdValidate = (key: string, id: string): string =>
 key !== id ? (console.warn(`Warning: Key "${key}" does not match id "${id}".`), id) : key;

const wrapError = (message: string, error: unknown): Error =>
 error instanceof Error ? error : new Error(`${message} ${error}`);
