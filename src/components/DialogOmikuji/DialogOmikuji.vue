<!-- src/components/DialogOmikuji/DialogOmikuji.vue -->
<template>
 <v-card v-if="entry" style="height: 80vh; overflow-y: auto">
  <!-- ツールバーの変更 -->
  <v-toolbar :color="themeColor" density="comfortable">
   <v-toolbar-title>
    {{ entry.name }}
    <!-- 名前・説明の編集 -->
    <PartsNameEditor type="omikujis" :item="entry" />
   </v-toolbar-title>
   <template #append>
    <span class="mr-2">ID : {{ entry?.id }}</span>
    <PartsArrayAction editMode="omikujiAddDialog" :entry="entry" />
   </template>
  </v-toolbar>
  <v-card-text v-if="entry.description" class="text-subtitle-2">
   {{ entry.description }}
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
     <component :is="currentListComponent" :key="tab" :item="entry" v-model="tab" @update:modelValue="tab = $event" />
    </v-tabs-window>
   </v-form>
  </v-card-text>
 </v-card>
 <v-alert v-else type="warning">おみくじが選択されていません。</v-alert>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { DialogTabValue, OmikujiType } from '@type';
import PartsArrayAction from '@common/PartsArrayAction.vue';
import DialogOmikujiPost from '@components/DialogOmikuji/DialogOmikujiPost.vue';
import DialogOmikujiStatus from '@components/DialogOmikuji/DialogOmikujiStatus.vue';
import DialogOmikujiPlaces from '@components/DialogOmikuji/DialogOmikujiPlaces.vue';
import DialogOmikujiScripts from '@components/DialogOmikuji/DialogOmikujiScripts.vue';
import PartsNameEditor from '@common/PartsNameEditor.vue';
import { FunkOmikuji } from '@composables/FunkOmikuji';

// props/emits
const props = defineProps<{
 entry: OmikujiType;
}>();

// タブアイテムの型定義
interface TabItem {
 value: DialogTabValue;
 icon: string;
 label: string;
}

// コンポーザブル:FunkOmikuji
const { getPostTypeColor } = FunkOmikuji();

// タブの状態管理
const tab = ref<DialogTabValue>('post');
// 子コンポーネントの指定
const currentListComponent = computed(() => componentMap[tab.value]);
// postのonecommeで使われているBotKeyの色を取得
const themeColor = computed(() => (props.entry ? getPostTypeColor(props.entry.post, true) : ''));

// タブ
const tabs: TabItem[] = [
 { value: 'post', icon: 'mdi-message', label: 'メッセージ' },
 { value: 'addStatus', icon: 'mdi-chart-bar', label: 'ステータス' },
 { value: 'places', icon: 'mdi-swap-horizontal', label: 'プレース' },
 { value: 'scriptParams', icon: 'mdi-script-text', label: 'スクリプト' }
];

// コンポーネントマップ
const componentMap = {
 post: DialogOmikujiPost,
 addStatus: DialogOmikujiStatus,
 places: DialogOmikujiPlaces,
 scriptParams: DialogOmikujiScripts
} as const;

// バッジ関連
const badgeHandlers = {
 post: (entry: OmikujiType) => ({
  content: entry.post?.length || 0,
  show: (entry.post?.length || 0) > 0
 }),
 addStatus: (entry: OmikujiType) => ({
  content: '',
  show: !!entry.addStatus || !!entry.addPoints
 }),
 places: (entry: OmikujiType) => ({
  content: entry.placeIds?.length || 0,
  show: (entry.placeIds?.length || 0) > 0
 }),
 scriptParams: (entry: OmikujiType) => ({
  content: '',
  show: !!entry.scriptParams
 })
};

// バッジの内容を取得
const getBadgeContent = (tabValue: DialogTabValue): string | number =>
 props.entry ? badgeHandlers[tabValue]?.(props.entry).content || '' : '';

// バッジを表示するかどうか
const hasContent = (tabValue: DialogTabValue): boolean =>
 props.entry ? badgeHandlers[tabValue]?.(props.entry).show || false : false;
</script>
