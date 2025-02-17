// src/types/editor.ts
import { CommentRulesType, MetaRulesType, OmikenType, OmikujiType, PlaceType, TimerRulesType } from './Omiken';
import { CharaType, PresetOmikenType, ScriptsType } from './preset';

// エディター用型定義

// AppEditor
export interface AppEditorType {
 Omiken: OmikenType;
 Presets: Record<string, PresetOmikenType>; // preset:Omiken
 Charas: Record<string, CharaType>; // preset:Chara
 Scripts: Record<string, ScriptsType>; // preset:Script
}

// コンテンツの型マッピング
export type OmikenTypeMap = {
 comments: CommentRulesType;
 timers: TimerRulesType;
 metas: MetaRulesType;
 omikujis: OmikujiType;
 places: PlaceType;
};

// メインカテゴリーの型
export type CategoryMain = ListCategory | 'presets';
export type CategorySub = {
 comments: never;
 timers: never;
 metas: never;
 omikujis: never;
 places: never;
 presets: 'Omiken' | 'Chara' | 'Script';
};
export type CategoryActive<T extends CategoryMain = CategoryMain> = {
 main: T; // 現在選択されているメインカテゴリー
 sub?: CategorySub[T]; // メインカテゴリーに対応するサブカテゴリー（オプショナル）
};

// リスト用カテゴリー
export type RulesCategory = 'comments' | 'timers' | 'metas';
export type ListCategory = RulesCategory | 'omikujis' | 'places';
export type ListType = OmikenTypeMap[ListCategory];
export type ListEntry<T extends ListCategory> = {
 isOpen: boolean; // ダイアログの開閉状態
 type: T;
 mode: string | null; // 表示モード
 key: string | string[] | null;
};
// listEntry全体の型
export type ListEntryCollect = {
 [K in ListCategory]: ListEntry<K>;
};

// ファイル操作用
export type OmikenEntry<T extends ListCategory> = {
 type: T;
 updates?: OmikenTypeMap[T][];
 addKeys?: Partial<OmikenTypeMap[T]>[];
 delKeys?: string[];
};
