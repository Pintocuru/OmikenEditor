<!-- components/common/PartsToolbarColor.vue -->
<template>
  <v-btn  class="ml-4" :color="modelValue" icon variant="flat" @click.stop="dialog = true">
    <v-icon>mdi-palette</v-icon>
    <v-tooltip activator="parent" location="bottom">
      このルールに合う色を選びます。
    </v-tooltip>
  </v-btn>

  <v-dialog v-model="dialog" max-width="350px">
    <v-card>
      <v-card-title>色を選択</v-card-title>
      <v-card-text>
        <v-color-picker
          v-model="tempColor"
          mode="hex"
          hide-inputs
          show-swatches
          @update:model-value="updateColor"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="confirmColor">確定</v-btn>
        <v-btn @click="dialog = false">キャンセル</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const dialog = ref(false);
const tempColor = ref(props.modelValue);

const updateColor = (color: string) => {
  tempColor.value = color;
};

const confirmColor = () => {
  emit("update:modelValue", tempColor.value);
  dialog.value = false;
};
</script>
