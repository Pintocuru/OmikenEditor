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

// 子コンポーネントの指定
const currentListComponent = computed(() => {
 const componentMap: Record<CategoryMain, { component: any; items: any }> = {
  rules: { component: ListRules, items: getItemsBySub(props.AppEditor, props.categoryActive.sub) },
  omikujis: { component: ListOmikuji, items: props.AppEditor.Omiken.omikujis },
  places: { component: ListPlace, items: props.AppEditor.Omiken.places },
  presets: { component: ListPreset, items: getItemsBySub(props.AppEditor, props.categoryActive.sub) }
 };

 return componentMap[props.categoryActive.main] || null;
});

// サブカテゴリーに基づいてitemsを取得する関数
const getItemsBySub = (data: AppEditorType, sub?: CategorySub[keyof CategorySub]) => {
 if (!sub) return data;

 switch (sub) {
  case 'comments':
   return data.Omiken.comments;
  case 'timers':
   return data.Omiken.timers;
  case 'metas':
   return data.Omiken.metas;
  case 'Omiken':
   return data.Presets;
  case 'Chara':
   return data.Charas;
  case 'Script':
   return data.Scripts;
  default:
   return data;
 }
};

// コンポーネントのkeyを生成するcomputed
const getComponentKey = computed(() => {
 const sub = props.categoryActive.sub || 'default';
 return `${props.categoryActive.main}-${sub}-component`;
});
</script>
