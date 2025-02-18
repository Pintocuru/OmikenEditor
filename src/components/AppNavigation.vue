<!-- src/components/AppNavigation.vue -->
<template>
 <v-navigation-drawer permanent rail rail-width="100" expand-on-hover>
  <v-list>
   <v-list-subheader class="mt-2 text-uppercase font-weight-bold"> おみくじデータ </v-list-subheader>
   <!-- メインセクション（ルール、おみくじ、プレースホルダー） -->
   <v-list-item v-for="section in mainSections" :key="section.title">
    <v-card @click="openList(section.category)" class="py-2">
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
   <v-list-subheader class="mt-4 text-uppercase font-weight-bold"> プリセット </v-list-subheader>

   <v-list-item v-for="section in presetSections" :key="section.title">
    <v-card @click="openList(section.category)" class="py-2">
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
import { AppEditorType, CategoryActive } from '@type';
import { FunkEmits } from '@composables/FunkEmits';

const props = defineProps<{
 AppEditor: AppEditorType;
 naviCategory: CategoryActive;
}>();

const emit = defineEmits<{
 (e: 'update:category', value: CategoryActive): void;
}>();

const { openList } = FunkEmits(emit);

// メインセクションの定義

interface NavigationItem {
 title: string;
 icon: string;
 itemCount: number;
 category: CategoryActive;
}

const mainSections = computed<NavigationItem[]>(() => [
 {
  title: 'ルール',
  icon: 'mdi-book-open-variant',
  itemCount: Object.keys(props.AppEditor.Omiken.rules || {}).length,
  category: { main: 'rules' }
 },
 {
  title: 'おみくじ',
  icon: 'mdi-crystal-ball',
  itemCount: Object.keys(props.AppEditor.Omiken.omikujis || {}).length,
  category: { main: 'omikujis' }
 },
 {
  title: 'プレースホルダー',
  icon: 'mdi-tag',
  itemCount: Object.keys(props.AppEditor.Omiken.places || {}).length,
  category: { main: 'places' }
 }
]);

// プリセットセクションの定義
const presetSections = computed<NavigationItem[]>(() => [
 {
  title: 'おみくじデータ',
  icon: 'mdi-database', // データベースアイコン
  itemCount: Object.keys(props.AppEditor.Presets || {}).length,
  category: { main: 'presets', sub: 'Presets' }
 },
 {
  title: 'キャラクター',
  icon: 'mdi-account-group', // キャラクターグループアイコン
  itemCount: Object.keys(props.AppEditor.Charas || {}).length,
  category: { main: 'presets', sub: 'Charas' }
 },
 {
  title: 'スクリプト',
  icon: 'mdi-script-text', // スクリプトアイコン
  itemCount: Object.keys(props.AppEditor.Scripts || {}).length,
  category: { main: 'presets', sub: 'Scripts' }
 }
]);
</script>
