<!-- src/components/ListPlace.vue -->
<template>
 <!-- Place List View -->
 <v-row dense>
  <v-col v-for="place in placesNameSort" :key="place.id" cols="12" sm="4" md="3">
   <v-card variant="tonal">
    <!-- タイトルバーと操作ボタン -->
    <v-toolbar density="compact">
     <v-toolbar-title class="ml-4" @click="UIStore.updateDialog({ type: 'places', id: place.id })">
      {{ place?.name }}
     </v-toolbar-title>
     <template #append>
      <PartsArrayAction
       editMode="place"
       :entry="place"
       @edit="UIStore.updateDialog({ type: 'places', id: place.id })"
      />
     </template>
    </v-toolbar>

    <!-- プレースホルダー内容 -->
    <v-card-text class="py-4">
     <div class="list-group d-flex flex-wrap">
      <template v-for="(value, index) in getRandomValues(place.values, 1)" :key="index">
       <span class="mr-2">{{ value }}</span>
      </template>
     </div>
    </v-card-text>
   </v-card>
  </v-col>
 </v-row>

 <v-sheet>
  <v-btn block @click="addItem" color="primary" variant="flat" class="mt-6">
   <v-icon left>mdi-plus</v-icon> 📍 プレースホルダーの追加
  </v-btn>
 </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NaviCategoryType, PlaceType, PlaceValueType } from '@type';
import PartsArrayAction from './common/PartsArrayAction.vue';
import { useOmikenStore } from '@/store/UseOmikenStore';
import { UseUIStore } from '@/store/UseUIStore';

const props = defineProps<{
 items: Record<string, PlaceType>;
 categoryActive: NaviCategoryType;
}>();

// pinia:omikenStore
const omikenStore = useOmikenStore();
// pinia:UseUIStore
const UIStore = UseUIStore();

// placesをソートして取得
const placesNameSort = computed(() => {
 return Object.values(props.items).sort((a, b) => {
  return (a.name || '').localeCompare(b.name || '');
 });
});

// プレースホルダーの値をランダムに3つ取得
const getRandomValues = (values: PlaceValueType[], count: number) => {
 const shuffledValues = [...values].sort(() => Math.random() - 0.5);
 return shuffledValues.slice(0, count).map((v) => v.value);
};

// アイテムを追加
const addItem = () => {
 omikenStore.updateOmiken({ type: 'places', addKeys: [{ name: '新しいプレースホルダー' }] });
};
</script>
