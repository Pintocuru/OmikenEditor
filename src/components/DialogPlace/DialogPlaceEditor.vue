<!-- src/components/DialogPlace/DialogPlaceEditor.vue -->
<template>
 <v-list density="compact">
  <draggable
   v-model="currentItem.values"
   item-key="id"
   handle=".handle"
   @end="updateOmikenEntry('places', currentItem)"
  >
   <template #item="{ element: value, index }">
    <v-list-item>
     <v-row align="center" no-gutters>
      <v-col cols="auto" class="me-1">
       <v-icon class="handle" color="grey">mdi-drag</v-icon>
      </v-col>
      <v-col cols="2" class="me-2">
       <v-text-field
        v-model.number="value.weight"
        label="重み"
        type="number"
        @update:model-value="updateOmikenEntry('places', currentItem)"
       />
      </v-col>
      <v-col>
       <v-text-field v-model="value.value" label="値" @update:model-value="updateOmikenEntry('places', currentItem)" />
      </v-col>
      <v-col cols="auto">
       <PartsArrayRemovePlace
        type="omikujis"
        :currentItem="currentItem"
        :index="index"
        size="32"
        v-model:array="currentItem.values"
        @update:array="updateOmikenEntry('places', currentItem)"
       />
      </v-col>
     </v-row>
    </v-list-item>
   </template>
  </draggable>
 </v-list>
</template>

<script setup lang="ts">
import { PlaceType, ListEntryType, OmikenEntry, OmikenCategory } from '@type';
import PartsArrayRemovePlace from '@common/PartsArrayRemovePlace.vue';
import { FunkEmits } from '@composables/FunkEmits';
import draggable from 'vuedraggable';

const props = defineProps<{
 currentItem: PlaceType;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<OmikenCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmikenEntry } = FunkEmits(emit);
</script>
