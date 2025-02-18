<!-- src/components/DialogThreshold/DialogThreshold.vue -->
<template>
 <v-card-text>
  <!-- しきい値リスト -->
  <v-row>
   <v-col v-for="(threshold, index) in thresholds" :key="index" cols="12" :sm="maxArray === 1 ? 12 : 4">
    <div class="d-flex align-center">
     <!-- 条件カード -->
     <v-card
      elevation="3"
      class="pa-4 position-relative cursor-pointer"
      :variant="threshold.isNot ? 'flat' : 'elevated'"
      :color="threshold.isNot ? 'blue lighten-4' : 'yellow lighten-3'"
      :height="maxArray === 1 ? 70 : 100"
      @click="openDialog(index)"
      rounded="lg"
     >
      <!-- 閉じるボタン -->
      <v-btn
       icon
       size="small"
       variant="text"
       class="position-absolute"
       style="top: -8px; right: -8px"
       @click.stop="removeThreshold(index)"
       :disabled="thresholds.length <= minArray"
      >
       <v-icon>mdi-close</v-icon>
      </v-btn>

      <!-- NOT条件の表示 -->
      <v-chip
       v-if="threshold.isNot"
       size="small"
       color="blue darken-3"
       text-color="white"
       class="position-absolute"
       style="top: 4px; left: 4px"
      >
       NOT
      </v-chip>

      <!-- 条件の内容 -->
      <div class="text-center font-weight-medium">🔐 {{ getExampleText([threshold]) }}</div>
     </v-card>

     <!-- AND/OR の表示 (外側、カードの右) -->
     <v-chip
      v-if="index < thresholds.length - 1"
      class="ml-2"
      :color="threshold.isAnd ? 'primary' : 'warning'"
      size="small"
      text-color="white"
      style="font-weight: bold; text-transform: uppercase"
     >
      {{ threshold.isAnd ? 'AND' : 'OR' }}
     </v-chip>
    </div>
   </v-col>

   <!-- 新規追加ボタン -->
   <v-col cols="12" :sm="maxArray === 1 ? 12 : 4" v-show="thresholds.length < maxArray">
    <v-card
     elevation="2"
     :height="maxArray === 1 ? 70 : 100"
     class="d-flex align-center justify-center cursor-pointer"
     color="grey-lighten-4"
     @click="addThreshold"
    >
     <div class="text-center">
      <v-icon size="32" color="primary" class="mb-2">mdi-plus-circle</v-icon>
      <div class="text-primary">条件を追加</div>
     </div>
    </v-card>
   </v-col>
  </v-row>
 </v-card-text>

 <!-- 現在選択中のしきい値の詳細編集 -->
 <v-dialog v-model="dialog" max-width="800px" persistent :scrim="true">
  <v-card v-if="currentIndex !== null">
   <v-card-title class="text-h6">条件の編集</v-card-title>
   <v-card-text>
    <!-- Thresholdのセレクトボタン -->
    <ThresholdSelect :threshold="editingThreshold" @update:condition="updateConditionType" />
    <!-- 各種設定 -->
    <component :is="getComponent" :threshold="editingThreshold" :type="type" @update:threshold="tempUpdateThreshold" />
    <!-- isNot/isAnd設定 -->
    <ThresholdRelation :threshold="editingThreshold" @update:threshold="updatehoge" />
   </v-card-text>
   <v-card-actions>
    <v-spacer />
    <v-btn color="primary" @click="saveChanges">保存</v-btn>
    <v-btn @click="dialog = false">キャンセル</v-btn>
   </v-card-actions>
  </v-card>
 </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ThresholdType, ConditionType, TypesType, RulesType, OmikujiType, OmikenEntry, OmikenCategory } from '@type';
import { FunkThresholdInitial, FunkThreshold } from '@composables/FunkThreshold';
import ThresholdSelect from './ThresholdSelect.vue';
import ThresholdSimple from './ThresholdSimple.vue';
import ThresholdCount from './ThresholdCount.vue';
import ThresholdMatch from './ThresholdMatch.vue';
import ThresholdRelation from './ThresholdRelation.vue';
import { FunkEmits } from '@composables/FunkEmits';

const props = defineProps<{
 item: RulesType | OmikujiType;
 type: TypesType;
 mode: 'rules' | 'omikujis';
}>();

const emit = defineEmits<{
 (e: 'update:Omiken', payload: OmikenEntry<OmikenCategory>): void;
}>();

// コンポーザブル:FunkEmits
const { updateOmikenEntry } = FunkEmits(emit);
const { getExampleText } = FunkThreshold();

// 状態管理
const dialog = ref(false);
const currentIndex = ref<number | null>(0);
const thresholds = ref<ThresholdType[]>([...props.item.threshold]);
const editingThreshold = ref<ThresholdType>(FunkThresholdInitial());

// Props の監視
watch(
 () => props.item,
 (newVal) => {
  // props.item.threshold の長さが現在の thresholds の長さより少ない場合のみ更新
  if (newVal.threshold.length < thresholds.value.length) {
   thresholds.value = [...newVal.threshold];
   currentIndex.value = 0;
  }
 },
 { deep: true, immediate: true }
);

// 算出プロパティ
const maxArray = computed(() => (props.mode === 'rules' ? 3 : 1));
const minArray = computed(() => 0);
const getComponent = computed(() => {
 const componentMap = {
  target: ThresholdSimple,
  coolDown: ThresholdSimple,
  syoken: ThresholdSimple,
  access: ThresholdSimple,
  gift: ThresholdSimple,
  count: ThresholdCount,
  match: ThresholdMatch
 };
 return componentMap[editingThreshold.value.conditionType];
});

// メソッド
const openDialog = (index: number) => {
 currentIndex.value = index;
 editingThreshold.value = { ...thresholds.value[index] };
 dialog.value = true;
};

// 条件追加
const addThreshold = () => {
 if (thresholds.value.length < maxArray.value) {
  thresholds.value.push(FunkThresholdInitial());
  currentIndex.value = thresholds.value.length - 1;
  emitUpdate();
  dialog.value = true;
 }
};

// 条件削除
const removeThreshold = (index: number) => {
 if (thresholds.value.length > minArray.value) {
  thresholds.value.splice(index, 1);
  emitUpdate();
 }
};

// 条件タイプの更新
const updateConditionType = (condition: ConditionType) => {
 editingThreshold.value = {
  ...FunkThresholdInitial(condition),
  ...editingThreshold.value,
  conditionType: condition
 };
};

const updatehoge = (threshold: ThresholdType) => {
 editingThreshold.value = {
  ...editingThreshold.value,
  ...threshold
 };
};

// 条件の更新
const tempUpdateThreshold = (updatedThreshold: ThresholdType) => {
 editingThreshold.value = updatedThreshold;
};

// 更新イベントの発火
const emitUpdate = () => {
 updateOmikenEntry(props.mode, { ...props.item, threshold: thresholds.value });
};

// 条件の保存
const saveChanges = () => {
 if (currentIndex.value !== null) {
  thresholds.value[currentIndex.value] = { ...editingThreshold.value };
  emitUpdate();
  dialog.value = false;
 }
};
</script>
