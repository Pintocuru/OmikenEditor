<!-- src/components/DialogPlace/DialogPlace.vue -->
<template>
 <v-card v-if="entry" style="height: 80vh; overflow-y: auto">
  <!-- ツールバー -->
  <v-toolbar color="primary" density="comfortable">
   <v-toolbar-title>
    {{ entry.name }}
    <!-- 名前・説明の編集 -->
    <PartsNameEditor type="places" :item="entry" />
   </v-toolbar-title>
   <template #append>
    <span class="mr-2">ID : {{ entry?.id }}</span>
    <PartsArrayAction editMode="placeDialog" :entry="entry" />
   </template>
  </v-toolbar>

  <v-card-text>
   <!-- アイテムの説明 -->
   <v-sheet v-if="entry.description" class="text-subtitle-2">
    {{ entry.description }}
   </v-sheet>

   <!-- プレースホルダーの説明 -->
   <DialogOmikujiPostDescription type="places" :item="entry" />
   <!-- プレースホルダー -->
   <v-card>
    <v-sheet class="d-flex ga-2 justify-end">
     <v-select
      v-model="entry.placeIds"
      :items="placeItems"
      label="プレースホルダー"
      item-title="name"
      item-value="id"
      multiple
      chips
      clearable
      @update:modelValue="updateOmiken({ type: 'places', updates: [entry] })"
     />
     <!-- テキストエディター -->
     <DialogPlaceTextMode v-if="entry" :currentItem="entry" />

     <v-btn icon color="primary" @click="addValue">
      <v-tooltip activator="parent" location="bottom">新しい行を追加する</v-tooltip>
      <v-icon>mdi-plus</v-icon>
     </v-btn>
    </v-sheet>
    <!-- 複製・削除ボタン -->
    <DialogPlaceEditor :item="entry" />
   </v-card>
  </v-card-text>
 </v-card>
 <v-alert v-else type="warning">プレースホルダーが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PlaceType } from '@type';
import PartsArrayAction from '@common/PartsArrayAction.vue';
import DialogOmikujiPostDescription from '@components/DialogOmikuji/DialogOmikujiPostDescription.vue';
import DialogPlaceTextMode from '@components/DialogPlace/DialogPlaceTextMode.vue';
import DialogPlaceEditor from '@components/DialogPlace/DialogPlaceEditor.vue';
import PartsNameEditor from '@common/PartsNameEditor.vue';
import { useOmikenStore } from '@/store/UseOmikenStore';

const props = defineProps<{
 entry: PlaceType;
}>();

// pinia:OmikenStore
const { updateOmiken, getOmikenItems } = useOmikenStore();

// placeItems の実装を修正
const placeItems = computed(() => {
 if (!props.entry) return [];
 return Object.entries(getOmikenItems('places')).map(([id, place]) => ({ id, name: place.name }));
});

// 値の追加
const addValue = () => {
 if (props.entry) props.entry.values.unshift({ weight: 1, value: '' });
};
</script>
