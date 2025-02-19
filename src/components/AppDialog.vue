<!-- src/components/AppDialog.vue -->
<template>
 <v-dialog
  v-for="(entry, type) in listEntry"
  :key="generateUniqueKey(type, entry.id)"
  :model-value="entry.isOpen"
  @update:model-value="(value) => updateDialog(type, value)"
  @click:outside="() => updateDialog(type, false)"
  max-width="800px"
 >
  <v-card>
   <v-fab-transition>
    <component v-if="entry.id" :is="getEditComponent(type)" :entry="Omiken[type][entry.id]" />
   </v-fab-transition>
   <v-card-actions>
    <v-tooltip
     v-if="getSortedSiblings(type).length > 1"
     :text="getSiblingName(type, entry.id as string, 'prev')"
     location="top"
    >
     <template v-slot:activator="{ props }">
      <v-btn color="grey" v-bind="props" @click="navigateToItem(type, entry.id as string, 'prev')">
       <v-icon start>mdi-chevron-left</v-icon>
       前へ
      </v-btn>
     </template>
    </v-tooltip>
    <v-spacer></v-spacer>
    <v-btn color="blue darken-1" @click="() => updateDialog(type, false)">閉じる</v-btn>
    <v-spacer></v-spacer>
    <v-tooltip
     v-if="getSortedSiblings(type).length > 1"
     :text="getSiblingName(type, entry.id as string, 'next')"
     location="top"
    >
     <template v-slot:activator="{ props }">
      <v-btn color="grey" v-bind="props" @click="navigateToItem(type, entry.id as string, 'next')">
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
import { computed } from 'vue';
import { EventCategory, OmikenType } from '@type';
import DialogOmikuji from '@components/DialogOmikuji/DialogOmikuji.vue';
import DialogPlace from '@components/DialogPlace/DialogPlace.vue';
import { UseUIStore } from '@/store/UseUIStore';

// Props / emit
const props = defineProps<{
 Omiken: OmikenType;
}>();

// pinia:UseUIStore
const UIStore = UseUIStore();

// ダイアログ開閉状態
const listEntry = computed(() => UIStore.listEntry ?? {});

// エディターコンポーネントを取得する関数
const editorComponents: Record<EventCategory, any> = {
 omikujis: DialogOmikuji,
 places: DialogPlace
};
const getEditComponent = (type: EventCategory) => editorComponents[type] || null;

// 同じ種類のアイテムリストを取得
const getSortedSiblings = (category: EventCategory) =>
 Object.keys(props.Omiken[category]).sort((a, b) =>
  props.Omiken[category][a].name.localeCompare(props.Omiken[category][b].name)
 );

// ???
const hasSiblings = (category: EventCategory) => getSortedSiblings(category).length > 1;

// 前または次のアイテムのキーを取得（循環）
const getSiblingKey = (category: EventCategory, currentKey: string, direction: 'prev' | 'next') => {
 const items = getSortedSiblings(category);
 if (items.length <= 1) return null;

 const currentIndex = items.indexOf(currentKey);
 return direction === 'prev'
  ? currentIndex > 0
    ? items[currentIndex - 1]
    : items[items.length - 1]
  : currentIndex < items.length - 1
    ? items[currentIndex + 1]
    : items[0];
};

// アイテムの名前を取得
const getSiblingName = (category: EventCategory, currentKey: string, direction: 'prev' | 'next') =>
 props.Omiken[category][getSiblingKey(category, currentKey, direction) || '']?.name || '';

// アイテム間移動
const navigateToItem = (category: EventCategory, currentKey: string, direction: 'prev' | 'next') => {
 const nextKey = getSiblingKey(category, currentKey, direction);
 if (nextKey) {
  updateDialog(category, false);
  updateDialog(category, true, nextKey);
 }
};

// ユニークなキーを生成
const generateUniqueKey = (category: EventCategory, id: string | null) => `${category}-${id ?? 'default'}`;

// ダイアログの状態更新
const updateDialog = (type: EventCategory, isOpen: boolean, id: string | null = null) => {
 UIStore.updateDialog({ type, id, isOpen });
};
</script>
