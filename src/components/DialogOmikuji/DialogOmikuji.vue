<!-- src/components/DialogOmikuji/DialogOmikuji.vue -->
<template>
 <v-card v-if="currentItem" style="height: 80vh; overflow-y: auto">
  <!-- ツールバーの変更 -->
  <v-toolbar :color="themeColor" density="comfortable">
   <v-toolbar-title>
    {{ currentItem.name }}
    <!-- 名前・説明の編集 -->
    <PartsNameEditor type="omikujis" :currentItem="currentItem" @update:Omiken="updateOmiken" />
   </v-toolbar-title>
   <template #append>
    <span class="mr-2">ID : {{ currentItem?.id }}</span>
    <PartsArrayAction editMode="omikujiAddDialog" :entry="currentItem" @update:Omiken="updateOmiken" />
   </template>
  </v-toolbar>
  <v-card-text v-if="currentItem.description" class="text-subtitle-2">
   {{ currentItem.description }}
  </v-card-text>

  <!-- タブ -->
  <v-tabs v-model="tab" align-tabs="center" stacked>
   <v-tab v-for="tabItem in tabs" :key="tabItem.value" :value="tabItem.value">
    <v-badge :content="getBadgeContent(tabItem.value)" :model-value="hasContent(tabItem.value)" color="primary">
     <v-icon :icon="tabItem.icon"></v-icon>
    </v-badge>
    {{ tabItem.label }}
   </v-tab>
  </v-tabs>

  <v-card-text>
   <v-form @submit.prevent>
    <v-tabs-window v-model="tab">
     <!-- 各メニューの表示 -->
     <component
      :is="currentListComponent"
      :key="tab"
      :currentItem="currentItem"
      v-model="tab"
      @update:modelValue="tab = $event"
      @update:Omiken="updateOmiken"
      @open-editor="openEditor"
     />
    </v-tabs-window>
   </v-form>
  </v-card-text>
 </v-card>
 <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref } from 'vue';
import { OmikenEntry, ListEntryType, OmikenCategory, AppEditorType } from '@type';
import PartsArrayAction from '@common/PartsArrayAction.vue';
import DialogOmikujiPost from '@components/DialogOmikuji/DialogOmikujiPost.vue';
import DialogOmikujiThreshold from '@components/DialogOmikuji/DialogOmikujiThreshold.vue';
import DialogOmikujiStatus from '@components/DialogOmikuji/DialogOmikujiStatus.vue';
import DialogOmikujiPlaces from '@components/DialogOmikuji/DialogOmikujiPlaces.vue';
import DialogOmikujiScripts from '@components/DialogOmikuji/DialogOmikujiScripts.vue';
import PartsNameEditor from '@common/PartsNameEditor.vue';
import { FunkOmikuji } from '@composables/FunkOmikuji';
import { FunkEmits } from '@composables/FunkEmits';

// props/emits
const props = defineProps<{
 entry: ListEntryType<'omikujis'> | null;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<OmikenCategory>): void;
 (e: 'open-editor', editorItem: ListEntryType<OmikenCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const omikujis = computed(() => AppEditor?.value.Omiken.omikujis ?? {});

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor } = FunkEmits(emit);

// コンポーザブル:FunkOmikuji
const { getPostTypeColor } = FunkOmikuji();

// タブ
const tab = ref<'post' | 'status' | 'places' | 'threshold' | 'scripts'>('post'); // タブの状態管理
const tabs = [
 { value: 'post', icon: 'mdi-message', label: 'メッセージ' },
 { value: 'status', icon: 'mdi-chart-bar', label: 'ステータス' },
 { value: 'places', icon: 'mdi-swap-horizontal', label: 'プレース' },
 { value: 'threshold', icon: 'mdi-tune', label: '条件設定' },
 { value: 'scripts', icon: 'mdi-script-text', label: 'スクリプト' }
];

// 子コンポーネントの指定
const currentListComponent = computed(() => {
 const componentMap = {
  post: DialogOmikujiPost,
  threshold: DialogOmikujiThreshold,
  status: DialogOmikujiStatus,
  places: DialogOmikujiPlaces,
  scripts: DialogOmikujiScripts
 } as const;

 return componentMap[tab.value];
});

// propsからデータを解読
const currentItem = computed(() => (props.entry?.key && omikujis ? omikujis.value[props.entry.key as string] : null));

// バッジの内容を取得する関数
const getBadgeContent = (tabValue: string): string | number => {
 if (!currentItem.value) return '';

 switch (tabValue) {
  case 'post':
   return currentItem.value.post?.length || 0;
  case 'places':
   return currentItem.value.placeIds?.length || 0;
  case 'threshold':
  case 'status':
  case 'scripts':
   return '';
  default:
   return '';
 }
};

// バッジを表示するかどうかを判定する関数
const hasContent = (tabValue: string): boolean => {
 if (!currentItem.value) return false;

 switch (tabValue) {
  case 'post':
   return (currentItem.value.post?.length || 0) > 0;
  case 'places':
   return (currentItem.value.placeIds?.length || 0) > 0;
  case 'threshold':
   return !!currentItem.value.threshold?.length;
  case 'status':
   return !!currentItem.value.status;
  case 'scripts':
   return !!currentItem.value.script?.scriptId;
  default:
   return false;
 }
};

// postのonecommeで使われているBotKeyの色を取得する
const key = props.entry?.key;
let themeColor: string;
if (omikujis && typeof key === 'string' && omikujis.value[key]) {
 themeColor = getPostTypeColor(omikujis.value[key].post, true);
} else {
 themeColor = '';
}
</script>
