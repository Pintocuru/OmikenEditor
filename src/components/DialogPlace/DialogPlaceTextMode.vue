<!-- src/components/DialogPlace/DialogPlaceTextMode.vue -->
<template>
 <v-dialog v-model="dialog" persistent>
  <v-card>
   <v-card-title>テキストエディター</v-card-title>
   <v-card-text>
    <v-textarea
     v-model="editingText"
     label="値と重みをカンマ区切りで入力してください（例: apple,1）"
     hint="重みを省略した場合、デフォルトで1が設定されます。"
     persistent-hint
     rows="15"
    />
   </v-card-text>
   <v-card-actions>
    <v-spacer />
    <v-btn color="primary" @click="handleSave">保存</v-btn>
    <v-btn @click="dialog = false">キャンセル</v-btn>
   </v-card-actions>
  </v-card>
 </v-dialog>

 <!-- テキストエディター -->
 <v-btn icon color="primary" class="me-2" @click="dialog = true">
  <v-icon>mdi-text</v-icon>
  <v-tooltip activator="parent" location="bottom">テキストエディターモード</v-tooltip>
 </v-btn>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { OmikenCategory, OmikenEntry, PlaceType, PlaceValueType } from '@type';
import { FunkEmits } from '@composables/FunkEmits';

const props = defineProps<{
 currentItem: PlaceType;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<OmikenCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, updateOmikenEntry } = FunkEmits(emit);

const dialog = ref(false);
const editingText = ref('');

// 初期値の設定
watch(
 () => props.currentItem,
 (newItem) => {
  if (newItem) {
   // value,weightの形式で編集用テキストを生成
   editingText.value = newItem.values
    .map((v) => `${v.value},${v.weight}`) // valueとweightを結合
    .join('\n'); // 改行で区切り
  }
 },
 { immediate: true, deep: true }
);

const handleSave = () => {
 const values: PlaceValueType[] = editingText.value
  .split('\n') // 各行を分割
  .filter((line) => line.trim()) // 空行を除去
  .map((line) => {
   const [value, weight] = line.split(',').map((item) => item.trim());
   return {
    value,
    weight: weight ? parseInt(weight, 10) || 1 : 1 // weightがない場合はデフォルト1
   };
  });

 // Omikenエントリを更新
 updateOmikenEntry('places', {
  ...props.currentItem,
  values
 });

 // ダイアログを閉じる
 dialog.value = false;
};
</script>
