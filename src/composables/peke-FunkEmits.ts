// src/composables/FunkEmits.ts

import { ListEntryType, OmikenEntry, PresetOmikenType, NaviCategoryType, OmikenCategory, OmikenTypeMap } from '@type';
import { useOmikenStore } from '@store/UseOmikenStore';

export function FunkEmits() {
 // piniaの宣言
 const omikenStore = useOmikenStore();

 // Omiken のアップデート
 // TODO これでさえ不要
 const updateOmikenEntry = <T extends OmikenCategory>(type: T, update: OmikenTypeMap<T> | OmikenTypeMap<T>[]) => {
  const updates = Array.isArray(update) ? update : [update]; // 配列チェック
  omikenStore.updateOmiken({ type, updates: updates });
 };

 // ---
 // ここから過去

 // Preset更新
 const updateOmikenPreset = (preset: PresetOmikenType) => emit('update:OmikenPreset', preset);

 // リスト開閉関数
 const openList = (category: NaviCategoryType) => emit('update:category', category);

 // ダイアログを表示するemit
 const openEditorItem = (type: OmikenCategory, id: string) => {
  emit('open-editor', {
   isOpen: true,
   type,
   mode: null,
   key: id
  });
 };
 const openEditor = (editorItem: ListEntryType<OmikenCategory>) => emit('open-editor', editorItem);

 // Omiken のアップデート(バケツリレー用)
 const updateOmiken = (payload: OmikenEntry<OmikenCategory>) => emit('update:Omiken', payload);

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
