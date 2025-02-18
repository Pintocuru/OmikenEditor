<!-- src/components/DialogOmikuji/DialogOmikujiPost.vue -->
<template>
 <!-- プレースホルダーの説明 -->
 <DialogOmikujiPostDescription
  :currentItem="currentItem"
  v-model="tab"
  @update:modelValue="$emit('update:modelValue', $event)"
  @open-editor="openEditor"
 />

 <!-- postメイン -->
 <v-expansion-panels multiple>
  <v-expansion-panel v-for="(post, index) in currentItem.post" :key="index">
   <v-expansion-panel-title hide-actions :color="getPostColor(post)">
    <v-toolbar density="compact" color="transparent">
     <!-- post種類 -->
     <v-chip variant="flat" :color="getTypeColor(post.type)">
      {{ getTypeLabel(post.type) }}
     </v-chip>
     <!-- 画像がある場合 -->
     <v-img v-if="isCharacterPost(post.type)" :src="getCharaImage(post)" max-height="80" max-width="80" class="ml-2" />
     <!-- postタイトル -->
     <v-toolbar-title> {{ post.content }} </v-toolbar-title>
     <!-- 遅延 -->
     <v-chip variant="flat" color="while">
      <v-icon class="mr-2">mdi-clock-outline</v-icon>
      <span class="font-weight-bold">{{ post.delaySeconds }}秒</span>
     </v-chip>
    </v-toolbar>
   </v-expansion-panel-title>
   <v-expansion-panel-text>
    <v-row dense>
     <v-col cols="12" sm="3">
      <!-- 種類セレクト -->
      <v-select
       v-model="post.type"
       :items="onecommeTypeItems"
       label="投稿の種類"
       item-title="text"
       item-value="value"
       @update:modelValue="updateOmikenEntry('omikujis', currentItem)"
      >
      </v-select>
     </v-col>

     <v-col cols="12" sm="9">
      <!-- メッセージ内容編集 -->
      <v-text-field
       v-model="post.content"
       label="内容"
       rows="2"
       auto-grow
       @input="updateOmikenEntry('omikujis', currentItem)"
      />
     </v-col>
    </v-row>

    <v-row dense v-if="isCharacterPost(post.type)">
     <v-col cols="12" sm="4">
      <!-- Botキー -->
      <v-select
       v-model="post.botKey"
       :items="botKeyItems"
       label="ボットキー"
       item-title="text"
       item-value="value"
       density="compact"
       @update:modelValue="updateOmikenEntry('omikujis', currentItem)"
      >
      </v-select>
     </v-col>
     <v-col cols="12" sm="4">
      <!-- アイコンキー -->
      <v-select
       v-model="post.iconKey"
       :items="getIconKeyItems(post.botKey)"
       label="アイコンキー"
       item-title="text"
       item-value="value"
       density="compact"
       @update:modelValue="updateOmikenEntry('omikujis', currentItem)"
      >
      </v-select>
     </v-col>
     <v-col cols="12" sm="4">
      <!-- 発動するWordParty -->
      <v-select
       v-if="isCharacterPost(post.type)"
       v-model="post.party"
       :items="charaParty(post.botKey) ?? []"
       label="発動するWordParty"
       item-title="text"
       item-value="value"
       density="compact"
       clearable
       @update:modelValue="updateOmikenEntry('omikujis', currentItem)"
      >
      </v-select>
     </v-col>
    </v-row>

    <v-row dense>
     <v-col cols="12" sm="9">
      <!-- 遅延編集スライダー -->
      <v-slider
       v-model.number="post.delaySeconds"
       prepend-icon="mdi-alarm"
       :thumb-size="24"
       thumb-label="always"
       class="pa-2"
       min="-1"
       max="10"
       step="0.1"
       @update:modelValue="updateOmikenEntry('omikujis', currentItem)"
      />
     </v-col>
     <v-col cols="12" sm="3">
      <!-- 遅延設定 -->
      <v-text-field
       v-model.number="post.delaySeconds"
       label="遅延時間(秒)"
       type="number"
       step="0.1"
       min="-1"
       density="compact"
       @input="updateOmikenEntry('omikujis', currentItem)"
      >
      </v-text-field>
     </v-col>
    </v-row>

    <!-- 詳細設定セクション -->
    <v-expand-transition>
     <v-row dense v-show="showAdvanced">
      <v-col cols="6">
       <!-- マニアック:BOTのメッセージを読み上げない -->
       <v-switch label="消音モード" v-model="post.isSilent" :color="post.isSilent ? 'primary' : ''"></v-switch>
      </v-col>
      <v-col cols="6">
       <!-- マニアック:ジェネレーターに渡す引数編集 -->
       <v-text-field
        v-model="post.generatorParam"
        label="ジェネレーターに渡す引数"
        rows="2"
        auto-grow
        @input="updateOmikenEntry('omikujis', currentItem)"
       />
      </v-col>
     </v-row>
    </v-expand-transition>

    <v-row dense>
     <v-col cols="6">
      <v-sheet class="text-subtitle-1 d-flex align-center">
       詳細設定
       <v-btn
        icon="mdi-cog"
        class="ml-3"
        :color="showAdvanced ? 'primary' : ''"
        variant="elevated"
        @click="showAdvanced = !showAdvanced"
       />
      </v-sheet>
     </v-col>
     <v-col cols="6">
      <v-sheet class="d-flex justify-end">
       <!-- 複製・削除ボタン -->
       <PartsArrayRemove
        type="omikujis"
        :currentItem="currentItem"
        :array="currentItem.post"
        :index="index"
        @update:Omiken="updateOmiken"
       />
      </v-sheet>
     </v-col>
    </v-row>
   </v-expansion-panel-text>
  </v-expansion-panel>
 </v-expansion-panels>
 <v-card-actions>
  <v-btn block @click="addPost()" color="primary" variant="flat" class="mb-2">
   <v-icon left>mdi-plus</v-icon> 追加
  </v-btn>
 </v-card-actions>
