// composables/FunkOmikenUpdater.ts
import { OmikenTypeMap, ListCategory, OmikenTypeMap, OmikenSchema, PresetOmikenType } from '@type';
import { OmikenEntryValidate } from '@/composables/FunkValidate';

export function FunkOmikenUpdater() {
 // 更新処理
 const handleUpdate = <T extends ListCategory>(state: OmikenTypeMap, type: T, update: OmikenTypeMap[T]) => {
  const { resolvedId, originalId } = resolveIdConflict(state[type], update);
  const updatedItem = { ...update, id: resolvedId };

  if (originalId && originalId !== resolvedId) {
   // 既存のデータを新しいIDで更新し、古いデータを削除
   state[type][resolvedId] = updatedItem;
   delete state[type][originalId];
  } else {
   // 通常の更新
   state[type][resolvedId] = updatedItem;
  }
 };

 // 追加処理
 const handleAddItems = <T extends ListCategory>(state: OmikenTypeMap, type: T, addKey: Partial<OmikenTypeMap[T]>) => {
  const newItem = OmikenEntryValidate(type, addKey);
  state[type][newItem.id] = newItem;
 };

 // 削除処理
 const handleDeleteItems = <T extends ListCategory>(state: OmikenTypeMap, type: T, delKey: string) => {
  delete state[type][delKey];
 };

 // プリセット処理
 const handlePresetUpdate = (state: OmikenTypeMap, presetRaw: PresetOmikenType): OmikenTypeMap => {
  const { item, isOverwrite = false } = presetRaw;
  const preset = OmikenSchema.parse(item) as OmikenTypeMap;
  const updatedState = { ...state };

  (Object.keys(state) as (keyof OmikenTypeMap)[]).forEach((category) => {
   if (isOverwrite) {
    // 上書きモードの場合は、プリセットのデータをそのまま使用
    // @ts-ignore
    updatedState[category] = preset[category];
   } else {
    // 追加モードの場合は、既存のデータを保持しながら新しいアイテムを追加
    // @ts-ignore
    updatedState[category] = processItemsWithIdCheck(state[category], preset[category]);
   }
  });

  return updatedState;
 };

 const processItemsWithIdCheck = <K extends keyof OmikenTypeMap>(
  current: OmikenTypeMap[K],
  preset: OmikenTypeMap[K]
 ): OmikenTypeMap[K] => {
  const result = { ...current };
  const existingIds = new Set(Object.values(current).map((item) => item.id));

  // プリセットの各アイテムに対して処理
  for (const [key, value] of Object.entries(preset)) {
   if (existingIds.has(value.id)) {
    // IDが重複する場合は、タイムスタンプを付与した新しいIDを生成
    const timestamp = new Date().getTime();
    const newId = `${value.id}_${timestamp}`;
    result[key] = { ...value, id: newId };
    console.warn(`ID '${value.id}' は既に存在します。新しいID '${newId}' を生成しました。`);
   } else if (!(key in current)) {
    // 重複がなく、かつ現在のデータに存在しないキーの場合は追加
    result[key] = value;
    existingIds.add(value.id);
   }
  }

  return result;
 };

 // ID重複チェックと解決のための関数
 const resolveIdConflict = <T extends ListCategory>(
  state: OmikenTypeMap[T],
  item: OmikenTypeMap[T]
 ): {
  resolvedId: string;
  originalId: string | undefined;
  hasConflict: boolean;
 } => {
  const { id } = item;
  const existingKeys = Object.keys(state);
  const originalId = existingKeys.find((key) => state[key].id === id);

  // IDの重複がない場合
  if (!state[id] || originalId === id) {
   return { resolvedId: id, originalId: undefined, hasConflict: false };
  }

  // IDが重複している場合、タイムスタンプを付与した新しいIDを生成
  const timestamp = new Date().getTime();
  const resolvedId = `${id}_${timestamp}`;

  console.warn(`ID '${id}' は既に存在します。新しいID '${resolvedId}' を生成しました。`);
  return { resolvedId, originalId, hasConflict: true };
 };

 return {
  handleUpdate,
  handleAddItems,
  handleDeleteItems,
  handlePresetUpdate
 };
}
