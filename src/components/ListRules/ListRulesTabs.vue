<!-- src/components/ListRules/ListRulesTabs.vue -->
<template>
 <v-tabs v-model="tab" align-tabs="center" stacked>
  <v-tab v-for="tabItem in tabs" :key="tabItem.value" :value="tabItem.value">
   <v-icon :icon="tabItem.icon"></v-icon>
   {{ tabItem.label }}
  </v-tab>
 </v-tabs>

 <v-tabs-window v-model="tab">
  <!-- 共通:有効リスト -->
  <v-tabs-window-item value="list">
   <v-select
    v-model="rule.enableIds"
    :items="omikujiLists"
    label="有効にするおみくじ"
    chips
    multiple
    item-title="name"
    item-value="id"
    @update:model-value="updateOmikenEntry('rules', { ...rule, enableIds: $event })"
   />
  </v-tabs-window-item>

  <!-- 共通:出現割合(内容はないよう) -->
  <v-tabs-window-item value="percent" />

  <!-- comment:Threshold -->
  <v-tabs-window-item value="threshold">
   <ThresholdMain :item="rule" mode="rules" type="comment" @update:Omiken="updateOmiken" />
  </v-tabs-window-item>

  <!-- タイマー設定のコンテンツ -->
  <v-tabs-window-item value="timer">
   <v-container>
    <v-row>
     <v-col cols="6">
      <v-text-field
       :modelValue="rule.timerConfig?.minutes"
       @update:modelValue="updateTimerConfig('minutes', $event)"
       type="number"
       label="実行間隔（分）"
       min="1"
       max="60"
      />
     </v-col>
     <v-col cols="auto">
      <v-switch
       :modelValue="rule.timerConfig?.isBaseZero"
       @update:modelValue="updateTimerConfig('isBaseZero', $event)"
       label="ゼロ分から開始"
       color="primary"
       hide-details
      />
     </v-col>
    </v-row>
   </v-container>
  </v-tabs-window-item>

  <!-- 枠情報設定のコンテンツ -->
  <v-tabs-window-item value="meta"> </v-tabs-window-item>

  <!-- 参加者設定のコンテンツ -->
  <v-tabs-window-item value="waiting"> </v-tabs-window-item>

  <!-- セット設定のコンテンツ -->
  <v-tabs-window-item value="setlist"> </v-tabs-window-item>

  <!-- リアクション設定のコンテンツ -->
  <v-tabs-window-item value="reactions"> </v-tabs-window-item>
 </v-tabs-window>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { OmikenEntry, ListCategory, ListEntry, RulesType, TypesType } from '@type';
import ThresholdMain from '@/components/DialogThreshold/DialogThreshold.vue';
import { FunkEmits } from '@/composables/FunkEmits';
import { FunkTypes } from '@/composables/FunkTypes';
import { FunkRules } from '@/composables/funkRules';

const props = defineProps<{
 rule: RulesType;
}>();
//
const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
 (e: 'showWeightEdit', showWeightEdit: boolean): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, updateOmikenEntry } = FunkEmits(emit);
const { findType } = FunkTypes();
const { omikujiLists } = FunkRules();

// タブ
const tab = ref<'threshold' | 'list' | 'percent'>('list'); // タブの状態管理
const baseTabs = [
 { value: 'list', icon: 'mdi-format-list-checks', label: '有効リスト' },
 { value: 'percent', icon: 'mdi-percent', label: '出現割合' }
];

// typeに応じたタブを返すcomputed
const tabs = computed(() => {
 const type = findType.value(props.rule) as TypesType;
 let additionalTabs = [] as any;

 switch (type) {
  case 'comment':
   additionalTabs = [
    { value: 'threshold', icon: 'mdi-tune', label: '条件設定' }
    // { value: 'scripts', icon: 'mdi-script-text', label: 'スクリプト' }
   ];
   break;
  case 'timer':
   additionalTabs = [{ value: 'timer', icon: 'mdi-timer', label: 'タイマー設定' }];
   break;
  case 'meta':
   additionalTabs = [{ value: 'meta', icon: 'mdi-information', label: '枠情報設定' }];
   break;
  case 'waitingList':
   additionalTabs = [{ value: 'waiting', icon: 'mdi-account-group', label: '参加者設定' }];
   break;
  case 'setList':
   additionalTabs = [{ value: 'setlist', icon: 'mdi-playlist-music', label: 'セット設定' }];
   break;
  case 'reactions':
   additionalTabs = [{ value: 'reactions', icon: 'mdi-party-popper', label: 'リアクション設定' }];
   break;
 }

 return [...additionalTabs, ...baseTabs];
});

function updateTimerConfig(key: 'minutes' | 'isBaseZero', value: any) {
 // timerConfigがundefinedの場合、初期値を設定
 const updatedTimerConfig = props.rule.timerConfig
  ? { ...props.rule.timerConfig, [key]: value }
  : { minutes: 5, isBaseZero: true };
 updateOmikenEntry('rules', { ...props.rule, timerConfig: updatedTimerConfig });
}

watch(
 () => tab.value,
 (newVal) => {
  emit('showWeightEdit', newVal === 'percent');
 },
 { immediate: true }
);
</script>
