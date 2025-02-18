<!-- src/components/DialogThreshold/ThresholdCount.vue -->
<template>
 <v-sheet v-if="currentItem">
  <v-sheet>
   <v-select
    v-model="currentItem.count!.unit"
    :items="SELECT_ITEMS[type].unit"
    label="単位"
    @update:modelValue="$emit('update:threshold', currentItem)"
   />
  </v-sheet>

  <v-sheet class="d-flex align-center ga-2">
   <v-select
    v-model="currentItem.count!.comparison"
    :items="SELECT_ITEMS[type].comparison"
    label="比較方法"
    @update:modelValue="$emit('update:threshold', currentItem)"
   />
  </v-sheet>

  <v-sheet>
   <v-text-field
    v-model.number="currentItem.count!.value1"
    type="number"
    min="0"
    max="100000"
    label="値1"
    @update:modelValue="$emit('update:threshold', currentItem)"
   />
  </v-sheet>

  <v-sheet v-if="currentItem.count!.comparison === 'range'">
   <v-text-field
    v-model.number="currentItem.count!.value2"
    type="number"
    min="0"
    max="100000"
    label="値2"
    @update:modelValue="$emit('update:threshold', currentItem)"
   />
  </v-sheet>
 </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FunkThreshold } from '@composables/FunkThreshold';
import { ThresholdType, TypesType } from '@type';

const props = defineProps<{
 threshold: ThresholdType;
 type: TypesType;
}>();
// typeのdefaultはcomment
const type = computed(() => props.type || 'comment');

const emit = defineEmits<{
 (e: 'update:threshold', threshold: ThresholdType): void;
}>();

// computedプロパティで型安全な値を提供
const currentItem = computed({
 get: () => props.threshold,
 set: (value) => emit('update:threshold', value)
});

// コンポーザブル:FunkThreshold
const { SELECT_ITEMS } = FunkThreshold();
</script>
