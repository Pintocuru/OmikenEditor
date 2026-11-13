<!-- src/components/DialogThreshold/ThresholdMatch.vue -->
<template>
 <v-sheet v-if="currentItem">
  <v-sheet class="pt-8">
   <v-row>
    <v-col cols="12" md="6">
     <v-select
      v-model="currentItem.match!.target"
      :items="SELECT_ITEMS[type].target"
      label="対象"
      @update:modelValue="$emit('update:threshold', currentItem)"
     />
    </v-col>
    <v-col cols="12" md="6">
     <v-select
      v-model="currentItem.match!.case"
      :items="SELECT_ITEMS[type].case"
      label="一致条件"
      @update:modelValue="$emit('update:threshold', currentItem)"
     />
    </v-col>
   </v-row>

   <v-combobox
    v-model="currentItem.match!.value"
    label="キーワード"
    chips
    multiple
    clearable
    @update:modelValue="$emit('update:threshold', currentItem)"
   />
  </v-sheet>
 </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ThresholdType, TypesType } from '@type';
import { FunkThreshold } from '@/composables/funkThreshold';

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
