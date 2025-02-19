<!-- src/components/DialogOmikuji/DialogOmikujiThreshold.vue -->
<template>
 <DialogThreshold :item="currentItem" type="comment" mode="omikujis" />
</template>

<script setup lang="ts">
import { OmikenCategory, ListEntryType, OmikujiType, OmikenEntry } from '@type';

import DialogThreshold from '@components/DialogThreshold/DialogThreshold.vue';

const props = defineProps<{
 currentItem: OmikujiType;
 modelValue: 'places' | 'post' | 'threshold' | 'status' | 'scripts';
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<OmikenCategory>): void;
 (e: 'open-editor', editorItem: ListEntryType<OmikenCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken } = FunkEmits(emit);
</script>
