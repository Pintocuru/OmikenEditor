<!-- src/components/DialogThreshold/ThresholdSimple.vue -->
<template>
 <div>
  <!-- target条件 -->
  <v-sheet v-if="threshold.conditionType === 'target'" class="pt-8">
   <v-text-field
    v-model.number="currentItem.target"
    type="number"
    min="2"
    max="10"
    label="同じユーザーのコメントが連続した回数"
    @update:modelValue="$emit('update:threshold', currentItem)"
   />
  </v-sheet>

  <!-- coolDown条件 -->
  <v-sheet v-if="threshold.conditionType === 'coolDown'" class="pt-8">
   <v-text-field
    v-model.number="currentItem.coolDown"
    type="number"
    min="1"
    max="3600"
    label="指定した時間(秒)"
    @update:modelValue="$emit('update:threshold', currentItem)"
   />
  </v-sheet>

  <!-- syoken条件 -->
  <v-slider
   v-if="threshold.conditionType === 'syoken'"
   v-model="currentItem.syoken"
   :min="1"
   :max="4"
   :step="1"
   show-ticks="always"
   tick-size="4"
   :ticks="[SyokenCondition.SYOKEN, SyokenCondition.AGAIN, SyokenCondition.HI, SyokenCondition.ALL]"
   @update:modelValue="$emit('update:threshold', currentItem)"
  >
   <template #tick-label="{ tick }">
    {{ EXAMPLES[type].syoken[tick.value as SyokenCondition] }}
   </template>
  </v-slider>

  <!-- access条件 -->
  <v-slider
   v-if="threshold.conditionType === 'access'"
   v-model="currentItem.access"
   :min="2"
   :max="4"
   :step="1"
   show-ticks="always"
   tick-size="3"
   :ticks="[AccessCondition.MEMBER, AccessCondition.MODERATOR, AccessCondition.ADMIN]"
   @update:modelValue="$emit('update:threshold', currentItem)"
  >
   <template #tick-label="{ tick }">
    {{ EXAMPLES[type].access[tick.value] }}
   </template>
  </v-slider>

  <!-- gift条件 -->
  <div v-if="threshold.conditionType === 'gift'" class="d-flex flex-wrap gap-2">
   <v-chip
    v-for="item in SELECT_ITEMS[type].gift"
    class="ma-1"
    :key="item.value"
    :value="item.value"
    :class="{ 'bg-primary': Number(currentItem.gift) === Number(item.value) }"
    @click="
     currentItem.gift = Number(item.value) as GiftCondition;
     $emit('update:threshold', currentItem);
    "
   >
    {{ item.title }}
   </v-chip>
  </div>
 </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ThresholdType, SyokenCondition, AccessCondition, GiftCondition, TypesType } from '@type';
import { FunkThreshold } from '@composables/FunkThreshold';

const props = defineProps<{
 threshold: ThresholdType;
 type: TypesType;
}>();
// typeのdefaultはcomment
const type = computed(() => props.type || 'comment');

const emit = defineEmits<{
 (e: 'update:threshold', threshold: ThresholdType): void;
}>();

// コンポーザブル:FunkThreshold
const { EXAMPLES, SELECT_ITEMS } = FunkThreshold();

// computedプロパティで型安全な値を提供
const currentItem = computed({
 get: () => props.threshold,
 set: (value) => emit('update:threshold', value)
});
</script>
