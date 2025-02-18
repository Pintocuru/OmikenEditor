<!-- src/components/DialogOmikuji/DialogOmikujiStatus.vue -->
<template>
 ユーザーに {{ currentItem.status }} の内部ステータスを設定・変更します
 <v-text-field
  v-model="currentItem.status"
  label="ステータス"
  item-title="text"
  item-value="value"
  dense="compact"
  clearable
  @update:modelValue="updateOmikenEntry('omikujis', currentItem)"
 >
 </v-text-field>
</template>

<script setup lang="ts">
import { ListCategory, ListEntry, OmikujiType, OmikenEntry, AppEditorType, ScriptType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';

const props = defineProps<{
 currentItem: OmikujiType;
 modelValue: 'places' | 'post' | 'threshold' | 'status' | 'scripts';
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmikenEntry } = FunkEmits(emit);
</script>
