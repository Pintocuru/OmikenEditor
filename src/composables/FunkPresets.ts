// src/composables/FunkPresets.ts
import { computed, ref } from 'vue';
import { AppEditorType, PresetCategory, PresetType } from '@type';
import { useOmikenStore } from '@/store/UseOmikenStore';
import { UseUIStore } from '@/store/UseUIStore';
import { MySwal } from '@/common/partsMySwal';

// pinia
const omikenStore = useOmikenStore();
const UIStore = UseUIStore();

export const FunkPresets = (type: PresetCategory, items: PresetType[PresetCategory]) => {
 // タグ選択用ref
 const selectTags = ref<string[]>([]);

 // presetsにあるtagを収集して表示する
 const uniqueTags = computed(() => {
  const tags = Object.values(items || {}).reduce((acc: string[], content) => {
   if (content?.tags) acc.push(...content.tags);
   return acc;
  }, []);
  return [...new Set(tags)];
 });

 // タグによるフィルタリング
 const filterPresets = computed(() => {
  if (!items) return {};

  const filtered = !selectTags.value.length
   ? items
   : Object.entries(items).reduce(
      (acc, [key, preset]) => {
       if (preset?.tags && selectTags.value.some((tag) => preset.tags.includes(tag))) {
        acc[key] = preset;
       }
       return acc;
      },
      {} as PresetType[PresetCategory]
     );

  return Object.fromEntries(
   Object.entries(filtered).sort(([, a], [, b]) => {
    const orderA = a.order !== undefined ? a.order : Infinity;
    const orderB = b.order !== undefined ? b.order : Infinity;
    return orderA - orderB;
   })
  );
 });

 // プリセットの適用
 const applyPreset = async (preset: AppEditorType['Presets'][string]) => {
  try {
   const { isConfirmed, isDenied } = await showInitialDialog(preset, getPresetsImage);

   if (isConfirmed || isDenied) {
    const isOverwrite = isDenied;
    const confirmed = await showConfirmationDialog(isOverwrite);

    if (confirmed) {
     await handlePresetApplication(preset, isOverwrite);
    }
   }
  } catch (error) {
   await showErrorDialog();
  }
 };

 // バナー画像を返す
 const getPresetsImage = (banner?: string): string => (banner ? `./${type}/${banner}` : '');

 return {
  selectTags,
  uniqueTags,
  filterPresets,
  applyPreset,
  getPresetsImage
 };
};

// ---

// ダイアログ関連の補助関数
const showInitialDialog = async (
 preset: AppEditorType['Presets'][string],
 getPresetsImage: (banner?: string) => string
) => {
 return await MySwal.fire({
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
};

const showConfirmationDialog = async (isOverwrite: boolean) => {
 const finalConfirmation = await MySwal.fire({
  title: `【${isOverwrite ? '上書き' : '追加'}】の確認`,
  text: `本当に${isOverwrite ? '上書き' : '追加'}で適用しますか？ 一度適用すると元には戻せません。`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: `${isOverwrite ? '上書き' : '追加'}する`,
  cancelButtonText: 'キャンセル',
  confirmButtonColor: isOverwrite ? '#2196F3' : '#F44336'
 });

 return finalConfirmation.isConfirmed;
};

const handlePresetApplication = async (preset: AppEditorType['Presets'][string], isOverwrite: boolean) => {
 // プリセットの更新
 omikenStore.updateOmikenPresetData({ ...preset, isOverwrite });

 // ListRules を開く
 UIStore.updateNavi({ main: 'rules', sub: 'comments' });

 // 成功メッセージの表示
 await MySwal.fire({
  icon: 'success',
  title: '適用完了',
  text: `${preset.name}を${isOverwrite ? '上書き' : '追加'}で適用しました`,
  timer: 2000,
  showConfirmButton: false
 });
};

const showErrorDialog = async () => {
 await MySwal.fire({
  icon: 'error',
  title: 'エラー',
  text: '設定の適用に失敗しました'
 });
};
