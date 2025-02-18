// src/types/editor.ts
import { OmikenCategory, OmikenType, OmikenTypeMap } from './OmikenZod';
import { PresetTypeMap } from './preset';

// エディター用型定義

// AppEditor
export type AppEditorType = PresetTypeMap & {
 Omiken: OmikenType;
};

// メインカテゴリーの型
export type CategoryMain = 'rules' | 'omikujis' | 'places' | 'presets';
export type CategorySub = {
 rules: 'comments' | 'timers' | 'metas';
 omikujis: never;
 places: never;
 presets: 'Omiken' | 'Chara' | 'Script';
};
export type CategoryActive<T extends CategoryMain = CategoryMain> = {
 main: T; // 現在選択されているメインカテゴリー
 sub: CategorySub[T]; // メインカテゴリーに対応するサブカテゴリー（オプショナル）
};

// リスト用カテゴリー
export type ListType = OmikenType[OmikenCategory];
export type ListEntry<T extends OmikenCategory> = {
 type: T;
 isOpen: boolean; // ダイアログの開閉状態
 mode: string | null; // 表示モード
 key: string | string[] | null;
};
// listEntry全体の型
export type ListEntryCollect = {
 [K in OmikenCategory]: ListEntry<K>;
};

// ファイル操作用
export type OmikenEntry<T extends OmikenCategory> = {
 type: T;
 updates?: OmikenTypeMap<T>[];
 addKeys?: Partial<OmikenTypeMap<T>>[];
 delKeys?: string[];
};
