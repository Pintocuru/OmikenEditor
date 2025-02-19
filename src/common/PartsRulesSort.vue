<!-- src/components/PartsRulesSort.vue -->
<template>
 <v-btn icon variant="flat" @click.stop="openDialog">
  <v-icon>mdi-sort</v-icon>
  <v-tooltip activator="parent" location="bottom"> ルールの処理順序を変更 </v-tooltip>
 </v-btn>

 <v-dialog v-model="dialog" max-width="600px">
  <v-card>
   <v-card-title>ルールの処理順序を変更</v-card-title>
   <v-card-text>
    <v-list lines="three">
     <draggable v-model="tempRules" item-key="id" handle=".handle" @end="handleReorder">
      <template #item="{ element }">
       <v-list-item>
        <template #prepend>
         <v-icon class="handle" color="grey"> mdi-drag </v-icon>
        </template>

        <v-list-item-title>
         {{ element.name }}
        </v-list-item-title>

        <v-list-item-subtitle> 現在の順序: {{ element.order }} </v-list-item-subtitle>

        <template #append>
         <v-chip :color="element.color" size="small">
          {{ element.ruleType }}
         </v-chip>
        </template>
       </v-list-item>
      </template>
     </draggable>
    </v-list>
   </v-card-text>
   <v-card-text class="text-caption"> ※ドラッグ&ドロップで順序を変更できます </v-card-text>
   <v-card-actions>
    <v-spacer />
    <v-btn color="primary" @click="saveChanges">保存</v-btn>
    <v-btn @click="cancelChanges">キャンセル</v-btn>
   </v-card-actions>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RuleCategory, OmikenTypeMap } from '@type';
import { useOmikenStore } from '@/store/UseOmikenStore';
import Draggable from 'vuedraggable';

const props = defineProps<{
 type: RuleCategory;
 rules: Record<string, OmikenTypeMap<RuleCategory>>;
}>();

// pinia:OmikenStore
const { updateOmiken } = useOmikenStore();

const tempRules = ref<typeof sortedRules.value>([]);
const dialog = ref(false);

// ルールを順序でソートして配列化
const sortedRules = computed(() => {
 return Object.entries(props.rules)
  .map(([id, rule]) => ({ ...rule }))
  .sort((a, b) => a.order - b.order);
});

// ダイアログを開く時に一時データを初期化
const openDialog = () => {
 tempRules.value = JSON.parse(JSON.stringify(sortedRules.value));
 dialog.value = true;
};

// ドラッグ&ドロップの並び替え処理
const handleReorder = () => {
 // 一時データの順序のみを更新
 tempRules.value = tempRules.value.map((item, index) => ({
  ...item,
  order: index + 1
 }));
};

// 変更を保存
const saveChanges = () => {
 // 一時データから更新用のオブジェクトを作成
 const updatedRules: OmikenTypeMap<RuleCategory>[] = tempRules.value.map((rule) => ({
  ...rule
 }));

 // 配列形式で更新を実行
 updateOmiken({ type: props.type, updates: updatedRules });
 dialog.value = false;
};

// 変更をキャンセル
const cancelChanges = () => {
 tempRules.value = [];
 dialog.value = false;
};
</script>
