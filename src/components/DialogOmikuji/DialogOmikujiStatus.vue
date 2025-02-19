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
import { OmikenCategory, ListEntryType, OmikujiType, OmikenEntry, AppEditorType, ScriptType } from '@type';

const props = defineProps<{
 currentItem: OmikujiType;
 modelValue: 'places' | 'post' | 'threshold' | 'status' | 'scripts';
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<OmikenCategory>): void;
 (e: 'open-editor', editorItem: ListEntryType<OmikenCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmikenEntry } = FunkEmits(emit);
</script>
