<!-- src/App.vue -->
<template>
 <v-app theme="dark">
  <!-- ローディング中の表示 -->
  <template v-if="isAppEditorLoading">
   <PartsAppEditorLoading />
  </template>
  <template v-else>
   <!-- ヘッダー -->
   <AppHeader :Omiken="AppEditor.Omiken" />
   <!-- 左端のナビゲーション -->
   <AppNavigation v-model:naviCategory="naviCategory" :AppEditor="AppEditor" @update:category="naviCategory = $event" />
   <v-main>
    <v-container>
     <!-- アイテムリスト -->
     <AppList :AppEditor="AppEditor" :categoryActive="naviCategory" />
    </v-container>
   </v-main>
   <!-- ダイアログ -->
   <AppDialog :Omiken="AppEditor.Omiken" />
  </template>
 </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from '@components/AppHeader.vue';
import AppNavigation from '@components/AppNavigation.vue';
import AppList from '@components/AppList.vue';
import AppDialog from '@components/AppDialog.vue';
import PartsAppEditorLoading from '@common/PartsAppEditorLoading.vue';
import { FunkUI } from '@composables/FunkUI';
import { useOmikenStore } from './store/UseOmikenStore';

const { naviCategory, listEntry, openEditor } = FunkUI();

// AppEditorのコンポーザブル
const { AppEditor, isAppEditorLoading, updateOmiken, updateOmikenPresetData, AppEditorInitialize } = useOmikenStore();

// APIから取得
onMounted(async () => {
 // piniaの宣言
 await AppEditorInitialize();
});
</script>
