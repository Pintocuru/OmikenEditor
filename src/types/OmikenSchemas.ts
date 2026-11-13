// src/types/OmikenSchemas.ts
import { z } from 'zod';

// syoken:初見・コメント履歴の種別
export enum SyokenCondition {
 SYOKEN = 1, // 初見
 AGAIN = 2, // 前回のコメントから7日以上経過
 HI = 3, // 上記以外の、その配信枠で1回目のコメント
 ALL = 4 // 上記すべての、その配信枠で1回目のコメント
}

// access:ユーザーの役職
export enum AccessCondition {
 // 0:OFF/1:だれでも は省略
 MEMBER = 2, // メンバー
 MODERATOR = 3, // モデレーター
 ADMIN = 4 // 管理者
}

// gift:ギフトのRank
export enum GiftCondition {
 All = 0, // 全て(メンバー加入含む)
 Blue = 1, // 200円未満
 LightBlue = 2, // 200円〜499円
 Green = 3, // 500円〜999円
 Yellow = 4, // 1,000円〜1,999円
 Orange = 5, // 2,000円〜4,999円
 Pink = 6, // 5,000円〜9,999円
 Red = 7, // 10,000円以上
 Purple = 8 // 20,000円以上
}

// 数値変換
const thresholdValueTransform = z.number().transform((val) => {
 return typeof val !== 'number' || val < 0 ? 0 : val;
});

// count:数値を参照する
export const thresholdCountSchema = z.object({
 comparison: z.enum([
  'min', // 数値以下(未満、～より上はありません)
  'max', // 数値以上
  'range', // value1以上 value2以下
  'equal', // 等しい
  'loop' // 数値をvalue1で割った数
 ]),
 unit: z.enum([
  'draws', // 個人:配信内のおみくじ回数
  'totalDraws', // 個人:過去すべてのおみくじ回数
  'gameDraws', // 総数:配信内のおみくじ回数
  'gameTotalDraws', // 総数:過去すべてのおみくじ回数
  'lc', // 配信枠のコメント数
  'tc', // 個人の総コメント数
  'interval' // 前回のコメントからの経過時間(秒)
 ]),
 value1: thresholdValueTransform,
 value2: thresholdValueTransform.optional()
});

// value1 と value2 のチェック関数
const thresholdCountRangeSwap = (schema: typeof thresholdCountSchema) =>
 schema.transform((data): z.infer<typeof thresholdCountSchema> => {
  const result = { ...data };
  if (result.comparison === 'range') {
   // rangeの場合はvalue2が必須
   if (result.value2 === undefined) result.value2 = 1;
   if (result.value1 > result.value2) {
    [result.value1, result.value2] = [result.value2, result.value1];
   }
  } else delete result.value2; // range以外ならvalue2を削除
  return result;
 });

// match:文字列を参照する
export const thresholdMatchSchema = z.object({
 target: z.enum([
  'status', // ユーザーごとのstatus
  'comment', // コメント(comment.data.comment)
  'name', // 名前(comment.data.name)
  'displayName' // ニックネーム(comment.data.displayName)
 ]),
 case: z.enum([
  'exact', // 完全一致
  'starts', // 前方一致
  'include' // 部分一致
 ]),
 value: z.array(z.string()).default([])
});

// thresholdスキーマ
const thresholdDefault = {
 conditionType: 'match' as const,
 isNot: false,
 isAnd: true,
 target: 2,
 coolDown: 3,
 syoken: SyokenCondition.SYOKEN,
 access: AccessCondition.MEMBER,
 gift: GiftCondition.All,
 count: {
  comparison: 'max' as const,
  unit: 'draws' as const,
  value1: 0 as const,
  value2: 1 as const
 },
 match: {
  target: 'comment' as const,
  case: 'starts' as const,
  value: ['おみくじ']
 }
};

export const thresholdSchema = z
 .object({
  conditionType: z.enum(['target', 'coolDown', 'syoken', 'access', 'gift', 'count', 'match']).default('match'),
  isNot: z.boolean().optional().default(thresholdDefault.isNot), // 条件を反転させる
  isAnd: z.boolean().optional().default(thresholdDefault.isAnd), // 次の条件との関係 (true:AND/false:OR)
  target: z.number().optional().default(thresholdDefault.target), // 連続投稿が数値以上なら適用
  coolDown: z.number().optional().default(thresholdDefault.coolDown), // おみくじ機能が機能してから指定した時間(秒)が経過していない場合に適用
  syoken: z.nativeEnum(SyokenCondition).optional().default(thresholdDefault.syoken), // 初見・久しぶり
  access: z.nativeEnum(AccessCondition).optional().default(thresholdDefault.access), // ユーザーの役職
  gift: z.nativeEnum(GiftCondition).optional().default(thresholdDefault.gift), // ギフトの有無と金額判定
  count: thresholdCountRangeSwap(thresholdCountSchema).optional().default(thresholdDefault.count), // 数値を参照する
  match: thresholdMatchSchema.optional().default(thresholdDefault.match) // 文字列を参照する
 })
 .catch((error) => {
  console.warn('Invalid threshold:', error);
  // デフォルトの値を返す
  return {
   conditionType: 'match',
   isNot: thresholdDefault.isNot,
   isAnd: thresholdDefault.isAnd,
   target: thresholdDefault.target,
   coolDown: thresholdDefault.coolDown,
   syoken: thresholdDefault.syoken,
   access: thresholdDefault.access,
   gift: thresholdDefault.gift,
   count: thresholdDefault.count,
   match: thresholdDefault.match
  };
 });

