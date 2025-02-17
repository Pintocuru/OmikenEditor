<!-- src/components/ListRules/ListRules.vue -->
<template>
 <div v-if="items" v-for="rule in items" :key="rule.id" class="mb-2">
  <v-card elevation="0" class="w-100" @click="togglePanel(rule.id)" :class="{ 'cursor-pointer': true }">
   <v-toolbar :color="getColor(rule)">
    <v-toolbar-title class="ml-2">
     <!-- TODO DialogTypes は廃止、代わりにダイアログでorderを編集するものを新規作成 -->
     <DialogTypes :rule="rule" :Omiken="items.Omiken" @update:Omiken="updateOmiken" />
     {{ rule.name }}
     <PartsNameEditor type="rules" :currentItem="rule" @update:Omiken="updateOmiken" />

     <v-chip label class="ml-4"> {{ getEnablesLength(rule) }} items </v-chip>

     <PartsToolbarColor
      v-if="isRuleType(rule)"
      v-model="rule.color"
      @update:model-value="(color) => updateRuleColor(rule, color)"
     />

     <v-icon class="ml-2">
      {{ uiState.expandedPanels.includes(rule.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
     </v-icon>
    </v-toolbar-title>
    <template #append>
     <span class="mr-2">ID : {{ rule.id }}</span>
     <PartsArrayAction editMode="rule" :entry="rule" @update:Omiken="updateOmiken" />
    </template>
   </v-toolbar>
   <v-card-text class="list-group d-flex flex-wrap">
    {{ rule.description }}
   </v-card-text>
  </v-card>

  <v-expand-transition>
   <div v-show="uiState.expandedPanels.includes(rule.id)">
    <ListRulesTabs v-if="isRuleType(rule)" :rule="rule" @showWeightEdit="isWeightEdit" @update:Omiken="updateOmiken" />

    <v-card-text>
     <v-row>
      <ListRulesOmikujiView
       v-if="isRuleType(rule)"
       :rule="rule"
       :omikujis="items.Omiken.omikujis"
       :showWeightEdit="uiState.showWeightEditor"
       @open-editor="openEditor"
       @update:Omiken="updateOmiken"
      />
     </v-row>
    </v-card-text>
   </div>
  </v-expand-transition>
 </div>
 <v-sheet>
  <v-btn block @click="addItem" color="primary" variant="flat" class="mt-6">
   <v-icon left>mdi-plus</v-icon> ルールの追加
  </v-btn>
 </v-sheet>
</template>

<script setup lang="ts">
import { computed, ComputedRef, ref } from 'vue';
import {
 OmikenEntry,
 ListCategory,
 ListEntry,
 CategoryActive,
 AppEditorType,
 OmikenTypeMap,
 OmikenRulesType,
 CommentRulesType,
 TimerRulesType,
 MetaRulesType
} from '@type';
import PartsArrayAction from '@/components/common/PartsArrayAction.vue';
import DialogTypes from '@/components/DialogTypes.vue';
import ListRulesOmikujiView from '@/components/ListRules/ListRulesOmikujis.vue';
import ListRulesTabs from '@/components/ListRules/ListRulesTabs.vue';
import PartsNameEditor from '@/components/common/PartsNameEditor.vue';
import PartsToolbarColor from '@/components/common/PartsToolbarColor.vue';
import { FunkEmits } from '@/composables/FunkEmits';

const props = defineProps<{
 items: Record<string, OmikenRulesType>;
 categoryActive: CategoryActive;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

const { updateOmiken, openEditor, updateOmikenEntry } = FunkEmits(emit);

const uiState = ref({
 expandedPanels: [] as string[],
 showWeightEditor: false
});

// 型ガード関数
function isRuleType(item: any): item is OmikenRulesType {
 return item && typeof item === 'object' && 'ruleType' in item && ['comment', 'timer', 'meta'].includes(item.ruleType);
}

// カラーの取得
const getColor = (rule: any): string => {
 return isRuleType(rule) ? rule.color : '#66FFFF';
};

// enablesの長さを取得
const getEnablesLength = (rule: any): number => {
 return isRuleType(rule) ? rule.enables.length : 0;
};

// パネルの開閉
const togglePanel = (ruleId: string) => {
 const { expandedPanels } = uiState.value;
 const index = expandedPanels.indexOf(ruleId);
 if (index >= 0) {
  expandedPanels.splice(index, 1);
 } else {
  expandedPanels.push(ruleId);
 }
};

// ウェイト編集の表示制御
const isWeightEdit = (showWeightEditor: boolean) => {
 uiState.value.showWeightEditor = showWeightEditor;
};

// ルールの色を更新
const updateRuleColor = (rule: OmikenRulesType, color: string) => {
 if (isRuleType(rule)) {
  updateOmikenEntry(props.categoryActive.main as ListCategory, { ...rule, color });
 }
};

// アイテムの追加
const addItem = () => {
 emit('update:Omiken', {
  type: props.categoryActive.main as ListCategory,
  addKeys: { name: '新しいルール' }
 });
};
</script>
