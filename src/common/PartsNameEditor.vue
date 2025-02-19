<!-- src/components/common/PartsNameEditor.vue -->
<template>
 <v-dialog v-model="dialog" persistent max-width="600px">
  <v-card>
   <v-card-title>基本情報の編集</v-card-title>
   <v-card-text>
    <v-form @submit.prevent>
     <!-- idの変更 -->
     <v-text-field
      v-model="localItem.id"
      label="ID"
      :rules="[
       (v) => !!v || 'IDは必須です',
       (v) => !isDuplicateId(v) || 'このIDは既に使用されています',
       (v) => /^[a-zA-Z0-9_-]+$/.test(v) || 'IDは半角英数字、ハイフン、アンダースコアのみ使用可能です'
      ]"
      hint="半角英数字、ハイフン、アンダースコアが使用可能です"
      persistent-hint
     >
      <v-tooltip activator="parent" location="bottom">
       システム内で重複しない一意の識別子を入力してください。<br />
       例: "omikuji_daikichi", "omikuji_01" など
      </v-tooltip>
     </v-text-field>

     <!-- 名称 -->
     <v-text-field v-model="localItem.name" label="結果名" :rules="[(v) => !!v || '結果名は必須です']">
      <v-tooltip activator="parent" location="bottom">
       おみくじの結果の名称（ラベル）を入力してください。<br />
       例: 「大吉」「中吉」「小吉」など。
      </v-tooltip>
     </v-text-field>

     <!-- 説明文 -->
     <v-textarea v-model="localItem.description" label="説明文" rows="4" />
    </v-form>
   </v-card-text>
   <v-card-actions>
    <v-spacer />
    <v-btn color="primary" @click="saveChanges">保存</v-btn>
    <v-btn @click="dialog = false">キャンセル</v-btn>
   </v-card-actions>
  </v-card>
 </v-dialog>

 <!-- 編集ボタン-->
 <v-btn icon size="small" @click.stop="dialog = true">
  <v-icon>mdi-pencil</v-icon>
 </v-btn>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { OmikenCategory, OmikenTypeMap } from '@type';
import { useOmikenStore } from '@/store/UseOmikenStore';

const props = defineProps<{
 type: OmikenCategory;
 item: OmikenTypeMap<OmikenCategory>;
}>();

// pinia:omikenStore
const omikenStore = useOmikenStore();

const dialog = ref(false);
const localItem = ref({ ...props.item });

// ID重複チェック
const isDuplicateId = (newId: string): boolean => {
 return Object.values(omikenStore.getOmikenItems(props.type)).some(
  (item) => item.id !== props.item.id && item.id === newId
 );
};

// ダイアログを開く際に値を初期化
watch(
 () => dialog.value,
 (newValue) => {
  if (newValue) localItem.value = { ...props.item };
 }
);

const saveChanges = () => {
 omikenStore.updateOmiken({ type: props.type, updates: [localItem.value] });
 dialog.value = false;
};
</script>
