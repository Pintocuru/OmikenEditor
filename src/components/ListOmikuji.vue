<!-- src/components/ListOmikuji.vue -->
<template>
 <!-- Omikuji List View -->
 <v-row dense>
  <v-col v-for="omikuji in omikujisNameSort" :key="omikuji.id" cols="12" sm="6" md="4" lg="3">
   <v-card variant="tonal" hover>
    <!-- タイトルバーと操作ボタン -->
    <v-toolbar density="compact" :color="getPostTypeColor(omikuji.post, true)">
     <v-toolbar-title @click="openEditorItem('omikujis', omikuji.id)">
      {{ omikuji.name }}
     </v-toolbar-title>
     <template #append>
      <!-- 右端のボタン -->
      <PartsArrayAction editMode="omikujiAdd" :entry="omikuji" />
     </template>
    </v-toolbar>
    <!-- おみくじ内容 -->
    <v-card-text class="py-4">
     <div class="pb-3" v-if="omikuji.post">
      {{ getOnecommeContent(omikuji.post) }}
     </div>
     <div class="list-group d-flex flex-wrap"></div>
    </v-card-text>
   </v-card>
  </v-col>
 </v-row>

 <v-sheet>
  <v-btn block @click="addItem()" color="primary" variant="flat" class="mt-6">
   <v-icon left>mdi-plus</v-icon> 🥠 おみくじの追加
  </v-btn>
 </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CategoryActive, OmikujiType } from '@type';
import PartsArrayAction from '@common/PartsArrayAction.vue';
import { FunkOmikuji } from '@composables/FunkOmikuji';

import { useOmikenStore } from '@composables/FunkOmiken';

const props = defineProps<{
 items: Record<string, OmikujiType>;
 categoryActive: CategoryActive;
}>();

// piniaの宣言
const omikenStore = useOmikenStore();
// コンポーザブル:FunkEmits
const { updateOmiken, openEditorItem } = FunkEmits();
// コンポーザブル:FunkOmikuji
const { getOnecommeContent, getPostTypeColor } = FunkOmikuji();

// omikujisをソート
const omikujisNameSort = computed(() => {
 return Object.values(props.items).sort((a, b) => {
  return (a.name || '').localeCompare(b.name || '');
 });
});

// アイテムを追加
const addItem = () => {
 omikenStore.updateOmiken({ type: 'omikujis', addKeys: [{ name: '新しいおみくじ' }] });
};
</script>
