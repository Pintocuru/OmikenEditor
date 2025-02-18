<!-- src/components/AppDialog.vue -->
<template>
 <v-dialog
  v-for="(entry, category) in listEntry"
  :key="category"
  :model-value="entry.isOpen"
  @update:model-value="(value) => updateDialog(category, value)"
  @click:outside="() => updateDialog(category, false)"
  max-width="800px"
 >
  <v-card>
   <v-fab-transition>
    <div v-if="getEditComponent" :key="generateUniqueKey(category, entry.key)">
     <component
      :is="getEditComponent(category, entry.mode)"
      :entry="entry"
      @update:Omiken="updateOmiken"
      @open-editor="openEditor"
     />
    </div>
   </v-fab-transition>
   <v-card-actions>
    <v-tooltip
     v-if="getSiblingItems(category, entry.key as string).length > 1"
     :text="getSiblingName(category, entry.key as string, 'prev')"
     location="top"
    >
     <template v-slot:activator="{ props }">
      <v-btn color="grey" v-bind="props" @click="navigateToItem(category, entry.key as string, 'prev')">
       <v-icon start>mdi-chevron-left</v-icon>
       前へ
      </v-btn>
     </template>
    </v-tooltip>
    <v-spacer></v-spacer>
    <v-btn color="blue darken-1" @click="() => updateDialog(category, false)">閉じる</v-btn>
    <v-spacer></v-spacer>
    <v-tooltip
     v-if="getSiblingItems(category, entry.key as string).length > 1"
     :text="getSiblingName(category, entry.key as string, 'next')"
     location="top"
    >
     <template v-slot:activator="{ props }">
      <v-btn color="grey" v-bind="props" @click="navigateToItem(category, entry.key as string, 'next')">
       次へ
       <v-icon start>mdi-chevron-right</v-icon>
      </v-btn>
     </template>
    </v-tooltip>
   </v-card-actions>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
import { ListEntry, ListCategory, OmikenEntry, ListEntryCollect, OmikenType } from '@type';
import DialogOmikuji from '@/components/DialogOmikuji/DialogOmikuji.vue';
import DialogPlace from '@/components/DialogPlace/DialogPlace.vue';
import { FunkEmits } from '@/composables/FunkEmits';

// Props / emit
const props = defineProps<{
 listEntry: ListEntryCollect;
 Omiken: OmikenType;
}>();

const emit = defineEmits<{
 (e: 'update:listEntry', newEntry: ListEntryCollect): void;
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor } = FunkEmits(emit);

// エディターコンポーネントを取得する関数
const getEditComponent = (type: ListCategory, mode?: string | null) => {
 const editorMap: Record<ListCategory, any> = {
  types: null,
  rules: null,
  omikujis: DialogOmikuji,
  places: DialogPlace
 };
 return editorMap[type] || null;
};

// 同じ種類のアイテムリストを取得
const getSiblingItems = (category: ListCategory, currentKey: string) => {
 if (category === 'types') {
  return [];
 } else {
  const items = Object.keys(props.Omiken[category]).sort((a, b) =>
   props.Omiken[category][a].name.localeCompare(props.Omiken[category][b].name)
  );
  return items;
 }
};

// 前または次のアイテムのキーを取得（循環）
const getSiblingKey = (category: ListCategory, currentKey: string, direction: 'prev' | 'next') => {
 const items = getSiblingItems(category, currentKey);
 if (items.length <= 1) return null;

 const currentIndex = items.indexOf(currentKey);
 if (direction === 'prev') {
  return currentIndex > 0 ? items[currentIndex - 1] : items[items.length - 1];
 } else {
  return currentIndex < items.length - 1 ? items[currentIndex + 1] : items[0];
 }
};

// アイテムの名前を取得
const getSiblingName = (category: ListCategory, currentKey: string, direction: 'prev' | 'next') =>
 category === 'types' ? '' : props.Omiken[category][getSiblingKey(category, currentKey, direction) || '']?.name || '';

// アイテム間移動（修正版）
const navigateToItem = (category: ListCategory, currentKey: string, direction: 'prev' | 'next') => {
 const nextKey = getSiblingKey(category, currentKey, direction);
 if (nextKey) {
  updateDialog(category, false);
  openEditor({
   isOpen: true,
   type: category,
   key: nextKey,
   mode: props.listEntry[category].mode
  });
 }
};

const generateUniqueKey = (category: ListCategory, key: string | string[] | null) => {
 // `category` と `key` を基にユニークなキーを生成
 if (Array.isArray(key)) {
  return `${category}-${key.join('-')}`;
 }
 return `${category}-${key || 'default'}`;
};

// ダイアログの状態更新
const updateDialog = (key: ListCategory, isOpen: boolean) => {
 emit('update:listEntry', {
  ...props.listEntry,
  [key]: { ...props.listEntry[key], isOpen }
 });
};
</script>
