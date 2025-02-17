// src/composables/FunkEmits.ts

import { ListCategory, ListEntry, OmikenTypeMap, OmikenEntry, PresetOmikenType, CategoryActive } from '@type';
import { useOmikenStore } from './FunkOmiken';

export function FunkEmits() {
 // piniaの宣言
 const omikenStore = useOmikenStore();

 // Omiken のアップデート(アイテム)
 const updateOmikenEntry = <T extends keyof OmikenTypeMap>(
  type: T,
  update: Record<string, OmikenTypeMap[T]> | OmikenTypeMap[T] | OmikenTypeMap[T][]
 ) => {
  let newUpdate: OmikenTypeMap[T][] = [];

  if (Array.isArray(update)) {
   // `update` が配列の場合、そのまま使用
   newUpdate = update;
  } else if (typeof update === 'object' && 'id' in update) {
   // `update` が単一オブジェクトの場合、配列に変換
   newUpdate = [update as OmikenTypeMap[T]];
  } else {
   // `update` がマップ形式の場合、値の配列に変換
   newUpdate = Object.values(update as Record<string, OmikenTypeMap[T]>);
  }
  omikenStore.updateOmiken({ type, updates: newUpdate });
 };

 // ---
 // ここから過去

 // Preset更新
 const updateOmikenPreset = (preset: PresetOmikenType) => emit('update:OmikenPreset', preset);

 // リスト開閉関数
 const openList = (category: CategoryActive) => emit('update:category', category);

 // ダイアログを表示するemit
 const openEditorItem = (type: ListCategory, id: string) => {
  emit('open-editor', {
   isOpen: true,
   type,
   mode: null,
   key: id
  });
 };
 const openEditor = (editorItem: ListEntry<ListCategory>) => emit('open-editor', editorItem);

 // Omiken のアップデート(バケツリレー用)
 const updateOmiken = (payload: OmikenEntry<ListCategory>) => emit('update:Omiken', payload);

 return {
  // ナビゲーション操作
  openList,

  // ダイアログを開く
  openEditorItem,
  openEditor,

  // Omiken のアップデート
  updateOmiken,
  updateOmikenEntry,
  updateOmikenPreset
 };
}
