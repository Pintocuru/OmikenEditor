// src/composables/funkUI.ts
import { Ref, ref } from 'vue';
import { CategoryActive, OmikenCategory, ListEntryType, ListEntryCollect } from '@type';
import { MySwal } from '@common/partsMySwal';

export function FunkUI() {
 // UI
 const uiDrawer = ref(null); // ナビゲーションドロワーの表示/非表示

 // ナビゲーション用:選択したカテゴリ
 const naviCategory = ref<CategoryActive>({
  main: 'rules'
 });

 // ダイアログで表示させるアイテム
 const listEntry: Ref<ListEntryCollect> = ref({
  types: { isOpen: false, type: 'types', key: null, item: null, mode: null },
  rules: { isOpen: false, type: 'rules', key: null, item: null, mode: null },
  omikujis: {
   isOpen: false,
   type: 'omikujis',
   key: null,
   item: null,
   mode: null
  },
  places: {
   isOpen: false,
   type: 'places',
   key: null,
   item: null,
   mode: null
  }
 });

 // ダイアログを開く
 const openEditor = <T extends OmikenCategory>(editorItem: ListEntryType<T>) => {
  const { type, key, mode } = editorItem;

  if (listEntry.value && listEntry.value[type]) {
   const entry = listEntry.value[type] as ListEntryType<T>;
   entry.key = key;
   entry.mode = mode || null;
   entry.isOpen = true;
  }
 };

 return {
  uiDrawer,
  naviCategory,
  listEntry,
  openEditor
 };
}

export function funkList(emit: any) {
 const openEditor = (item: { id: any }, type = 'rules') => {
  const payload = { [item.id]: item };
  emit('open-editor', {
   isOpen: true,
   type: type,
   item: payload
  });
 };

 return { openEditor };
}

// Sweetalert2を使用したトースト的な通知
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
