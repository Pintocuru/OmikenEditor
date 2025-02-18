<!-- src/components/AppList.vue -->
<template>
 <!-- 各種リストコンポーネントの条件付きレンダリング -->
 <v-scroll-x-transition mode="out-in">
  <div v-if="currentListComponent" :key="getComponentKey">
   <component
    :is="currentListComponent.component"
    :items="currentListComponent.items"
    :categoryActive="categoryActive"
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
import { CategoryActive, AppEditorType, CategoryMain, CategorySub } from '@type';

// Props
const props = defineProps<{
 AppEditor: AppEditorType;
 categoryActive: CategoryActive;
}>();

const currentListComponent = computed(() => {
 return componentMap[props.categoryActive.main] || null;
});

const getItemsBySub = (data: AppEditorType, sub?: CategorySub[keyof CategorySub]) => {
 return sub ? (subCategoryMap.get(sub)?.(data) ?? data) : data;
};

// 子コンポーネントの指定
const componentMap: Record<CategoryMain, { component: any; items: any }> = {
 rules: { component: ListRules, items: getItemsBySub(props.AppEditor, props.categoryActive.sub) },
 omikujis: { component: ListOmikuji, items: props.AppEditor.Omiken.omikujis },
 places: { component: ListPlace, items: props.AppEditor.Omiken.places },
 presets: { component: ListPreset, items: getItemsBySub(props.AppEditor, props.categoryActive.sub) }
};

// サブカテゴリーに基づいてitemsを取得する関数
const subCategoryMap = new Map<CategorySub[CategoryMain], any>([
 ['comments', (data: AppEditorType) => data.Omiken.comments],
 ['timers', (data: AppEditorType) => data.Omiken.timers],
 ['metas', (data: AppEditorType) => data.Omiken.metas],
 ['Presets', (data: AppEditorType) => data.Presets],
 ['Charas', (data: AppEditorType) => data.Charas],
 ['Scripts', (data: AppEditorType) => data.Scripts]
]);

// コンポーネントのkeyを生成するcomputed
const getComponentKey = computed(() => {
 const { main, sub = 'default' } = props.categoryActive;
 return `${main}-${sub}`;
});
</script>