// ユニークキーの生成
export const generateUniqueKey = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// BaseType:基本となる項目
export const baseSchema = z.object({
 id: z
  .string()
  .default('')
  .catch('')
  .transform((val) => (val === '' ? generateUniqueKey() : val)), // キー名
 name: z.string().default('').catch(''), // ルール名
 description: z.string().default('').catch('') // 説明文
});

//---

// rules:おみくじルールの型定義
const ruleDefault = {
 color: '#66FFFF',
 threshold: {
  conditionType: 'match' as const,
  match: { target: 'comment' as const, case: 'starts' as const, value: ['おみくじ'] }
 }
};

export const ruleSchema = z.object({
 ...baseSchema.shape,
 color: z.string().default(ruleDefault.color).catch(ruleDefault.color), // エディターでの識別用カラー
 enableIds: z.array(z.string()).default([]).catch([]), // おみくじリスト
 //発動条件
 threshold: z
  .array(thresholdSchema)
  .default([ruleDefault.threshold])
  .catch((error) => {
   console.warn('Invalid rule.threshold:', error);
   return [];
  }),
 // タイマー用設定リスト
 timerConfig: z
  .object({
   minutes: z.number().int().nonnegative(), // 分単位
   isBaseZero: z.boolean() // ベースがゼロかどうか
  })
  .optional()
  .catch(undefined)
});

//---

// わんコメに渡す投稿情報
const postDefault = {
 botKey: 'mamono',
 iconKey: 'Default',
 content: '新しいメッセージ'
};

export const OneCommePostSchema = z.object({
 type: z
  .enum([
   'onecomme', // わんコメへの投稿
   'party', // WordPartyの投稿
   'speech', // わんコメのスピーチ機能
   'error' // わんコメへの投稿(プラグイン用)
  ])
  .default('onecomme')
  .catch('onecomme'),
 botKey: z.string().default(postDefault.botKey).catch(postDefault.botKey), // ボットキー
 iconKey: z.string().default(postDefault.iconKey).catch(postDefault.iconKey), // アイコンキー
 delaySeconds: z.number().default(0).catch(0), // メッセージを送信するまでの遅延時間
 party: z.string().optional().catch(undefined), // 発動するWordParty
 isSilent: z.boolean().optional().catch(undefined), // BOTのメッセージを読み上げない
 generatorParam: z.string().optional().catch(undefined), // ジェネレーターに渡す引数
 content: z.string().default(postDefault.content).catch(postDefault.content) // メッセージ内容
});

// バリデーション時にソート
const omikujiPostArraySchema = OneCommePostSchema.array()
 .transform((posts) =>
  posts.sort((a, b) => {
   // delaySecondsで昇順ソート
   if (a.delaySeconds !== b.delaySeconds) {
    return a.delaySeconds - b.delaySeconds;
   }
   // delaySecondsが同じ場合はtypeの順序でソート
   const typeOrder = ['onecomme', 'party', 'speech', 'error'];
   return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
  })
 )
 .default([]);

// omikuji:おみくじの型定義
export const omikujiSchema = z.object({
 ...baseSchema.shape,
 rank: z.number().int().nonnegative().default(0).catch(0), // 優先度
 weight: z.number().int().nonnegative().default(1).catch(1),
 // 発動条件
 threshold: z
  .array(thresholdSchema)
  .default([])
  .catch((error) => {
   console.warn('Invalid omikuji.threshold:', error);
   return [];
  }),
 status: z.string().optional().catch(undefined), // ユーザーの任意ステータス
 point: z.string().optional().catch(undefined), // ユーザーの任意ポイント
 script: z
  .object({
   scriptId: z.string(), // 使用する外部スクリプトのid
   params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])) // 外部スクリプトに渡す引数(Scriptから取得)
  })
  .optional()
  .catch((error) => {
   console.warn('Invalid omikuji.script:', error);
   return undefined;
  }),
 placeIds: z.array(z.string()).default([]).catch([]), // 使用するプレースホルダーのid
 // わんコメに渡す投稿情報
 post: omikujiPostArraySchema.catch((error) => {
  console.warn('Invalid omikuji.post:', error);
  return [];
 })
});
//---

// placeのZodスキーマ
export const placeSchema = z.object({
 ...baseSchema.shape,
 placeIds: z.array(z.string()).default([]).catch([]), // 使用するプレースホルダーのid
 values: z
  .array(
   z.object({
    weight: z.number().int().nonnegative().default(1).catch(1), // 出現割合
    value: z.string().default('').catch('') // 値（他のプレースホルダーへの参照可能: <<place_name>>）
   })
  )
  .default([{ weight: 1, value: '' }])
  .catch((error) => {
   console.warn('Invalid place.values:', error);
   return [{ weight: 1, value: '' }];
  })
});
//---

// typesのZodスキーマ
export const TypesTypeSchema = z.enum([
 'comment', // コメントでの起動
 'timer', // タイマー(定期的な起動)
 'meta', // 枠情報からの起動
 'waitingList', // 参加リストからの起動
 'setList', // セットリストでの起動
 'reactions', // WordPartyでの起動
 'unused' // 無効
]);

// typesフィールドのZodスキーマ
export const typesSchema = z.record(TypesTypeSchema, z.array(z.string())).default({
 comment: [],
 timer: [],
 meta: [],
 waitingList: [],
 setList: [],
 reactions: [],
 unused: []
});

//---

// Omikenのスキーマ
export const OmikenSchema = z.object({
 types: typesSchema,
 rules: z.record(ruleSchema).default({}),
 omikujis: z.record(omikujiSchema).default({}),
 places: z.record(placeSchema).default({})
});
