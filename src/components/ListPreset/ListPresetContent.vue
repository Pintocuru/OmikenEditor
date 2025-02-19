<!-- src/components/ListPreset/ListPresetContent.vue -->
<template>
 <!-- タグフィルター部分 -->
 <div class="mb-4">
  <v-chip-group v-model="selectTags" column multiple>
   <v-chip
    v-for="tag in uniqueTags"
    :key="tag"
    :value="tag"
    filter
    variant="outlined"
    :color="selectTags.includes(tag) ? 'primary' : undefined"
   >
    {{ tag }}
   </v-chip>
  </v-chip-group>
 </div>

 <!-- プリセットリスト -->
 <v-row>
  <v-col v-for="(preset, key) in filterPresets" :key="key" cols="12" sm="6" md="4">
   <v-card class="preset-card h-100" elevation="3">
    <v-img
     :src="getPresetsImage(preset.banner)"
     height="200"
     cover
     class="align-end"
     gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
    >
     <v-card-title class="font-weight-bold">
      {{ preset.name }}
     </v-card-title>
     <v-card-subtitle class="mb-2" v-if="type === 'Charas'"> 投稿名: {{ preset.displayName }} </v-card-subtitle>
    </v-img>

    <!-- プリセット情報 -->
    <v-card-text>
     <div class="d-flex align-center mb-2">
      <v-chip color="primary" size="small" class="mr-2">{{ typeName }}</v-chip>
      <span v-if="preset.author" class="d-flex align-center">
       <v-icon size="small" class="mr-2">mdi-account</v-icon>
       <span class="text-caption">{{ preset.author }}</span>
      </span>
      <v-btn v-if="preset.url" :href="preset.url" target="_blank" rel="noopener noreferrer" variant="text" class="ml-2">
       <v-icon size="small">mdi-link</v-icon>
      </v-btn>
     </div>

     <p class="preset-description mb-3">{{ preset.description }}</p>

     <!-- タグ -->
     <div class="d-flex flex-wrap mt-2">
      <v-chip
       v-for="(tag, index) in preset.tags"
       :key="index"
       color="secondary"
       size="small"
       variant="outlined"
       class="mr-1 mb-1"
      >
       {{ tag }}
      </v-chip>
     </div>

     <!-- 適用ボタン -->
     <v-card-actions v-if="type === 'Presets'">
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="outlined" @click="presetSelect(preset as PresetOmikenType)"> 適用する </v-btn>
     </v-card-actions>
    </v-card-text>
   </v-card>
  </v-col>
 </v-row>
</template>

<script setup lang="ts">
import { AppEditorType, CategoryActive, OmikenCategory, ListEntryType, OmikenEntry, PresetOmikenType } from '@type';

import { FunkPresets } from '@composables/FunkPresets';
import { computed, ref } from 'vue';
import { MySwal } from '@common/partsMySwal';

// props/emits
type PresetProps<T extends keyof AppEditorType> = {
 type: T;
 content: AppEditorType[T];
};
const props = defineProps<PresetProps<'Presets' | 'Charas' | 'Scripts'>>();

const emit = defineEmits<{
 (e: 'open-editor', editorItem: ListEntryType<OmikenCategory>): void;
 (e: 'update:Omiken', payload: OmikenEntry<OmikenCategory>): void;
 (e: 'update:OmikenPreset', preset: PresetOmikenType): void;
 (e: 'update:category', value: CategoryActive): void;
}>();

// コンポーザブル
const { openList } = FunkEmits(emit);
const {} = FunkPresets();

// ステート
const selectTags = ref<string[]>([]);

// タイプの種類
const typeName = computed(() => {
 const map = {
  Presets: 'おみくじデータ',
  Charas: 'キャラクター',
  Scripts: '外部スクリプト'
 } as const;
 return map[props.type] || '';
});

// 算出プロパティ
const uniqueTags = computed(() => {
 const tags = Object.values(props.content || {}).reduce((acc: string[], content) => {
  if (content?.tags) acc.push(...content.tags);
  return acc;
 }, []);
 return [...new Set(tags)];
});

// タグから絞り込んだリスト
const filterPresets = computed(() => {
 if (!props.content) return {};

 // フィルタリング処理
 const filtered = !selectTags.value.length
  ? props.content
  : Object.entries(props.content).reduce(
     (acc, [key, preset]) => {
      if (preset?.tags && selectTags.value.some((tag) => preset.tags.includes(tag))) {
       acc[key] = preset;
      }
      return acc;
     },
     {} as AppEditorType[typeof props.type]
    );

 // 並べ替え処理
 return Object.fromEntries(
  Object.entries(filtered).sort(([, a], [, b]) => {
   const orderA = a.order !== undefined ? a.order : Infinity;
   const orderB = b.order !== undefined ? b.order : Infinity;
   return orderA - orderB;
  })
 );
});

// 画像パス
const getPresetsImage = (banner?: string): string => {
 if (!banner) return '';
 const map = {
  Presets: 'Presets',
  Charas: 'Charas',
  Scripts: 'Scripts'
 };

 const home = process.env.NODE_ENV === 'development' ? './' : './';
 const basePath = map[props.type] || '';
 return `${home}${basePath}/${banner}`;
};

const presetSelect = async (preset: AppEditorType['Presets'][string]) => {
 if (props.type !== 'Presets') return;
 try {
  const result = await MySwal.fire({
   title: preset.name,
   text: '適用方法を選択してください',
   html: `
        <div class="text-sm text-gray-600">
          上書き：既存のデータを削除して新しいデータを設定します<br>
          追加：既存のデータに新しいデータを追加します
        </div>
      `,
   imageUrl: getPresetsImage(preset.banner),
   imageWidth: 400,
   imageAlt: `${preset.name} banner`,
   showCancelButton: true,
   confirmButtonText: '追加',
   cancelButtonText: 'キャンセル',
   showDenyButton: true,
   denyButtonText: '上書き',
   confirmButtonColor: '#F44336', // 第1ボタン:Material Red 500
   denyButtonColor: '#2196F3', // 第2ボタン:Material Blue 500
   cancelButtonColor: '#9E9E9E' // キャンセル:Material Gray 500
  });

  // 初回選択後に再確認のポップアップを表示
  if (result.isConfirmed || result.isDenied) {
   const isOverwrite = result.isDenied;

   // 再確認のポップアップを表示
   const finalConfirmation = await MySwal.fire({
    title: `【${isOverwrite ? '上書き' : '追加'}】の確認`,
    text: `本当に${isOverwrite ? '上書き' : '追加'}で適用しますか？ 一度適用すると元には戻せません。`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `${isOverwrite ? '上書き' : '追加'}する`,
    cancelButtonText: 'キャンセル',
    confirmButtonColor: isOverwrite ? '#2196F3' : '#F44336'
   });

   // 再確認後にemitを実行
   if (finalConfirmation.isConfirmed) {
    emit('update:OmikenPreset', { ...preset, isOverwrite });

    // ListRules を開く
    openList({ main: 'rules' });

    await MySwal.fire({
     icon: 'success',
     title: '適用完了',
     text: `${preset.name}を${isOverwrite ? '上書き' : '追加'}で適用しました`,
     timer: 2000,
     showConfirmButton: false
    });
   }
  }
 } catch (error) {
  await MySwal.fire({
   icon: 'error',
   title: 'エラー',
   text: '設定の適用に失敗しました'
  });
 }
};
</script>