</template>

<script setup lang="ts">
import { inject, ref, Ref } from 'vue';
import { OmikenCategory, ListEntryType, OmikujiType, OmikenEntry, OneCommePostType, AppEditorType } from '@type';
import DialogOmikujiPostDescription from '@components/DialogOmikuji/DialogOmikujiPostDescription.vue';
import PartsArrayRemove from '@common/PartsArrayRemove.vue';
import { FunkOmikuji } from '@composables/FunkOmikuji';
import { FunkEmits } from '@composables/FunkEmits';

const props = defineProps<{
 currentItem: OmikujiType;
 modelValue: 'places' | 'post' | 'threshold' | 'status' | 'scripts';
}>();

const emit = defineEmits<{
 (e: 'update:modelValue', value: 'places' | 'post' | 'threshold' | 'status' | 'scripts'): void;
 (e: 'update:Omiken', payload: OmikenEntry<OmikenCategory>): void;
 (e: 'open-editor', editorItem: ListEntryType<OmikenCategory>): void;
}>();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const Charas = AppEditor?.value.Charas;

// コンポーザブル:FunkEmits
const { updateOmiken, openEditor, updateOmikenEntry } = FunkEmits(emit);

const tab = ref<'post' | 'threshold' | 'status' | 'places' | 'scripts'>(props.modelValue); // タブの状態管理

const {
 // Post type utilities
 getTypeColor,
 getTypeLabel,
 onecommeTypeItems,
 isCharacterPost,
 getPostColor,

 // Character utilities
 botKeyItems,
 getIconKeyItems,
 getCharaImage
} = FunkOmikuji();

// マニアックな設定を表示するか
const showAdvanced = ref(props.currentItem.post.some(isAdvancedData));

function isAdvancedData(post: OneCommePostType) {
 return post.isSilent || post.generatorParam;
}

// CharaParty
const charaParty = (botKey?: string) => {
 if (!botKey || !Charas?.[botKey]?.party) return [];
 return Charas[botKey].party;
};

// postに追加
const addPost = (position = 'bottom') => {
 const botKey = Charas ? Object.keys(Charas)[0] : 'mamono';
 const newPost: OneCommePostType = {
  type: 'onecomme',
  botKey: botKey,
  iconKey: 'Default',
  delaySeconds: 0,
  content: '<<user>>の新しいメッセージ',
  party: ''
 };
 props.currentItem.post.push(newPost);

 updateOmikenEntry('omikujis', props.currentItem);
};
</script>
