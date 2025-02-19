<!-- src/components/DialogOmikuji/DialogOmikujiScripts.vue -->
<template>
 <v-row dense>
  <v-col cols="12" sm="6">
   <v-select
    v-model="selectedScriptId"
    :items="scriptItems"
    label="外部スクリプト"
    item-title="text"
    item-value="value"
    dense="compact"
    clearable
    @update:modelValue="updateOmikenEntry('omikujis', item)"
   />
  </v-col>
 </v-row>

 <!-- スクリプトが選択されている場合のパラメータ入力欄 -->
 <template v-if="selectedScript">
  <v-row dense v-if="selectedScript.scriptParams?.length">
   <v-col cols="12">
    <v-card variant="outlined" class="pa-2 mt-2">
     <div class="text-subtitle-1 mb-2">パラメータ設定</div>

     <!-- 通常のパラメータ -->
     <v-row dense>
      <v-col cols="12" sm="6" md="4" lg="3" v-for="param in normalParams" :key="param.id">
       <dialog-omikuji-scripts-field
        :param="param"
        v-model="scriptParamValues[param.id]"
        @update:model-value="updateScriptParam(param.id, $event)"
       />
      </v-col>
     </v-row>

     <!-- 詳細設定パラメータ -->
     <v-expand-transition>
      <div v-if="advancedParams.length">
       <v-divider class="my-2" />
       <v-btn variant="text" @click="showAdvanced = !showAdvanced" class="mb-2">
        詳細設定
        <v-icon right>{{ showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
       </v-btn>

       <v-row dense v-show="showAdvanced">
        <v-col cols="12" sm="6" md="4" lg="3" v-for="param in advancedParams" :key="param.id">
         <dialog-omikuji-scripts-field
          :param="param"
          v-model="scriptParamValues[param.id]"
          @update:model-value="updateScriptParam(param.id, $event)"
         />
        </v-col>
       </v-row>
      </div>
     </v-expand-transition>
    </v-card>
   </v-col>
  </v-row>
 </template>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref, watch } from 'vue';
import { OmikenCategory, ListEntryType, OmikujiType, OmikenEntry, AppEditorType, DialogTabValue } from '@type';
import DialogOmikujiScriptsField from '@components/DialogOmikuji/DialogOmikujiScriptsField.vue';
import { useOmikenStore } from '@/store/UseOmikenStore';

const props = defineProps<{
 item: OmikujiType;
 modelValue: DialogTabValue;
}>();

// pinia:OmikenStore
const { updateOmiken, getOmikenPresets } = useOmikenStore();

// inject
const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
const Scripts = AppEditor?.value.Scripts;

// 詳細設定の表示状態
const showAdvanced = ref(false);

// 通常パラメータと詳細パラメータを分離
const normalParams = computed(() => selectedScript.value?.params);

// スクリプトの選択項目を生成
const scriptItems = computed(() => {
 return Object.entries(Scripts || {}).map(([key, value]) => ({
  text: key,
  value: key
 }));
});

// 選択されているスクリプトの情報を取得
const selectedScript = computed(() => {
 if (!props.item.script || !Scripts) return null;
 return Scripts[props.item.script.scriptId];
});

// スクリプトパラメータの値を管理
const scriptParamValues = ref<{ [key: string]: string | number | boolean }>({});

// 選択されているスクリプトIDを管理
const selectedScriptId = computed({
 get() {
  return props.item.script?.scriptId || '';
 },
 set(newValue: string) {
  if (props.item) {
   // `params` がオプショナルなので空配列をデフォルトで設定
   props.item.script = {
    ...props.item.script, // 他のプロパティはそのままに
    scriptId: newValue,
    params: props.item.script?.params ?? {} // `params` がない場合、空配列を使用
   };

   // 更新を反映
   updateOmikenEntry('omikujis', props.item);
  }
 }
});

// スクリプト選択時のデフォルト値設定を追加
watch(
 () => selectedScript.value,
 (newScript) => {
  if (!newScript || !newScript.scriptParams) return;

  const existingParams = props.item.script?.params || {};

  newScript.scriptParams.forEach((param) => {
   let value: string | number | boolean;

   if (param.id in existingParams) {
    // 既存の値を型に応じて変換
    switch (param.type) {
     case 'number':
      value = Number(existingParams[param.id]);
      break;
     case 'boolean':
      if (typeof existingParams[param.id] === 'boolean') {
       value = existingParams[param.id];
      } else if (typeof existingParams[param.id] === 'string') {
       value = existingParams[param.id] === 'true';
      } else {
       value = Boolean(existingParams[param.id]);
      }
      break;
     default:
      value = existingParams[param.id];
    }
   } else {
    value = param.value;
   }

   scriptParamValues.value[param.id] = value;

   if (!props.item.script) {
    props.item.script = {
     scriptId: selectedScriptId.value,
     params: {}
    };
   }
   props.item.script.params[param.id] = String(value);
  });

  updateOmikenEntry('omikujis', props.item);
 },
 { immediate: true }
);

// 更新ハンドラの追加
const updateScriptParam = (paramId: string, value: string | number | boolean | null) => {
 if (!props.item.script) return;
 if (value === null) return;

 // 選択されているスクリプトのパラメータ定義を取得
 const paramDef = selectedScript.value?.scriptParams?.find((p) => p.id === paramId);
 if (!paramDef) return;

 // 文字列から適切な型に変換
 let convertedValue: string | number | boolean;
 switch (paramDef.type) {
  case 'number':
   convertedValue = Number(value);
   break;
  case 'boolean':
   // より厳密な真偽値の変換
   if (typeof value === 'boolean') {
    convertedValue = value;
   } else if (typeof value === 'string') {
    convertedValue = value.toLowerCase() === 'true';
   } else {
    convertedValue = Boolean(value);
   }
   break;
  default:
   convertedValue = String(value);
 }

 props.item.script.params = {
  ...props.item.script.params,
  [paramId]: convertedValue
 };
 updateOmikenEntry('omikujis', props.item);
};
</script>
