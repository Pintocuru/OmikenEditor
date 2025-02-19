<!-- src/components/ListRules/ListRules.vue -->
<template>
 <div v-if="items" v-for="rule in items" :key="rule.id" class="mb-2">
  <v-card elevation="0" class="w-100" @click="togglePanel(rule.id)" :class="{ 'cursor-pointer': true }">
   <v-toolbar :color="rule.color">
    <v-toolbar-title class="ml-2">
     <!-- TODO DialogTypes は廃止、代わりにダイアログでorderを編集するものを新規作成 -->
     <DialogTypes :rule="rule" :Omiken="items.Omiken" />
     {{ rule.name }}
     <PartsNameEditor type="rules" :item="rule" />

     <v-chip label class="ml-4"> {{ rule.enables.length }} items </v-chip>

     <PartsToolbarColor
      v-model="rule.color"
      @update:model-value="(color) => updateRuleColor(rule, color, props.categoryActive.sub)"
     />

     <v-icon class="ml-2">
      {{ uiState.expandedPanels.includes(rule.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
     </v-icon>
    </v-toolbar-title>
    <template #append>
     <span class="mr-2">ID : {{ rule.id }}</span>
     <PartsArrayAction editMode="rule" :entry="rule" />
    </template>
   </v-toolbar>
   <v-card-text class="list-group d-flex flex-wrap">
    {{ rule.description }}
   </v-card-text>
  </v-card>

  <v-expand-transition>
   <div v-show="uiState.expandedPanels.includes(rule.id)">
    <ListRulesTabs :rule="rule" :category="categoryActive.sub" @showWeightEdit="isWeightEdit" />

    <v-card-text>
     <v-row>
      <ListRulesOmikujiView :rule="rule" :showWeightEdit="uiState.showWeightEditor" />
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
import { ref } from 'vue';
import { CategoryActive, RulesTypeMap, RuleCategory } from '@type';
import PartsArrayAction from '@common/PartsArrayAction.vue';
import DialogTypes from '@components/DialogTypes.vue';
import ListRulesOmikujiView from '@components/ListRules/ListRulesOmikujis.vue';
import ListRulesTabs from '@components/ListRules/ListRulesTabs.vue';
import PartsNameEditor from '@common/PartsNameEditor.vue';
import PartsToolbarColor from '@common/PartsToolbarColor.vue';

import { useOmikenStore } from '@store/UseOmikenStore';

const props = defineProps<{
 categoryActive: CategoryActive<'rules'>;
 items: Record<string, RulesType>;
}>();

// pinia:omikenStore
const omikenStore = useOmikenStore();
const { updateOmikenEntry } = FunkEmits();

const uiState = ref({
 expandedPanels: [] as string[],
 showWeightEditor: false
});

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
const updateRuleColor = <T extends RuleCategory>(rule: RulesTypeMap<T>, color: string, category: T) => {
 const updated: RulesTypeMap<T> = { ...rule, color };
 updateOmikenEntry<T>(category, updated);
};

// アイテムの追加
const addItem = () => {
 omikenStore.updateOmiken({ type: props.categoryActive.sub, addKeys: [{ name: '新しいルール' }] });
};
</script>
