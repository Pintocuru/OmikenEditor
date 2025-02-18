// composables/FunkOmiken.ts
import { ref } from 'vue';
import { OmikenEntry, AppEditorType, PresetOmikenType, OmikenSchema, OmikenType, OmikenCategory } from '@type';
import { AppEditorFetch } from '@composables/FunkJSON';
import { FunkOmikenUpdater } from './FunkOmikenUpdater';
import { MySwal } from '@common/partsMySwal';
import { defineStore } from 'pinia';

// 他のコンポーザブルを初期化
const { handleUpdate, handleAddItems, handleDeleteItems, handlePresetUpdate } = FunkOmikenUpdater();

export const useOmikenStore = defineStore('omiken', () => {
 const AppEditor = ref<AppEditorType>({
  Omiken: OmikenSchema.parse({}) as OmikenType,
  Presets: {},
  Charas: {},
  Scripts: {}
 });

 const isAppEditorLoading = ref(true);

 // Omikenの更新
 const updateOmiken = (payload: OmikenEntry<OmikenCategory>): void => {
  if (!payload) return;
  const { type, updates, addKeys, delKeys } = payload;

  const newState: OmikenType = JSON.parse(JSON.stringify(AppEditor.value.Omiken));

  updates?.forEach((update) => handleUpdate(newState, type, update));
  addKeys?.forEach((addKey) => handleAddItems(newState, type, addKey));
  delKeys?.forEach((delKey) => handleDeleteItems(newState, type, delKey));

  AppEditor.value.Omiken = newState;
  console.info('おみくじデータが更新されたよ', newState);
 };

 // Presetからの更新
 const updateOmikenPresetData = (preset: PresetOmikenType) => {
  const newState = handlePresetUpdate(AppEditor.value.Omiken, preset);
  AppEditor.value.Omiken = newState;
 };

 // 初期化処理
 const AppEditorInitialize = async () => {
  try {
   AppEditor.value = await AppEditorFetch();
   isAppEditorLoading.value = false;
   // データ読み込み成功の通知
   await MySwal.fire({
    title: '読み込み完了',
    text: 'データの読み込みが完了しました。',
    icon: 'success',
    confirmButtonText: 'OK'
   });
  } catch (error) {
   console.error('Initialization failed', error);
   const errorMessage = error instanceof Error ? error.message : 'データの読み込みに失敗しました。';

   await MySwal.fire({
    title: '読み込み失敗',
    text: errorMessage,
    icon: 'error',
    confirmButtonText: 'OK'
   });
  }
 };

 return {
  AppEditor,
  isAppEditorLoading,
  updateOmiken,
  updateOmikenPresetData,
  AppEditorInitialize
 };
});
