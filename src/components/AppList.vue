<!-- src/components/AppList.vue -->
<template>
 <!-- 各種リストコンポーネントの条件付きレンダリング -->
 <v-scroll-x-transition mode="out-in">
  <div v-if="currentListComponent" :key="getComponentKey">
   <component
    :is="currentListComponent.component"
    :items="currentListComponent.items"
    :categoryActive="categoryActive"
    @update:Omiken="updateOmiken"
    @update:OmikenPreset="updateOmikenPreset"
    @update:category="openList"
    @open-editor="openEditor"
   />
  </div>
 </v-scroll-x-transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ListRules from '@/components/ListRules/ListRules.vue';
import ListOmikuji from '@/components/ListOmikuji.vue';
import ListPlace from '@/components/ListPlace.vue';
import ListPreset from '@/components/ListPreset/ListPreset.vue';
import { ListCategory, OmikenEntry, ListEntry, CategoryActive, AppEditorType, PresetOmikenType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';

// Props Emits
const props = defineProps<{
 AppEditor: AppEditorType;
 categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'update:OmikenPreset', preset: PresetOmikenType): void;
 (e: 'update:category', value: CategoryActive): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { openList, updateOmiken, openEditor, updateOmikenPreset } = FunkEmits(emit);

// 子コンポーネントの指定
const currentListComponent = computed(() => {
 const componentMap: Record<string, { component: any; items: any }> = {
  comments: { component: ListRules, items: props.AppEditor.Omiken.comments },
  timers: { component: ListRules, items: props.AppEditor.Omiken.timers },
  metas: { component: ListRules, items: props.AppEditor.Omiken.metas },
  omikujis: { component: ListOmikuji, items: props.AppEditor.Omiken.omikujis },
  places: { component: ListPlace, items: props.AppEditor.Omiken.places },
  presets: { component: ListPreset, items: props.AppEditor }
 };

 return componentMap[props.categoryActive.main] || null;
});

// コンポーネントのkeyを生成するcomputed
const getComponentKey = computed(() => {
 const sub = props.categoryActive.sub || 'default';
 return `${props.categoryActive.main}-${sub}-component`;
});
</script>
