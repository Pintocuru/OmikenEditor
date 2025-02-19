<!-- src/components/DialogOmikuji/DialogOmikujiStatus.vue -->
<template>
 <v-select
  v-model="item.placeIds"
  :items="placeItems"
  label="プレースホルダー"
  item-title="name"
  item-value="id"
  multiple
  chips
  clearable
  @update:modelValue="updateOmiken({ type: 'omikujis', updates: [item] })"
 />
 <v-sheet>
  <v-btn block @click="addItem('places')" color="primary" variant="flat" class="mt-6">
   <v-icon left>mdi-plus</v-icon> 📍 プレースホルダーの追加
  </v-btn>
 </v-sheet>
</template>

<script setup lang="ts">
import { computed, inject, Ref } from 'vue';
import { OmikujiType, AppEditorType, generateUniqueKey, EventCategory, DialogTabValue } from '@type';
import { useOmikenStore } from '@/store/UseOmikenStore';
import { UseUIStore } from '@/store/UseUIStore';

const props = defineProps<{
 item: OmikujiType;
 modelValue: DialogTabValue;
}>();

// pinia:OmikenStore
const { updateOmiken, getOmikenItems } = useOmikenStore();
// pinia:UseUIStore
const { updateDialog } = UseUIStore();

const places = computed(() => getOmikenItems('places') || {});

// placeItems の実装を修正
const placeItems = computed(() => {
 return Object.entries(places.value).map(([id, place]) => ({
  id: place.id,
  name: place.name
 }));
});

const addItem = (type: EventCategory) => {
 // 新規のプレースホルダーを追加
 const id = generateUniqueKey();
 updateOmiken({ type, addKeys: [{ id, name: 'NewPlace' }] });

 // プレースホルダーを追加
 const newItem = props.item;
 newItem.placeIds.push(id);
 updateOmiken({ type: 'omikujis', updates: [newItem] });

 // エディタを開く
 updateDialog({ type, id });
};
</script>
