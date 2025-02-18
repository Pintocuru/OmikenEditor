// src/types/editor.ts
import { OmikenCategory, OmikenType, OmikenTypeMap, RuleCategory } from './OmikenZod';
import { PresetCategory, PresetType } from './preset';

// エディター用型定義

// AppEditor
export type AppEditorType = PresetType & {
 Omiken: OmikenType;
};

// メインカテゴリーの型
export type CategoryMain = 'rules' | 'omikujis' | 'places' | 'presets';
export type CategorySub = {
 rules: RuleCategory;
 omikujis: never;
 places: never;
 presets: PresetCategory;
};
export type CategoryActive<T extends CategoryMain = CategoryMain> = {
 main: T; // 現在選択されているメインカテゴリー
 sub: CategorySub[T]; // メインカテゴリーに対応するサブカテゴリー（オプショナル）
};

// リスト用カテゴリー
export type ListEntryType<T extends 'omikujis' | 'places'> = {
 type: T;
 isOpen: boolean; // ダイアログの開閉状態
 id: string | null; // id
};

// listEntry全体の型(TODO:不要)
export type ListEntryCollect = {
 [K in 'omikujis' | 'places']: ListEntryType<K>;
};

// ファイル操作用
export type OmikenEntry<T extends OmikenCategory> = {
 type: T;
 updates?: OmikenTypeMap<T>[];
 addKeys?: Partial<OmikenTypeMap<T>>[];
 delKeys?: string[];
};
