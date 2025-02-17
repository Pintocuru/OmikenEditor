// src/composables/FunkEmits.ts

import { ListCategory, ListEntry, OmikenTypeMap, OmikenEntry, PresetOmikenType, CategoryActive } from '@type';
import { useOmikenStore } from './FunkOmiken';

export function FunkEmits() {
 // piniaの宣言
 const omikenStore = useOmikenStore();

 // Omiken のアップデート(アイテム)
 const updateOmikenEntry = <T extends keyof OmikenTypeMap>(type: T, update: OmikenTypeMap[T] | OmikenTypeMap[T][]) => {
  // 配列に変換
  const updates = Array.isArray(update) ? update : [update];
  omikenStore.updateOmiken({ type, updates });
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
