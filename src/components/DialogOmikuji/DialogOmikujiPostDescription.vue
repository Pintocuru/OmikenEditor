<!-- src/components/DialogOmikuji/DialogOmikujiPostDescription.vue -->
<template>
 <v-row dense>
  <v-col cols="12">
   <v-card variant="outlined" class="pa-2 mt-2">
    <div class="text-subtitle-1 mb-2">使用できるプレースホルダー</div>

    <v-expansion-panels>
     <!-- 基本のプレースホルダー -->
     <v-expansion-panel>
      <v-expansion-panel-title>
       基本のプレースホルダー (クリックして表示)
       <template v-slot:actions>
        <v-icon icon="mdi-chevron-down"></v-icon>
       </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
       <v-list density="compact">
        <v-list-item v-for="placeholder in basicPlaceholders" :key="placeholder.id">
         <v-list-item-title>
          <span><<{{ placeholder.id }}>></span>
          <span class="pa-2 mt-2"> : </span>
          <i>{{ placeholder.value }}</i>
         </v-list-item-title>
         <v-list-item-subtitle>{{ placeholder.description }}</v-list-item-subtitle>
        </v-list-item>
       </v-list>
      </v-expansion-panel-text>
     </v-expansion-panel>
    </v-expansion-panels>
    <!-- その他のプレースホルダー（スクリプト、カスタム） -->
    <v-list density="compact" class="mt-4">
     <v-list-item v-for="placeholder in availablePlaceholders" :key="placeholder.id">
      <v-list-item-title>
       <span
        :class="{ 'cursor-pointer': placeholder.isEditable }"
        @click="placeholder.isEditable && updateDialog({ type: 'places', id: placeholder.id })"
       >
        <<{{ placeholder.id }}>>
       </span>
       <span class="pa-2 mt-2"> : </span>
       <i>{{ placeholder.value }}</i>
      </v-list-item-title>
      <v-list-item-subtitle>{{ placeholder.description }}</v-list-item-subtitle>
     </v-list-item>
    </v-list>

    <div v-if="availablePlaceholders.length === 0 && props.type === 'omikujis'">
     <span
      @click="$emit('update:modelValue', 'places')"
      class="clickable-tag text-primary font-weight-medium pa-1 rounded mx-1"
      >【プレース】</span
     >
     <span
      @click="$emit('update:modelValue', 'scriptParams')"
      class="clickable-tag text-primary font-weight-medium pa-1 rounded mx-1"
      >【アドオン用パラメータ】</span
     >
     から選ぶと、プレースホルダーを使用できるようになります。
    </div>
   </v-card>
  </v-col>
 </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
 PlaceValueType,
 EventCategory,
 OmikenTypeMap,
 ScriptParam,
 ParamType,
 ruleCategories,
 ScriptType,
 DialogTabValue
} from '@type';
import { useOmikenStore } from '@/store/UseOmikenStore';
import { UseUIStore } from '@/store/UseUIStore';

const props = defineProps<{
 type: EventCategory;
 item: OmikenTypeMap<EventCategory>;
 modelValue?: DialogTabValue;
 // TODO placeでも使うのでemitは必要
}>();

const emit = defineEmits<{
 (e: 'update:modelValue', value: DialogTabValue): void;
}>();

// pinia:OmikenStore
const { getOmikenItems, getOmikenPresets, getRulesAll } = useOmikenStore();
// pinia:UseUIStore
const { updateDialog } = UseUIStore();

// inject
const places = computed(() => getOmikenItems('places') || {});
const rules = computed(() => getRulesAll() || {});
const Charas = computed(() => getOmikenPresets('Charas') || {});
const Scripts = computed(() => getOmikenPresets('Scripts') || {});

// 基本のプレースホルダーのみを返すcomputed
const basicPlaceholders = [
 { id: 'gameDraws', value: 1, description: 'おみくじを起動した回数', isEditable: false, key: '' },
 { id: 'gameTotalDraws', value: 12, description: 'おみくじを起動した総回数', isEditable: false, key: '' },
 { id: 'draws', value: 1, description: 'ユーザーがおみくじを起動した回数', isEditable: false, key: '' },
 { id: 'totalDraws', value: 12, description: 'ユーザーがおみくじを起動した総回数', isEditable: false, key: '' },
 { id: 'user', value: 'テストユーザー', description: 'ユーザー名', isEditable: false, key: '' },
 { id: 'tc', value: 201, description: 'ユーザーがこれまでコメントした数', isEditable: false, key: '' },
 { id: 'lc', value: 2, description: '配信枠のコメント総数', isEditable: false, key: '' },
 { id: 'round', value: 18, description: 'ユーザーがこれまでコメントした配信枠の数', isEditable: false, key: '' }
];

// アドオンのパラメータを取得する
function getScriptParams(omikujiId: string): Array<ScriptParam<ParamType>> | null {
 const matchedRules = ruleCategories.flatMap((category) =>
  Object.values(getRulesAll()[category]).filter((rule) => rule.enables.some((enable) => enable.omikujiId === omikujiId))
 );
 const scriptId = matchedRules[0].script?.scriptId;
 // マッチしたrule.enablesが1つでない場合は設定できない
 if (matchedRules.length !== 1 || !scriptId) return null;
 return Scripts.value[scriptId].params ?? null;
}

// 使用可能なプレースホルダーをまとめて取得
const availablePlaceholders = computed(() => {
 const placeholders = [];

 // スクリプトのプレースホルダー
 if (props.type === 'omikujis') {
  const params = getScriptParams(props.item.id);

  if (props.item.script?.scriptId && Scripts?.[props.item.script.scriptId]) {
   placeholders.push(
    ...Scripts[props.item.script.scriptId].placeholders.map((p) => ({
     id: p.id,
     value: p.value,
     description: p.description,
     isEditable: false, // スクリプトは編集不可
     key: '' // スクリプトにはキーは不要
    }))
   );
  }
 }

 // カスタムプレースホルダー
 if (places.value && props.item.placeIds) {
  props.item.placeIds.forEach((id) => {
   const place = places.value[id];
   if (place) {
    placeholders.push({
     id: place.name,
     value: weightedRandom(place.values),
     description: `【 ${place.values.length} items】 ${place.description}`,
     isEditable: true, // Places は編集可能
     key: place.id // open-editor 用のキー
    });
   }
  });
 }
 return placeholders;
});

// 重み付き抽選の関数
const weightedRandom = (values: PlaceValueType[]): string => {
 const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
 let random = Math.random() * totalWeight;
 for (const item of values) {
  random -= item.weight;
  if (random <= 0) return item.value;
 }
 return values[0].value;
};
</script>

<style scoped>
.cursor-pointer {
 cursor: pointer;
 color: #1976d2; /* プライマリーカラーまたは任意の色 */
 text-decoration: underline;
}

.cursor-pointer:hover {
 opacity: 0.8;
}

.clickable-tag {
 cursor: pointer;
 transition: all 0.2s ease;
 user-select: none;
 background-color: rgba(25, 118, 210, 0.05);
}

.clickable-tag:hover {
 background-color: rgba(25, 118, 210, 0.1);
 transform: translateY(-1px);
 box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.clickable-tag:active {
 transform: translateY(0px);
 background-color: rgba(25, 118, 210, 0.15);
 box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
