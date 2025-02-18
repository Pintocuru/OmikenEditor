<!-- src/components/ListRules/ListRulesOmikujis.vue -->
<template>
 <draggable
  v-model="currentItem.enables"
  item-key="id"
  class="d-flex flex-wrap w-100"
  tag="div"
  @end="() => updateOmikenEntry('rules', currentItem)"
 >
  <template #item="{ element: omikujiId }">
   <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
    <v-card variant="tonal">
     <!-- タイトルバーと操作ボタン -->
     <v-toolbar density="compact" :color="getPostTypeColor(omikujis[omikujiId].post, true)">
      <v-toolbar-title v-if="omikujis[omikujiId]" @click="openEditorItem('omikujis', omikujiId)">
       <v-tooltip bottom>
        <template #activator="{ props }">
         <span v-bind="props" class="truncate">{{ omikujis[omikujiId]?.name }}</span>
        </template>
        <span>{{ omikujis[omikujiId]?.name }}</span>
       </v-tooltip>
      </v-toolbar-title>
      <template #append>
       <!-- バーガーメニュー -->
       <PartsArrayAction
        editMode="omikujiRemove"
        :entry="omikujis[omikujiId]"
        :optionRules="currentItem"
        @edit="openEditorItem('omikujis', omikujiId)"
        @update:Omiken="updateOmiken"
       />
      </template>
     </v-toolbar>

     <!-- おみくじ内容 -->
     <v-card-text class="py-4">
      <!-- onecommeのcontent表示 -->
      <div class="pb-3" v-if="omikujis[omikujiId]?.post">
       {{ getOnecommeContent(omikujis[omikujiId].post) }}
      </div>

      <div v-if="omikujis[omikujiId] && currentItem" class="list-group d-flex flex-wrap">
       <!-- 発動条件の表示 -->
       <v-chip
        v-if="omikujis[omikujiId]?.threshold.length !== 0"
        density="compact"
        variant="elevated"
        color="yellow lighten-3"
       >
        🔐 {{ getExampleText(omikujis[omikujiId].threshold) }}
       </v-chip>
       <v-chip density="compact" variant="elevated" label :color="weightColor(omikujiId, currentItem.enableIds)">
        <!-- rankCountが1でない、かつすべてのthresholdが空の場合にビックリマークとツールチップを表示 -->
        <template v-if="rankCount(currentItem.enableIds) !== 1 && isAllThresholdEmpty(currentItem.enableIds)">
         <v-tooltip>
          <template #activator="{ props }">
           <span v-bind="props" class="ml-2" style="color: red; font-size: 20px">❗</span>
          </template>
          <span>おみくじに条件が設置されていないため、<br />ランクが最高のものしか選ばれません。</span>
         </v-tooltip>
        </template>
        <!-- ランク表示 -->
        <span>
         🌟 {{ omikujis[omikujiId]?.rank }} (Lv{{ rankPositionGet(omikujiId, currentItem.enableIds) }}/{{
          rankCount(currentItem.enableIds)
         }})
        </span>
        <!-- 出現割合表示 -->
        <span class="pl-2">
         🎯{{ omikujis[omikujiId]?.weight }}/{{ weightTotal(currentItem.enableIds, omikujis[omikujiId]?.rank) }}
         <span class="ml-0">({{ weightPercentage(omikujiId, currentItem.enableIds) }}%)</span>
        </span>
       </v-chip>
      </div>
      <!-- ランク・出現割合の編集 -->
      <v-expand-x-transition>
       <div v-if="showWeightEdit">
        <v-row dense>
         <v-col cols="6">
          <v-text-field
           v-if="omikujis[omikujiId]"
           class="pt-2"
           v-model.number="omikujis[omikujis[omikujiId].id].rank"
           label="ランク"
           min="0"
           type="number"
           @update:modelValue="updateOmikenEntry('omikujis', omikujis[omikujiId])"
          />
         </v-col>
         <v-col>
          <v-text-field
           v-if="omikujis[omikujiId]"
           class="pt-2"
           v-model.number="omikujis[omikujis[omikujiId].id].weight"
           label="出現割合"
           min="0"
           type="number"
           @update:modelValue="updateOmikenEntry('omikujis', omikujis[omikujiId])"
          />
         </v-col>
        </v-row>
        <v-progress-linear
         :model-value="weightPercentage(omikujis[omikujiId].id, currentItem.enableIds)"
         buffer-value="10"
         absolute
         prop
         :color="weightColor(omikujis[omikujiId].id, currentItem.enableIds)"
        />
       </div>
      </v-expand-x-transition>
      <!-- 出現割合を表示 -->
     </v-card-text>
    </v-card>
   </v-col>
  </template>
  <template #footer>
   <v-col cols="12" sm="6" md="4" lg="3" class="pa-1">
    <v-card
     class="text-center py-2 mb-4 dashed-border d-flex align-center justify-center"
     height="150"
     @click="addItemOmikuji"
    >
     <v-card-text class="text-grey d-flex flex-column align-center justify-center">
      <v-icon class="mb-2" size="36">mdi-plus-box-outline</v-icon>
      <span>新しいおみくじを作成</span>
     </v-card-text>
    </v-card>
   </v-col>
  </template>
 </draggable>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ListEntryType, OmikenType, OmikenEntry, OmikujiType } from '@type';
import PartsArrayAction from '@common/PartsArrayAction.vue';
import { FunkRules } from '@composables/FunkRules';
import { FunkOmikuji } from '@composables/FunkOmikuji';
import { FunkThreshold } from '@composables/FunkThreshold';
import { FunkEmits } from '@composables/FunkEmits';
import draggable from 'vuedraggable';

const props = defineProps<{
 rule: RulesType;
 showWeightEdit: boolean;
}>();

// コンポーザブル:FunkEmits
const { updateOmiken, updateOmikenEntry, openEditorItem } = FunkEmits();
// コンポーザブル:funkRules
const { weightTotal, weightPercentage, rankCount, rankPositionGet, isAllThresholdEmpty, weightColor } = FunkRules();
// コンポーザブル:FunkOmikuji
const { getOnecommeContent, getPostTypeColor } = FunkOmikuji();
// コンポーザブル:funkThreshold
const { getExampleText } = FunkThreshold();

// ドラッグ&ドロップでの更新も同様に
const currentItem = computed({
 get: () => props.rule || { enableIds: [] },
 set: (value) => props.rule && updateOmiken({ type: 'rules', update: value })
});

function addItemOmikuji() {
 if (!props.rule) return;
 if (props.rule.id) {
  emit('update:Omiken', {
   type: 'omikujis',
   addKeys: [{ name: '新しいおみくじ', optionId: props.rule.id }]
  });
 }
}
</script>

<style scoped>
.dashed-border {
 border: 2px dashed #9e9e9e;
 border-style: dashed;
}
</style>
