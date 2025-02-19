<!-- src/components/DialogOmikuji/DialogOmikujiStatus.vue -->
<template>
 ユーザーに {{ item.addStatus }} の内部ステータスを設定・変更します
 <!-- visit.status -->
 <v-text-field
  v-model="item.addStatus"
  label="ステータス"
  item-title="text"
  item-value="value"
  dense="compact"
  clearable
  @update:modelValue="updateOmiken({ type: 'omikujis', updates: [item] })"
 >
 </v-text-field>
 <!-- visit.point -->
 <v-text-field
  v-model="item.addPoints"
  label="ポイント"
  item-title="text"
  item-value="value"
  dense="compact"
  clearable
  @update:modelValue="updateOmiken({ type: 'omikujis', updates: [item] })"
 >
 </v-text-field>
</template>

<script setup lang="ts">
import { OmikujiType } from '@type';
import { useOmikenStore } from '@/store/UseOmikenStore';

const props = defineProps<{
 item: OmikujiType;
 modelValue: 'places' | 'post' | 'threshold' | 'status' | 'scripts';
}>();

// pinia:OmikenStore
const { updateOmiken } = useOmikenStore();
</script>
