<!-- src/components/common/PartsAppEditorLoading.vue -->

<template>
 <v-container class="d-flex justify-center align-center">
  <v-card class="mx-auto" color="grey lighten-4" max-width="400" outlined>
   <v-card-title class="text-center">ロード中...</v-card-title>
   <v-card-text class="text-center">
    <v-progress-circular indeterminate color="primary" />
    <p>
     データを読み込んでいます...<br />
     わんコメを起動し、プラグインから<br />
     「おみくじBOTプラグイン」を有効にしてください<br />
     <br />
     困ったら、こちらのページを見てね。<br />
     <a href="URL">こちらからダウンロード</a><br />
     <br />
     **読み込みに失敗しましたか？**<br />
     4. 問題が解決しない場合、サポートにお問い合わせください。<br />
    </p>
   </v-card-text>
  </v-card>
 </v-container>
</template>

<script setup lang="ts"></script>
