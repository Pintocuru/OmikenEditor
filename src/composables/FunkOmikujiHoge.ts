// pinia:OmikenStore
const { getOmikenItems, getOmikenPresets, getRulesAll } = useOmikenStore();

const Scripts = computed(() => getOmikenPresets('Scripts') || {});

// アドオンのパラメータを取得する
function getScriptParams(omikujiId: string): Record<string, ScriptParam<ParamType>[]> | null {
 const matchedRules = ruleCategories.flatMap((category) =>
  Object.values(getRulesAll()[category]).filter((rule) => rule.enables.some((enable) => enable.omikujiId === omikujiId))
 );

 const scriptIds = matchedRules
  .map((rule) => rule.script?.scriptId)
  .filter((scriptId): scriptId is string => scriptId !== undefined);
 if (scriptIds.length === 0) return null;

 return scriptIds.reduce(
  (acc, id) => {
   const script = Scripts.value[id];
   if (script) acc[id] = script.params;
   return acc;
  },
  {} as Record<string, ScriptParam<ParamType>[]>
 );
}

function getScriptParam(omikujiId: string): Array<ScriptParam<ParamType>> | null {
 const matchedRules = ruleCategories.flatMap((category) =>
  Object.values(getRulesAll()[category]).filter((rule) => rule.enables.some((enable) => enable.omikujiId === omikujiId))
 );
 const scriptId = matchedRules[0].script?.scriptId;
 // マッチしたrule.enablesが1つでない場合は設定できない
 if (matchedRules.length !== 1 || !scriptId) return null;
 return Scripts.value[scriptId].params ?? null;
}

function matchScriptIds(omikujiId: string): string[] | null {
 const matchedRules = ruleCategories.flatMap((category) =>
  Object.values(getRulesAll()[category]).filter((rule) => rule.enables.some((enable) => enable.omikujiId === omikujiId))
 );
 const scriptIds = matchedRules
  .map((rule) => rule.script?.scriptId)
  .filter((scriptId): scriptId is string => scriptId !== undefined);

 return scriptIds.length > 0 ? scriptIds : null;
}

function getMatchedParams(ids: string[]): Record<string, ScriptParam<ParamType>[]> {
 const matchedParams: Record<string, ScriptParam<ParamType>[]> = {};

 ids.forEach((id) => {
  const script = Scripts.value[id];
  if (script) {
   matchedParams[id] = script.params;
  }
 });

 return matchedParams;
}
