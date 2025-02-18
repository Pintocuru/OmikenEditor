<!-- src/components/DialogPlace/DialogPlace.vue -->
<template>
 <v-card v-if="currentItem" style="height: 80vh; overflow-y: auto">
  <!-- ツールバー -->
  <v-toolbar color="primary" density="comfortable">
   <v-toolbar-title>
    {{ currentItem.name }}
    <!-- 名前・説明の編集 -->
    <PartsNameEditor type="places" :currentItem="currentItem" />
   </v-toolbar-title>
   <template #append>
    <span class="mr-2">ID : {{ currentItem?.id }}</span>
    <PartsArrayAction editMode="placeDialog" :entry="currentItem" @update:Omiken="updateOmiken" />
   </template>
  </v-toolbar>

  <v-card-text>
   <!-- アイテムの説明 -->
   <v-sheet v-if="currentItem.description" class="text-subtitle-2">
    {{ currentItem.description }}
   </v-sheet>

   <!-- プレースホルダーの説明 -->
   <DialogOmikujiPostDescription :currentItem="currentItem" @open-editor="openEditor" />
   <!-- プレースホルダー -->
   <v-card>
    <v-sheet class="d-flex ga-2 justify-end">
     <v-select
      v-model="currentItem.placeIds"
      :items="placeItems"
      label="プレースホルダー"
      item-title="name"
      item-value="id"
      multiple
      chips
      clearable
      @update:modelValue="updateOmikenEntry('places', currentItem)"
     />
     <!-- テキストエディター -->
     <DialogPlaceTextMode v-if="currentItem" :currentItem="currentItem" @update:Omiken="updateOmiken" />

     <v-btn icon color="primary" @click="addValue">
      <v-tooltip activator="parent" location="bottom">新しい行を追加する</v-tooltip>
      <v-icon>mdi-plus</v-icon>
     </v-btn>
    </v-sheet>
    <!-- 複製・削除ボタン -->
    <DialogPlaceEditor :currentItem="currentItem" @update:Omiken="updateOmiken" />
   </v-card>
  </v-card-text>
 </v-card>
 <v-alert v-else type="warning">プレースホルダーが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, Ref } from 'vue';
import { OmikenEntry, OmikenCategory, ListEntryType, AppEditorType } from '@type';
import PartsArrayAction from '@common/PartsArrayAction.vue';
import DialogOmikujiPostDescription from '@components/DialogOmikuji/DialogOmikujiPostDescription.vue';
import DialogPlaceTextMode from '@components/DialogPlace/DialogPlaceTextMode.vue';
import DialogPlaceEditor from '@components/DialogPlace/DialogPlaceEditor.vue';
import PartsNameEditor from '@common/PartsNameEditor.vue';
import { FunkEmits } from '@composables/FunkEmits';

const props = defineProps<{
 entry: ListEntryType<'places'> | null;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<OmikenCategory>): void;
 (e: 'open-editor', editorItem: ListEntryType<OmikenCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const places = computed(() => AppEditor?.value.Omiken.places || {});

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, updateOmikenEntry } = FunkEmits(emit);

// props のidから読み込み
const currentItem = computed(() => (props.entry?.key && places ? places.value[props.entry.key as string] : null));

// placeItems の実装を修正
const placeItems = computed(() => {
 if (!places.value) return [];
 return Object.entries(places.value).map(([id, place]) => ({
  id: place.id,
  name: place.name
 }));
});

// 値の追加
const addValue = () => {
 if (!currentItem.value) return;
 currentItem.value.values.unshift({ weight: 1, value: '' });
};
</script>
