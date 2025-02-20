<!-- src/components/DialogPlace/DialogPlaceEditor.vue -->
<template>
 <v-list density="compact">
  <draggable
   v-model="item.values"
   item-key="id"
   handle=".handle"
   @end="updateOmiken({ type: 'places', updates: [item] })"
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
        @update:model-value="updateOmiken({ type: 'places', updates: [item] })"
       />
      </v-col>
      <v-col>
       <v-text-field
        v-model="value.value"
        label="値"
        @update:model-value="updateOmiken({ type: 'places', updates: [item] })"
       />
      </v-col>
      <v-col cols="auto">
       <PartsArrayRemovePlace
        type="omikujis"
        :currentItem="item"
        :index="index"
        size="32"
        v-model:array="item.values"
        @update:array="updateOmiken({ type: 'places', updates: [item] })"
       />
      </v-col>
     </v-row>
    </v-list-item>
   </template>
  </draggable>
 </v-list>
</template>

<script setup lang="ts">
import { PlaceType } from '@type';
import PartsArrayRemovePlace from '@common/PartsArrayRemovePlace.vue';
import { useOmikenStore } from '@/store/UseOmikenStore';
import draggable from 'vuedraggable';

const props = defineProps<{
 item: PlaceType;
}>();

// pinia:OmikenStore
const { updateOmiken } = useOmikenStore();
</script>
