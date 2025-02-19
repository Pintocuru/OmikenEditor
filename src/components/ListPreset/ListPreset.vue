<!-- src/components/ListPreset/ListPreset.vue -->
<template>
 <ListPresetContent
  v-if="props.categoryActive?.sub"
  :type="props.categoryActive.sub"
  :content="getContent"
  @update:OmikenPreset="updateOmikenPreset"
  @update:category="openList"
 />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AppEditorType, CategoryActive, OmikenEntry, PresetAnyType, PresetTypeMap } from '@type';
import ListPresetContent from '@components/ListPreset/ListPresetContent.vue';

// Props Emits
const props = defineProps<{
 items: PresetAnyType;
 categoryActive: CategoryActive;
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
