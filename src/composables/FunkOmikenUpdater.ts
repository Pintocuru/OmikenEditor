// composables/FunkOmikenUpdater.ts
import { OmikenType, ListCategory, TypesType, OmikenEntry, AddKeysCategory } from '@type';
import { OmikenEntryValidate } from '@/composables/funkValidate';

export function FunkOmikenUpdater() {
 // 配列化のユーティリティ関数
 const toArray = <T>(value: T | T[] | undefined): T[] => (Array.isArray(value) ? value : value ? [value] : []);

 // 更新処理
 const handleUpdate = <T extends Exclude<ListCategory, 'types'>>(
  state: OmikenType,
  type: T,
  update: Record<string, any>
 ) => Object.assign(state[type], update);

 // 追加処理
 const handleAddItems = <T extends Exclude<ListCategory, 'types'>>(
  state: OmikenType,
  type: T,
  addKeys: OmikenEntry<T>['addKeys']
 ) => {
  toArray(addKeys).forEach((item: AddKeysCategory[T]) => {
   const optionId = 'optionId' in item ? item.optionId : undefined;
   const newItem = OmikenEntryValidate(type, item);

   // 基本データの追加
   state[type][newItem.id] = newItem;

   // type別の追加処理
   if (type === 'rules') {
    addRuleToTypes(state, optionId, newItem.id);
   } else if (type === 'omikujis' && optionId) {
    addOmikujiToRule(state, optionId, newItem.id);
   }
  });
 };

 // 削除処理
 const handleDeleteItems = <T extends Exclude<ListCategory, 'types'>>(
  state: OmikenType,
  type: T,
  delKeys: string | string[]
 ) => {
  toArray(delKeys).forEach((key) => {
   delete state[type][key];

   if (type === 'rules') {
    removeFromTypes(state, key);
   } else if (type === 'omikujis') {
    removeFromRules(state, key);
   }
  });
 };

 // rulesをtypesに追加
const addRuleToTypes = (state: OmikenType, optionId: string | undefined, newItemId: string) => {
 if (!optionId || !Object.values(state.types).some((ids) => ids.includes(optionId) && ids.push(newItemId))) {
  state.types.unused.push(newItemId);
 }
};

 // omikujiをruleに追加
 const addOmikujiToRule = (state: OmikenType, optionId: string, newItemId: string) => {
  const rule = state.rules[optionId];
  if (!rule) {
   console.warn(`Cannot add omikuji "${newItemId}" to missing rule "${optionId}".`);
   return;
  }

  rule.enableIds = [...rule.enableIds, newItemId];
 };

 // typesから要素を削除
 const removeFromTypes = (state: OmikenType, key: string) => {
  Object.values(state.types).forEach((typeArray) => {
   const index = typeArray.indexOf(key);
   if (index !== -1) typeArray.splice(index, 1);
  });
 };

 // rulesから要素を削除
 const removeFromRules = (state: OmikenType, key: string) => {
  Object.values(state.rules).forEach((rule) => {
   const index = rule.enableIds.indexOf(key);
   if (index !== -1) rule.enableIds.splice(index, 1);
  });
 };

 // 順序の再編成
 const handleReTypes = (state: OmikenType, reTypes: Record<TypesType, string[]>) => {
  Object.assign(state.types, reTypes);
 };

 return {
  handleUpdate,
  handleAddItems,
  handleDeleteItems,
  handleReTypes
 };
}
