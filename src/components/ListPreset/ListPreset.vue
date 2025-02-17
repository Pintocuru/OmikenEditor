<!-- src/components/ListPreset/ListPreset.vue -->
<template>
 <ListPresetContent
  v-if="props.categoryActive?.sub"
  :type="props.categoryActive.sub"
  :content="getContent"
  @update:Omiken="updateOmiken"
  @update:OmikenPreset="updateOmikenPreset"
  @update:category="openList"
 />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AppEditorType, CategoryActive, ListCategory, OmikenEntry, PresetType } from '@type';
import ListPresetContent from '@/components/ListPreset/ListPresetContent.vue';
import { FunkEmits } from '@/composables/FunkEmits';

// Props Emits
const props = defineProps<{
 items: AppEditorType;
 categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'update:OmikenPreset', preset: PresetType): void;
 (e: 'update:category', value: CategoryActive): void;
}>();

// コンポーザブル:FunkEmits
const { openList, updateOmiken, updateOmikenPreset } = FunkEmits(emit);

// 現在の categoryActive.sub に基づいてコンテンツを取得
const getContent = computed(() => {
 if (!props.categoryActive?.sub) return {};

 const contentMap = {
  Presets: props.items.Presets,
  Charas: props.items.Charas,
  Scripts: props.items.Scripts
 } as const;

 return contentMap[props.categoryActive.sub] || {};
});
</script>
