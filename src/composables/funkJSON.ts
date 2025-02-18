// src/composables/funkJSON.ts
import { DataType, Mode, AppEditorType, OmikenType, ParamsType } from '@type';
import { configs } from '@/config';
import { MySwal } from '@/components/common/partsMySwal';
import { OmikenValidate } from '@/composables/FunkValidate';
import OneSDK from '@onecomme.com/onesdk';

// Omikenの保存
export async function saveOmiken(Omiken: OmikenType): Promise<void> {
 try {
  // 確認ダイアログを表示
  const result = await MySwal.fire({
   title: '保存しますか？',
   text: 'プラグインデータを更新します。よろしいですか？',
   icon: 'warning',
   showCancelButton: true,
   confirmButtonText: 'はい',
   cancelButtonText: 'キャンセル'
  });

  // ユーザーが「はい」を選択した場合のみ保存を実行
  if (result.isConfirmed) {
   await ApiClient.request({ method: 'POST', mode: Mode.Backup, type: DataType.Omiken }, Omiken);

   // 保存成功メッセージ
   await MySwal.fire({
    title: '保存したよ',
    text: 'データの保存に成功したよ。',
    icon: 'success',
    confirmButtonText: 'OK'
   });
  }
 } catch (error) {
  // 保存失敗メッセージ
  console.error('Error saving data:', error);
  await MySwal.fire({
   title: '保存失敗',
   text: 'データの保存に失敗しました。' + error,
   icon: 'error',
   confirmButtonText: 'OK'
  });
 }
}

// メインのデータサービス
export async function AppEditorFetch(): Promise<AppEditorType> {
 try {
  const response = await ApiClient.request({ method: 'GET', mode: Mode.AllData });
  const data = JSON.parse(response);

  return {
   Presets: data.Presets,
   Charas: data.Charas,
   Scripts: data.Scripts,
   Omiken: OmikenValidate(data.Omiken)
  };
 } catch (error) {
  if (error instanceof ApiError) console.error('API Error:', error);
  throw error;
 }
}

// APIクライアント
class ApiClient {
 private static readonly baseUrl = `http://localhost:11180/api/plugins/${configs.PLUGIN_UID}`;

 static async request<T extends ParamsType>(params: T, data?: object): Promise<string> {
  const config = {
   headers: { 'Content-Type': 'application/json' },
   data: data || {}
  };

  const url = `${this.baseUrl}?mode=${params.mode}&type=${params.type || ''}`;

  try {
   const response = params.method === 'GET' ? await OneSDK.get(url, {}) : await OneSDK.post(url, config);

   this.validateResponse(response, params.type);
   return response.data.response;
  } catch (error) {
   throw new ApiError(params.method, params.mode, params.type, error);
  }
 }

 // わんコメが起動していない・プラグインが切られた等でデータが帰ってこないなら致命的なエラー
 private static validateResponse(response: any, type: string = ''): void {
  if (!response.data || response.data.code !== 200) {
   throw new ApiError('VALIDATION', '', type, 'Invalid response');
  }
 }
}

// カスタムエラークラス
class ApiError extends Error {
 constructor(
  public method: string,
  public mode: string,
  public type: string = '',
  public originalError: unknown
 ) {
  super(`API Error: ${method} ${mode} ${type}`);
  this.name = 'ApiError';
 }
}
