<!-- src/components/common/PartsArrayAction.vue -->
<template>
 <v-menu v-model="menu" :close-on-content-click="false">
  <template v-slot:activator="{ props }">
   <v-btn v-bind="props" size="small" icon>
    <v-icon>mdi-dots-vertical</v-icon>
   </v-btn>
  </template>
  <v-list>
   <v-list-item v-for="item in currentMenuItems" :key="item.action" @click="handleMenuAction(item.action)">
    <v-icon :class="item.iconClass">{{ item.icon }}</v-icon>
    <span :class="`${item.iconClass} pl-6`">{{ item.label }}</span>
   </v-list-item>
  </v-list>
 </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue';
import { OmikenEntry, OmikujiType, AppEditorType, PlaceType, OmikenCategory, OmikenRulesType } from '@type';

import { MySwal } from '@common/partsMySwal';

const props = defineProps<{
 editMode: 'rule' | 'omikujiRemove' | 'omikujiAdd' | 'omikujiAddDialog' | 'place' | 'placeDialog';
 entry: OmikenRulesType | OmikujiType | PlaceType;
 optionRules?: OmikenRulesType;
}>();

const emit = defineEmits<{
 (e: 'edit'): void;
 (e: 'update:Omiken', payload: OmikenEntry<OmikenCategory>): void;
}>();

const menu = ref(false);
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');

// コンポーザブル:FunkEmits
const { updateOmikenEntry } = FunkEmits(emit);

interface MenuItem {
 action: 'edit' | 'duplicate' | 'remove' | 'add' | 'delete';
 icon: string;
 iconClass: string;
 label: string;
}

interface MenuConfig {
 [key: string]: MenuItem[]; // 各カテゴリのキーに対して、MenuItemの配列を持つ
}

// 共通アクションを定義
const createMenuItem = (
 action: MenuItem['action'], // actionの型を MenuItem['action'] に変更
 icon: string,
 iconClass: string,
 label: string
): MenuItem => ({ action, icon, iconClass, label });

const COMMON_ACTIONS: Record<string, MenuItem> = {
 edit: createMenuItem('edit', 'mdi-pencil', 'text-primary', '編集'),
 duplicate: createMenuItem('duplicate', 'mdi-content-copy', 'text-info', '複製'),
 delete: createMenuItem('delete', 'mdi-delete', 'text-error', 'データの削除'),
 remove: createMenuItem('remove', 'mdi-playlist-remove', 'text-warning', 'リストから除外'),
 add: createMenuItem('add', 'mdi-playlist-plus', 'text-warning', 'リストに追加')
};

// 各カテゴリのアクションを定義
const CATEGORY_ACTIONS: Record<string, (keyof typeof COMMON_ACTIONS)[]> = {
 rule: ['duplicate', 'delete'],
 omikujiRemove: ['edit', 'duplicate', 'remove', 'delete'],
 omikujiAdd: ['edit', 'duplicate', 'add', 'delete'],
 omikujiAddDialog: ['duplicate', 'add', 'delete'],
 place: ['edit', 'duplicate', 'delete'],
 placeDialog: ['duplicate', 'delete']
};

// MENU_CONFIGS を動的に生成
const MENU_CONFIGS: MenuConfig = Object.fromEntries(
 Object.entries(CATEGORY_ACTIONS).map(([key, actions]) => [key, actions.map((action) => COMMON_ACTIONS[action])])
);

const currentMenuItems = computed(() => {
 return MENU_CONFIGS[props.editMode] || [];
});

const handleMenuAction = async (action: string) => {
 const actionHandlers = {
  edit: handleEdit,
  duplicate: handleDuplicate,
  remove: handleEnableIdsRemove,
  add: handleEnableIdsAdd,
  delete: handleDelete
 };

 if (action in actionHandlers) {
  await actionHandlers[action as keyof typeof actionHandlers]();
 }

 menu.value = false;
};

const handleEdit = () => {
 emit('edit');
};

// データの複製
const handleDuplicate = () => {
 if (!props.entry) return;
 const type = getEntryType();

 let optionId;
 if (type === 'rules') optionId = props.entry ? props.entry.id : undefined;
 if (type === 'omikujis') optionId = props.optionRules ? props.optionRules.id : undefined;

 const { id, ...rest } = JSON.parse(JSON.stringify(props.entry));
 const payload: OmikenEntry<OmikenCategory> = {
  type,
  addKeys: {
   ...rest,
   name: `${props.entry.name} (コピー)`,
   optionId
  }
 };
 emit('update:Omiken', payload);
};

// データを削除
const handleDelete = async () => {
 if (!props.entry) return;

 const result = await MySwal.fire({
  title: `${props.entry.name} を削除する`,
  text: 'この設定を削除しますか？',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'OK',
  cancelButtonText: 'キャンセル'
 });

 if (result.isConfirmed) {
  emit('update:Omiken', {
   type: getEntryType(),
   delKeys: [props.entry.id]
  });
 }
};

// omikujiをrulesのリストから除外
const handleEnableIdsRemove = () => {
 const type = getEntryType();
 if (type !== 'omikujis' || !props.optionRules || !props.entry) return;

 const updatedEntry: OmikenRulesType = {
  ...props.optionRules,
  enableIds: props.optionRules.enableIds.filter((id) => id !== props.entry.id)
 };

 updateOmikenEntry('rules', updatedEntry);
};

// omikujiをrulesのリストに追加
const handleEnableIdsAdd = async () => {
 if (!AppEditor?.value?.Omiken.rules) return;

 const rulesList = Object.entries(AppEditor.value.Omiken.rules).map(([id, rule]) => ({
  id,
  name: rule.name
 }));

 const { value: selectedRuleId } = await MySwal.fire({
  title: 'ルールを選択',
  input: 'select',
  inputOptions: Object.fromEntries(rulesList.map((rule) => [rule.id, rule.name])),
  showCancelButton: true,
  inputPlaceholder: 'ルールを選択してください',
  confirmButtonText: 'OK',
  cancelButtonText: 'キャンセル'
 });

 if (selectedRuleId) {
  const rulesEntry = AppEditor.value.Omiken.rules[selectedRuleId];
  if (!rulesEntry) return;

  // enableIds に props.entry.id が含まれていない場合のみ追加
  const updatedEnableIds = rulesEntry.enableIds.includes(props.entry.id)
   ? rulesEntry.enableIds
   : [...rulesEntry.enableIds, props.entry.id];

  updateOmikenEntry('rules', {
   ...rulesEntry,
   enableIds: updatedEnableIds
  });
 }
};

// Utility functions
function getEntryType(): OmikenCategory {
 switch (props.editMode) {
  case 'rule':
   return 'rules';
  case 'omikujiAdd':
  case 'omikujiAddDialog':
  case 'omikujiRemove':
   return 'omikujis';
  case 'place':
  case 'placeDialog':
   return 'places';
  default:
   throw new Error('Invalid editMode');
 }
}
</script>
