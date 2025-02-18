<!-- src/components/common/PartsArrayRemove.vue -->
<template>
 <v-menu v-model="menu" :close-on-content-click="false">
  <template v-slot:activator="{ props }">
   <v-btn v-bind="props" color="info" size="default">
    <v-icon>mdi-dots-vertical</v-icon>
   </v-btn>
  </template>
  <v-list>
   <v-list-item @click="postDuplicate(index)">
    <v-icon class="text-info">mdi-content-copy</v-icon>
    <span class="text-info pl-6">複製</span>
   </v-list-item>
   <v-list-item @click="postRemove(index)">
    <v-icon class="text-error">mdi-delete</v-icon>
    <span class="text-error pl-6">削除</span>
   </v-list-item>
  </v-list>
 </v-menu>
</template>

<script setup lang="ts">
import { ref, PropType, computed } from 'vue';
import { OmikenEntry, ListCategory, OmikenType, OmikujiType, PlaceType, RulesType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';
import { FunkTypes } from '@/composables/FunkTypes';

const props = defineProps<{
 type: 'omikujis' | 'places';
 currentItem: OmikujiType | PlaceType;
 index: number;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
}>();

const menu = ref(false);

// コンポーザブル:FunkEmits
const { updateOmikenEntry } = FunkEmits(emit);
const { isListType } = FunkTypes();

const array = computed(() => {
 if (props.type === 'omikujis' && isListType(props.currentItem, props.type)) {
  return props.currentItem.post;
 } else if (props.type === 'places' && isListType(props.currentItem, props.type)) {
  return props.currentItem.values;
 } else {
  return [];
 }
});

function postDuplicate(index: number) {
 const newPost = JSON.parse(JSON.stringify(array.value[index]));
 array.value.splice(index + 1, 0, newPost);
 updateOmikenEntry(props.type, props.currentItem);
}

function postRemove(index: number) {
 array.value.splice(index, 1);
 updateOmikenEntry(props.type, props.currentItem);
}
</script>
