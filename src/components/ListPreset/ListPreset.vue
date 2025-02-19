<!-- src/components/ListPreset/ListPreset.vue -->
<template>
 <!-- タグフィルター部分 -->
 <div class="mb-4">
  <v-chip-group v-model="selectTags" column multiple>
   <v-chip
    v-for="tag in uniqueTags"
    :key="tag"
    :value="tag"
    filter
    variant="outlined"
    :color="selectTags.includes(tag) ? 'primary' : undefined"
   >
    {{ tag }}
   </v-chip>
  </v-chip-group>
 </div>

 <!-- プリセットリスト -->
 <v-row>
  <v-col v-for="(preset, key) in filterPresets" :key="key" cols="12" sm="6" md="4">
   <v-card class="preset-card h-100" elevation="3">
    <v-img
     :src="getPresetsImage(preset.banner)"
     height="200"
     cover
     class="align-end"
     gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
    >
     <v-card-title class="font-weight-bold">
      {{ preset.name }}
     </v-card-title>
     <v-card-subtitle class="mb-2" v-if="type === 'Charas'"> 投稿名: {{ preset.displayName }} </v-card-subtitle>
    </v-img>

    <v-card-text>
     <div class="d-flex align-center mb-2">
      <v-chip color="primary" size="small" class="mr-2">{{ typeName }}</v-chip>
      <span v-if="preset.author" class="d-flex align-center">
       <v-icon size="small" class="mr-2">mdi-account</v-icon>
       <span class="text-caption">{{ preset.author }}</span>
      </span>
      <v-btn v-if="preset.url" :href="preset.url" target="_blank" rel="noopener noreferrer" variant="text" class="ml-2">
       <v-icon size="small">mdi-link</v-icon>
      </v-btn>
     </div>

     <p class="preset-description mb-3">{{ preset.description }}</p>

     <div class="d-flex flex-wrap mt-2">
      <v-chip
       v-for="(tag, index) in preset.tags"
       :key="index"
       color="secondary"
       size="small"
       variant="outlined"
       class="mr-1 mb-1"
      >
       {{ tag }}
      </v-chip>
     </div>

     <v-card-actions v-if="type === 'Presets'">
      <v-spacer></v-spacer>
      <!-- プリセット適用ボタン -->
      <v-btn color="primary" variant="outlined" @click="applyPreset(preset as PresetOmikenType)"> 適用する </v-btn>
     </v-card-actions>
    </v-card-text>
   </v-card>
  </v-col>
 </v-row>
</template>

<script setup lang="ts">
import { PresetOmikenType, PresetType, PresetCategory, NaviCategoryType } from '@type';
import { computed } from 'vue';
import { FunkPresets } from '@composables/FunkPresets';

const props = defineProps<{
 items: PresetType[PresetCategory];
 categoryActive: NaviCategoryType<'presets'>;
}>();

// Computed
const type = computed(() => props.categoryActive.sub);
const typeName = computed(() => map[type.value ?? 'Presets']);
const map = { Presets: 'おみくじデータ', Charas: 'キャラクター', Scripts: 'アドオン' } as const;

// Composables
const { selectTags, uniqueTags, filterPresets, applyPreset, getPresetsImage } = FunkPresets(
 type.value ?? 'Presets',
 props.items
);
</script>
