<!-- src/components/AppNavigation.vue -->
<template>
 <v-navigation-drawer permanent rail rail-width="100" expand-on-hover>
  <v-list>
   <!-- 抽選セクション -->
   <v-list-subheader class="mt-2 text-uppercase font-weight-bold">抽選ルール</v-list-subheader>
   <v-list-item v-for="section in ruleSections" :key="section.title">
    <v-card @click="updateNavi(section.category)" class="py-2">
     <v-card-title class="d-flex align-center">
      <v-badge
       class="mr-4"
       :content="section.itemCount"
       color="primary"
       :model-value="section.itemCount > 0"
       location="bottom end"
      >
       <v-icon :icon="section.icon" size="large" />
      </v-badge>
      <span class="text-h6">{{ section.title }}</span>
     </v-card-title>
    </v-card>
   </v-list-item>

   <!-- おみくじセクション -->
   <v-list-subheader class="mt-4 text-uppercase font-weight-bold">おみくじデータ</v-list-subheader>
   <v-list-item v-for="section in omikujiSections" :key="section.title">
    <v-card @click="updateNavi(section.category)" class="py-2">
     <v-card-title class="d-flex align-center">
      <v-badge
       class="mr-4"
       :content="section.itemCount"
       color="primary"
       :model-value="section.itemCount > 0"
       location="bottom end"
      >
       <v-icon :icon="section.icon" size="large" />
      </v-badge>
      <span class="text-h6">{{ section.title }}</span>
     </v-card-title>
    </v-card>
   </v-list-item>

   <!-- プリセットセクション -->
   <v-list-subheader class="mt-4 text-uppercase font-weight-bold">プリセット</v-list-subheader>
   <v-list-item v-for="section in presetSections" :key="section.title">
    <v-card @click="updateNavi(section.category)" class="py-2">
     <v-card-title class="d-flex align-center">
      <v-badge
       class="mr-4"
       :content="section.itemCount"
       color="primary"
       :model-value="section.itemCount > 0"
       location="bottom end"
      >
       <v-icon :icon="section.icon" size="large" />
      </v-badge>
      <span class="text-h6">{{ section.title }}</span>
     </v-card-title>
    </v-card>
   </v-list-item>
  </v-list>
 </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AppEditorType, NaviCategoryType } from '@type';
import { UseUIStore } from '@/store/UseUIStore';

const props = defineProps<{
 AppEditor: AppEditorType;
 naviCategory: NaviCategoryType;
}>();

// pinia:UseUIStore
const { updateNavi } = UseUIStore();

// メインセクションの定義
interface NavigationItem {
 category: NaviCategoryType;
 title: string;
 icon: string;
 itemCount: number;
}

// 抽選ルールセクションの定義
const ruleSections = computed<NavigationItem[]>(() => [
 {
  category: { main: 'rules', sub: 'comments' },
  title: 'コメントルール',
  icon: 'mdi-comment-text',
  itemCount: Object.keys(props.AppEditor.Omiken.comments || {}).length
 },
 {
  category: { main: 'rules', sub: 'timers' },
  title: 'タイマールール',
  icon: 'mdi-timer',
  itemCount: Object.keys(props.AppEditor.Omiken.timers || {}).length
 },
 {
  category: { main: 'rules', sub: 'metas' },
  title: 'メタルール',
  icon: 'mdi-information',
  itemCount: Object.keys(props.AppEditor.Omiken.metas || {}).length
 }
]);

// おみくじセクションの定義
const omikujiSections = computed<NavigationItem[]>(() => [
 {
  category: { main: 'omikujis' },
  title: 'おみくじ',
  icon: 'mdi-crystal-ball',
  itemCount: Object.keys(props.AppEditor.Omiken.omikujis || {}).length
 },
 {
  category: { main: 'places' },
  title: 'プレースホルダー',
  icon: 'mdi-tag',
  itemCount: Object.keys(props.AppEditor.Omiken.places || {}).length
 }
]);

// プリセットセクションの定義
const presetSections = computed<NavigationItem[]>(() => [
 {
  category: { main: 'presets', sub: 'Presets' },
  title: 'おみくじデータ',
  icon: 'mdi-database',
  itemCount: Object.keys(props.AppEditor.Presets || {}).length
 },
 {
  category: { main: 'presets', sub: 'Charas' },
  title: 'キャラクター',
  icon: 'mdi-account-group',
  itemCount: Object.keys(props.AppEditor.Charas || {}).length
 },
 {
  category: { main: 'presets', sub: 'Scripts' },
  title: 'スクリプト',
  icon: 'mdi-script-text',
  itemCount: Object.keys(props.AppEditor.Scripts || {}).length
 }
]);
</script>
