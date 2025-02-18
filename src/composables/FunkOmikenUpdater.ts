// composables/FunkOmikenUpdater.ts
import { OmikenType, OmikenCategory, OmikenSchema, PresetOmikenType, OmikenTypeMap } from '@type';
import { OmikenEntryValidate } from '@composables/FunkValidate';

export function FunkOmikenUpdater() {
 // ユーティリティ関数：タイムスタンプ付きの新しいIDを生成
 const generateNewId = (id: string): string => `${id}_${new Date().getTime()}`;

 // ユーティリティ関数：警告メッセージの表示
 const warnIdConflict = (oldId: string, newId: string): void => {
  console.warn(`ID '${oldId}' は既に存在します。新しいID '${newId}' を生成しました。`);
 };

 // ID重複チェックと解決
 const resolveIdConflict = <T extends OmikenCategory>(state: OmikenType[T], item: OmikenTypeMap<T>) => {
  const { id } = item;
  const existingKeys = Object.keys(state);
  const originalId = existingKeys.find((key) => state[key].id === id);

  if (!state[id] || originalId === id) {
   return { resolvedId: id, originalId: undefined, hasConflict: false };
  }

  const resolvedId = generateNewId(id);
  warnIdConflict(id, resolvedId);
  return { resolvedId, originalId, hasConflict: true };
 };

 // 項目の更新処理
 const handleUpdate = <T extends OmikenCategory>(state: OmikenType, type: T, update: OmikenTypeMap<T>): void => {
  const { resolvedId, originalId } = resolveIdConflict(state[type], update);
  const updatedItem = { ...update, id: resolvedId };
  const typedState = state[type] as Record<string, OmikenTypeMap<T>>;

  if (originalId && originalId !== resolvedId) {
   // 既存のデータを新しいIDで更新し、古いデータを削除
   typedState[resolvedId] = updatedItem;
   delete typedState[originalId];
  } else {
   // 通常の更新
   typedState[resolvedId] = updatedItem;
  }
 };

 // プリセット更新のメイン処理
 const handlePresetUpdate = (state: OmikenType, { item, isOverwrite = false }: PresetOmikenType): OmikenType => {
  const preset = OmikenSchema.parse(item) as OmikenType;
  return isOverwrite
   ? // 上書きモード
     preset
   : // 追加モード
     Object.entries(state).reduce(
      (acc, [category, value]) => ({
       ...acc,
       [category]: processItemsWithIdCheck(value, preset[category as OmikenCategory])
      }),
      {} as OmikenType
     );
 };

 // プリセットデータの処理
 const processItemsWithIdCheck = <K extends OmikenCategory>(
  current: OmikenType[K],
  preset: OmikenType[K]
 ): OmikenType[K] => {
  const result: Record<string, OmikenTypeMap<K>> = { ...current };
  const existingIds = new Set(Object.values(current).map((item) => item.id));

  Object.entries(preset).forEach(([key, value]) => {
   if (existingIds.has(value.id)) {
    const newId = generateNewId(value.id);
    result[key] = { ...value, id: newId };
    warnIdConflict(value.id, newId);
   } else if (!(key in current)) {
    result[key] = value;
    existingIds.add(value.id);
   }
  });

  return result as OmikenType[K];
 };

 return {
  handleUpdate,
  // 追加処理
  handleAddItems: <T extends OmikenCategory>(state: OmikenType, type: T, addKey: Partial<OmikenTypeMap<T>>) => {
   const newItem = OmikenEntryValidate(type, addKey);
   (state[type] as Record<string, OmikenTypeMap<T>>)[newItem.id] = newItem;
  },
  // 削除処理
  handleDeleteItems: <T extends OmikenCategory>(state: OmikenType, type: T, delKey: string) => {
   delete state[type][delKey];
  },
  handlePresetUpdate
 };
}
