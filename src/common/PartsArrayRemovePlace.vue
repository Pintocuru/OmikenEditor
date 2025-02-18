<!-- src/components/common/PartsArrayRemovePlace.vue -->
<template>
 <v-menu v-model="menu" :close-on-content-click="false">
  <template v-slot:activator="{ props }">
   <v-btn v-bind="props" color="info" :size="size">
    <v-icon>{{ icon }}</v-icon>
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
import { ref, PropType } from 'vue';
import type { OmikenCategory } from '@type';

const props = defineProps({
 type: { type: String as PropType<OmikenCategory>, required: true }, // "omikuji" または "place"
 currentItem: { type: Object, required: true },
 array: { type: Array, required: true },
 index: { type: Number, required: true },
 icon: { type: String, default: 'mdi-dots-vertical' },
 size: { type: String, default: 'default' }
});
const emit = defineEmits<{
 (e: 'update:array', value: any[]): void;
}>();

const menu = ref(false);

function postDuplicate(index: number) {
 const newArray = [...props.array];
 const newPost = JSON.parse(JSON.stringify(newArray[index]));
 newArray.splice(index + 1, 0, newPost);
 emit('update:array', newArray);
}

function postRemove(index: number) {
 const newArray = [...props.array];
 newArray.splice(index, 1);
 emit('update:array', newArray);
}
</script>
