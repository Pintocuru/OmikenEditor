// src/store/UseUIStore.ts
import { ref } from 'vue';
import { NaviCategoryType, CategoryMain, EventCategory, ListEntryType } from '@type';
import { MySwal } from '@common/partsMySwal';
import { defineStore } from 'pinia';

export const UseUIStore = defineStore('UIStore', () => {
 // ナビゲーションドロワーの表示/非表示
 const uiDrawer = ref(null);

 // ナビゲーション用:選択したカテゴリ
 const naviCategory = ref<NaviCategoryType>({ main: 'rules', sub: 'comments' });

 // ダイアログで表示させるアイテム
 const listEntry = ref<{ [K in EventCategory]: ListEntryType<K> }>({
  omikujis: { type: 'omikujis', isOpen: false, id: null },
  places: { type: 'places', isOpen: false, id: null }
 });

 // リストを更新する
 const updateNavi = <T extends CategoryMain>({ main, sub }: NaviCategoryType<T>) => {
  naviCategory.value = { main, sub };
 };

 // ダイアログを開く
 const updateDialog = <T extends EventCategory>({ type, id = null, isOpen = true }: ListEntryType<T>) => {
  listEntry.value[type] = { ...listEntry.value[type], id, isOpen };
 };

 return {
  uiDrawer,
  naviCategory,
  listEntry,
  updateNavi,
  updateDialog
 };
});

// Sweetalert2を使用したトースト的な通知
// TODO:使用するかはわからないが、使うなら UseUIStore に入れること。
export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
 MySwal.fire({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  icon: type,
  title: message
 });
}
