// src/composables/funkRules.ts

import { computed, inject, Ref } from 'vue';
import { AppEditorType, OmikenType } from '@type';

export function FunkRules() {
 // inject
 const AppEditor = inject<Ref<AppEditorType>>('AppEditorKey');
 const omikujis = computed(() => AppEditor?.value.Omiken.omikujis ?? {});

 // 定数
 const SWITCH_CONFIG = {
  labels: ['無効', 'だれでも', 'メンバー', 'モデレーター', '管理者'],
  colors: ['', 'yellow', 'green', 'blue', 'red']
 };

 const COLORS = {
  VERY_HIGH: 'red',
  HIGH: 'orange',
  SLIGHTLY_HIGH: 'yellow',
  MEDIUM: 'green',
  SLIGHTLY_LOW: 'cyan',
  LOW: 'blue',
  VERY_LOW: 'purple',
  ZERO: 'gray'
 };

 // switch名とカラーの取得
 const getSwitchLabel = (switchValue: number) => SWITCH_CONFIG.labels[switchValue] || 'Unknown';
 const getSwitchColor = (switchValue: number) => SWITCH_CONFIG.colors[switchValue] || '';

 // omikujiのリスト
 const omikujiLists = computed(() => {
  return Object.entries(omikujis.value || {}).map(([id, omikuji]) => ({
   id,
   name: omikuji.name,
   weight: omikuji.weight
  }));
 });

 // 有効なomikujiのリスト
 const enabledOmikujiLists = (enableIds: string[] = []) => {
  const isAllEnabled = enableIds.length === 0;
  return isAllEnabled ? omikujiLists.value : omikujiLists.value.filter((option) => enableIds.includes(option.id));
 };

 const chipColors = (enableIds: string[]) => {
  return Object.keys(omikujis).map((id) => ({
   id,
   color: weightColor.value(id, enableIds)
  }));
 };

 // weight合計を計算
 const weightTotal = computed(
  () => (enableIds: string[], rank: number) =>
   enableIds.reduce((sum, id) => {
    const item = omikujis.value[id];
    return item && item.rank === rank ? sum + (item.weight ?? 0) : sum;
   }, 0)
 );

 // totalWeightの割合を計算
 const weightPercentage = computed(() => (optionId: string, enableIds: string[]) => {
  const item = omikujis.value[optionId];
  if (!item) return 0; // 該当するエントリがない場合は0を返す
  const rank = item.rank;
  const weight = item.weight ?? 0;
  const total = weightTotal.value(enableIds, rank);

  // Thresholdがすべて空の場合、一番高いRank以外のWeightを0%とする
  if (isAllThresholdEmpty.value(enableIds)) {
   // 最も高いRankのWeight以外を0にする処理
   const maxRank = Math.max(...enableIds.map((id) => omikujis.value[id]?.rank).filter((rank) => rank !== undefined));
   if (item.rank !== maxRank) {
    return 0;
   }
  }
  return total > 0 ? parseFloat(((weight / total) * 100).toFixed(1)) : 0;
 });

 // rankの異なる種類の数を計算
 const rankCount = computed(() => (enableIds: string[]) => {
  const ranks = new Set<number>(); // ユニークなrankを保持するSet
  enableIds.forEach((id) => {
   const item = omikujis.value[id];
   if (item?.rank !== undefined) {
    ranks.add(item.rank);
   }
  });
  return ranks.size; // ユニークなrankの数を返す
 });

 // rankの順位を計算
 const rankPositions = computed(() => (enableIds: string[]) => {
  const ranks = Array.from(
   new Set(enableIds.map((id) => omikujis.value[id]?.rank).filter((rank) => rank !== undefined))
  ).sort((a, b) => a! - b!); // 重複を排除し、昇順にソート

  const rankMap: Record<number, number> = {};
  ranks.forEach((rank, index) => {
   if (rank !== undefined) {
    rankMap[rank] = index + 1; // 最も低いrankを1位とする
   }
  });

  return rankMap; // { rank値: 順位 } のオブジェクトを返す
 });

 // 現在のrankが何位かを取得
 const rankPositionGet = computed(() => (optionId: string, enableIds: string[]) => {
  const item = omikujis.value[optionId];
  if (!item) return null; // 該当するエントリがない場合はnullを返す
  const rank = item.rank;
  const rankPositionsMap = rankPositions.value(enableIds);
  return rankPositionsMap[rank] ?? null; // rankの順位を返す
 });

 // すべてのthresholdが空かどうかをチェック
 const isAllThresholdEmpty = computed(() => (enableIds: string[]): boolean => {
  // enableIdsの各omikujiをチェック
  return enableIds.every((omikujiId) => {
   const omikuji = omikujis.value[omikujiId]; // omikujiを取得
   const thresholds = omikuji?.threshold ?? []; // omikujiのthresholdを取得
   return thresholds.length === 0 || thresholds.every((threshold) => threshold === null || threshold === undefined);
  });
 });

 // v-chipに色を付与
 const weightColor = computed(() => (optionId: string, enableIds: string[]) => {
  const percentage = weightPercentage.value(optionId, enableIds);
  if (percentage === 0) return COLORS.ZERO;

  const weights = enableIds.map((id) => weightPercentage.value(id, enableIds)).filter((w) => w > 0);
  const avg = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  const std = Math.sqrt(weights.reduce((sum, w) => sum + Math.pow(w - avg, 2), 0) / weights.length);

  if (percentage >= avg + std * 2.4) return COLORS.VERY_HIGH;
  if (percentage >= avg + std * 1.6) return COLORS.HIGH;
  if (percentage >= avg + std * 0.8) return COLORS.SLIGHTLY_HIGH;
  if (percentage >= avg - std * 0.8) return COLORS.MEDIUM;
  if (percentage >= avg - std * 1.6) return COLORS.SLIGHTLY_LOW;
  if (percentage >= avg - std * 2.4) return COLORS.LOW;
  return COLORS.VERY_LOW;
 });

 // rulesのenableIds に入っているomikujiのプレースホルダーを探す
 const rulesOfPlaces = (Omiken: OmikenType, enableIds?: string[]) =>
  computed(() => {
   if (!enableIds) return Object.values(Omiken.places);

   const usedPlaceNames = enableIds
    .flatMap((id) => Omiken.omikujis[id]?.post ?? [])
    .flatMap((post) => {
     const matches = post.content?.match(/<<([^>>]+)>>/g) ?? [];
     return matches.map((m) => m.replace(/<<|>>/g, ''));
    });

   return Object.values(Omiken.places).filter((place) => usedPlaceNames.includes(place.name));
  });

 return {
  chipColors,
  switchLabels: Object.fromEntries(SWITCH_CONFIG.labels.map((label, i) => [i, label])),
  weightTotal,
  weightPercentage,
  rankCount,
  rankPositionGet,
  isAllThresholdEmpty,
  getSwitchLabel,
  getSwitchColor,
  omikujiLists,
  enabledOmikujiLists,
  weightColor,
  rulesOfPlaces
 };
}
