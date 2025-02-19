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
   <AppNavigation :AppEditor="AppEditor" :naviCategory="naviCategory" />
   <v-main>
    <v-container>
     <!-- アイテムリスト -->
     <AppList :AppEditor="AppEditor" :naviCategory="naviCategory" />
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
import { useOmikenStore } from './store/UseOmikenStore';
import { UseUIStore } from './store/UseUIStore';

// pinia:OmikenStore
const { AppEditor, isAppEditorLoading, AppEditorInitialize } = useOmikenStore();
// pinia:UseUIStore
const { naviCategory } = UseUIStore();

// APIから取得
onMounted(async () => {
 // piniaの宣言
 await AppEditorInitialize();
});
</script>
