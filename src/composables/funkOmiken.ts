// composables/FunkOmiken.ts
import { provide, ref } from 'vue';
import { OmikenType, OmikenEntry, AppEditorType, ListCategory, PresetOmikenType, OmikenSchema } from '@type';
import { AppEditorFetch } from '@/composables/funkJSON';
import { FunkOmikenUpdater } from './FunkOmikenUpdater';
import { FunkOmikenPreset } from './FunkOmikenPreset';
import { MySwal } from '@/components/common/partsMySwal';

const defaultAppEditor: AppEditorType = {
 Presets: {},
 Charas: {},
 Scripts: {},
 Omiken: OmikenSchema.parse({}) as OmikenType
};

export function FunkOmiken() {
 const AppEditor = ref<AppEditorType>(defaultAppEditor);
 const isAppEditorLoading = ref(true);

 // 他のコンポーザブルを初期化
 const { handleUpdate, handleAddItems, handleDeleteItems, handleReTypes } = FunkOmikenUpdater();
 const { handlePresetUpdate } = FunkOmikenPreset();

 // provide
 provide('AppEditorKey', AppEditor);

 // 初期化処理の実行
 async function AppEditorInitialize() {
  try {
   AppEditor.value = await AppEditorFetch();
   isAppEditorLoading.value = false; // ローディング完了
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
 }

 // Omikenの更新(rules/omikujis/places)
 function updateOmiken(payload: OmikenEntry<ListCategory>) {
  if (!payload || !AppEditor.value) return;
  const { type, update, addKeys, delKeys, reTypes } = payload;

  const newState: OmikenType = JSON.parse(JSON.stringify(AppEditor.value.Omiken));

  if (type !== 'types') {
   if (update) handleUpdate(newState, type, update);
   if (addKeys) handleAddItems(newState, type, addKeys);
   if (delKeys) handleDeleteItems(newState, type, delKeys);
  } else if (reTypes) {
   handleReTypes(newState, reTypes);
  }
  AppEditor.value.Omiken = newState;
  console.info('おみくじデータが更新されたよ', AppEditor.value.Omiken);
 }

 // Presetからの更新
 const updateOmikenPresetData = (preset: PresetOmikenType) => {
  if (!AppEditor.value) return;
  const newState = handlePresetUpdate(AppEditor.value.Omiken, preset);
  AppEditor.value.Omiken = newState;
 };

 return {
  AppEditor,
  AppEditorInitialize,
  isAppEditorLoading,
  updateOmiken,
  updateOmikenPresetData
 };
}
