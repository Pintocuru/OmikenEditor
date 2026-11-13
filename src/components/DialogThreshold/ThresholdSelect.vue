<!-- src/components/DialogThreshold/ThresholdSelect.vue -->
<template>
 <v-tabs v-model="tab" align-tabs="center" stacked>
  <v-tab
   v-for="tabItem in THRESHOLD_ITEMS"
   :key="tabItem.value"
   :value="tabItem.value"
   variant="elevated"
   @click="$emit('update:condition', tabItem.value as ConditionType)"
   :color="tab === tabItem.value ? 'primary' : ''"
  >
   <v-icon :icon="tabItem.icon"></v-icon>
   {{ tabItem.label }}
  </v-tab>
 </v-tabs>

 <div class="text-body-1 mt-4">
  {{ THRESHOLD_ITEMS[threshold.conditionType].description }}
 </div>
</template>

<script setup lang="ts">
import { FunkThreshold } from '@/composables/funkThreshold';
import { ConditionType, ThresholdType } from '@type';
import { ref } from 'vue';

const props = defineProps<{
 threshold: ThresholdType;
}>();

const emit = defineEmits<{
 (e: 'update:condition', condition: ConditionType): void;
}>();

const tab = ref<ConditionType | null>(props.threshold.conditionType);

// コンポーザブル:FunkThreshold
const { THRESHOLD_ITEMS } = FunkThreshold();
</script>
