<!-- src/components/DialogTypes.vue -->
<template>
 <v-dialog v-model="dialog" persistent max-width="900px">
  <v-card>
   <v-card-title>基本情報の編集</v-card-title>
   <v-card-text>
    <v-row>
     <v-col v-for="(typeKey, index) in ['comment', 'timer', 'unused']" :key="typeKey" cols="12" sm="6" md="4">
      <!-- typesの説明 -->
      <v-card-title class="px-0 pt-0 text-h6">
       <v-icon class="mr-2">{{ TYPE_DESCRIPTIONS[typeKey as TypesType].icon }}</v-icon>
       {{ TYPE_DESCRIPTIONS[typeKey as TypesType].title }}
      </v-card-title>
      <v-card-subtitle class="px-0 pb-2">
       {{ TYPE_DESCRIPTIONS[typeKey as TypesType].description }}
      </v-card-subtitle>

      <draggable v-model="draggableRules[typeKey as TypesType]" item-key="id" group="rules">
       <template #item="{ element: ruleId, index: subIndex }">
        <div :key="ruleId" class="mb-2">
         <!-- v-toolbarをv-chipに変更してドラッグしやすく -->
         <v-chip
          :color="Omiken.rules[ruleId]?.color"
          class="w-100 py-2"
          variant="elevated"
          @click="openEditorItem('rules', ruleId)"
         >
          <v-row no-gutters align="center">
           <v-col cols="auto" class="mr-2">
            <v-icon size="small">mdi-drag</v-icon>
           </v-col>
           <v-col> {{ subIndex + 1 }}. {{ Omiken.rules[ruleId]?.name }} </v-col>
          </v-row>
         </v-chip>
        </div>
       </template>
       <template #footer>
        <v-card v-if="draggableRules[typeKey as TypesType].length === 0" class="text-center py-2 mb-4 dashed-border">
         <v-card-text class="text-grey">
          <v-icon class="mr-2">mdi-arrow-all</v-icon>
          ここにドラッグ＆ドロップ
         </v-card-text>
        </v-card>
       </template>
      </draggable>
     </v-col>
    </v-row>
   </v-card-text>
   <v-card-actions>
    <v-spacer />
    <v-btn color="primary" @click="saveChanges">保存</v-btn>
    <v-btn @click="dialog = false">キャンセル</v-btn>
   </v-card-actions>
  </v-card>
 </v-dialog>

 <v-btn icon @click.stop="dialog = true">
  <v-icon>{{ TYPE_DESCRIPTIONS[findType(rule)].icon }}</v-icon>
  <v-tooltip activator="parent" location="bottom">
   このルールの起動方法を変更したり、発動する順番を入れ替えます。
  </v-tooltip>
 </v-btn>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { OmikenEntry, ListCategory, ListEntry, TypesType, OmikenType, RulesType } from '@type';
import { FunkEmits } from '@/composables/FunkEmits';
import { FunkTypes } from '@/composables/FunkTypes';
import Draggable from 'vuedraggable';

const props = defineProps<{
 rule: RulesType;
 Omiken: OmikenType;
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<ListCategory>): void;
 (e: 'open-editor', editorItem: ListEntry<ListCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { openEditorItem } = FunkEmits(emit);
// コンポーザブル:FunkTypes
const { TYPE_DESCRIPTIONS, findType } = FunkTypes();

// ローカルの状態管理
const dialog = ref(false);
const localTypes = ref<Record<TypesType, string[]>>({
 comment: [...(props.Omiken.types.comment ?? [])],
 timer: [...(props.Omiken.types.timer ?? [])],
 unused: [...(props.Omiken.types.unused ?? [])],
 meta: [...(props.Omiken.types.meta ?? [])],
 waitingList: [...(props.Omiken.types.waitingList ?? [])],
 setList: [...(props.Omiken.types.setList ?? [])],
 reactions: [...(props.Omiken.types.reactions ?? [])]
});

watch(
 () => props.Omiken.types,
 (newTypes) => {
  localTypes.value = {
   comment: [...(newTypes.comment ?? [])],
   timer: [...(newTypes.timer ?? [])],
   unused: [...(newTypes.unused ?? [])],
   meta: [...(newTypes.meta ?? [])],
   waitingList: [...(newTypes.waitingList ?? [])],
   setList: [...(newTypes.setList ?? [])],
   reactions: [...(newTypes.reactions ?? [])]
  };
 },
 { immediate: true } // 初期値の設定を行うため、即時実行
);

const draggableRules = computed<Record<TypesType, string[]>>({
 get: () => localTypes.value,
 set: (newValue) => {
  localTypes.value = newValue;
 }
});

const saveChanges = () => {
 emit('update:Omiken', { type: 'types', reTypes: localTypes.value });
 dialog.value = false;
};
</script>

<style scoped>
.dashed-border {
 border: 2px dashed #9e9e9e;
 border-style: dashed;
}
</style>
