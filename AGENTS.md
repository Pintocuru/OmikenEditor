# 保守・レビュー作業記録

## 目的
開発終了済みの本プロジェクトを安全に保守できる状態にする。新機能開発や大規模な再設計は行わず、既存仕様を維持しながら不具合と保守上の問題を把握・改善する。

## 作業ルール
- 作業対象はこのリポジトリ。関連リポジトリとの連携仕様は必要に応じて照合する。
- まず全体構成・ビルド・テスト・データ連携を把握し、その後に機能単位でレビューする。
- 不具合、未使用コード、依存関係、保守性の問題を区別して記録する。
- 未使用の疑いだけで削除しない。動的参照、設定、外部アプリからの利用を確認する。
- 既存仕様を推測で変更しない。不明点は「未確認」として残す。
- 修正は小さく分割し、可能な範囲でビルド・テスト・静的解析を実行する。
- 破壊的変更、依存パッケージの大規模更新、データ形式変更は事前に影響を確認する。
- 作業の区切りごとに、このファイルの「進捗」と「発見事項」を更新する。
- main には直接 push しない。作業ブランチ `maintenance/review-and-stabilization` を使用する。
- レビュー結果は重要度（Critical / High / Medium / Low）と確度を付けて記録する。

## 作業計画
1. リポジトリ構成・履歴・実行環境・依存関係の調査
2. ビルド／テストの再現性確認と現状ベースライン作成
3. ディレクトリ・機能単位のコードレビュー
4. 未使用コード・依存パッケージの利用状況調査
5. 問題の優先順位付けと小規模修正
6. 検証・残課題・保守手順の整理

## 進捗
- [x] リポジトリの存在、公開状態、既定ブランチを確認
- [x] ルート構成と主要ソース構成を取得
- [x] 保守作業ブランチを作成
- [ ] ビルド・テストのベースライン確認
- [ ] 機能別レビュー
- [ ] 未使用コード・依存関係レビュー
- [ ] 修正・検証

## 初期確認事項
- 既定ブランチ: `main`
- 作業開始時の main SHA: `952334e4cb8867c2909785e903639ebac84aee34`
- 作業ブランチ: `maintenance/review-and-stabilization`
- ルートに既存の AGENTS.md は存在しなかった。
- コード検索インデックス経由の検索結果は得られなかったため、Git Trees API と個別ファイル取得を使って調査を継続する。

## 発見事項
（調査結果を根拠・対象ファイルとともに追記する）

## 初期レビュー記録（静的確認・未検証）
- ファイル名の大文字小文字と import 指定に不一致が複数見られる。例: `src/App.vue` は `FunkOmiken` を import するが実ファイルは `src/composables/funkOmiken.ts`。`funkJSON.ts` / `funkValidate.ts` 等も大文字表記で import されている箇所がある。Windowsでは解決しても大文字小文字を区別する環境でビルドに失敗する可能性が高いため、全体を照合する。
- `src/composables/funkValidate.ts`: 入力データの各項目を直接変更してからZod parseしている箇所がある。呼び出し元の状態共有・副作用を確認する。
- `src/composables/FunkOmikenUpdater.ts`: `addRuleToTypes` が `some()` 内で `ids.push()` を実行している。最初に該当したカテゴリへ追加する仕様か、カテゴリの重複・誤追加がないか確認する。
- `src/types/OmikenSchemas.ts`: `thresholdCountRangeSwap` は `superRefine` 内でコピーした値を書き換えているが、Zodの `superRefine` は変換結果を返す仕組みではない。range値の補正が実際に反映されるか、バリデーションテストで確認する。
- これらはソース上の懸念であり、実行再現・仕様確認前の確定バグとは扱わない。


## ベースライン調査（2026-11-13）
- package.json の dev はVite、build はWebpackを実行する。vite.config.mjs と webpack.config.mjs は異なる出力目的を持つ設定に見えるため、単純な重複・未使用とは扱わない。Webpackは dist/editor.html とEditor配下の成果物を生成する構成で、Viteは開発サーバー用の設定を含む。
- package-lock.json と yarn.lock が併存している。どちらを正式な依存管理に使っていたか未確認。依存更新は行わず、ロック内容と履歴を照合する。
- src/App.vue は @/composables/FunkOmiken・FunkUI を import しているが、ツリー上の実ファイル名は funkOmiken.ts・funkUI.ts。src/composables/funkJSON.ts も FunkValidate を import する一方、実ファイルは funkValidate.ts。大文字小文字を区別する環境での解決失敗リスクがある（確度: 高）。関連する全importの照合が必要。
- README.md は「編集中」の記載を含み、説明内のビルド手順・依存一覧が現行 package.json と一致しない。ドキュメント品質の問題として記録し、動作確認後に更新候補とする。
- Git Trees API上のソースファイル数は69。GitHub Actions workflow定義は見当たらず、自動検証は未確認。

## 進捗更新
- [x] package scripts・主要ビルド設定・ソース配置の静的照合
- [ ] ローカル実行環境でのビルド／テスト実行（GitHub上のファイル参照のみでは実行結果を確認できない）


## 修正（2026-11-13）
- 大文字小文字が一致していなかった composable import 5箇所を修正。対象: `src/App.vue`（FunkOmiken/FunkUI）、`src/composables/FunkOmikenUpdater.ts`（FunkValidate）、`src/composables/funkJSON.ts`（FunkValidate）、`src/composables/funkOmiken.ts`（FunkJSON）。実ファイル名に合わせた。
- これにより確認済みの5箇所は解消。ほかのディレクトリに同種の不一致が残っていないかは未確認。
- GitHub 上でソースを更新した段階。ローカルでのWebpack build / Vite起動 / TypeScript検証は未実施。

## 進捗更新
- [x] 確認済みのcomposable import casing不一致を修正
- [ ] src全体のimport casing照合
- [ ] Webpack build / Vite起動 / TypeScript検証


## 追加修正・レビュー（2026-11-13）
- `src/types/OmikenSchemas.ts`: count条件の範囲補正を `superRefine` から `transform` に変更。Zodのrefinementは戻り値を変換結果として採用しないため、これまで範囲の値入れ替え・value2補完・非range時のvalue2削除が出力に反映されていなかった問題を修正。
- 同ファイル: count.unit enumをプラグイン側の型およびエディターの選択肢に合わせて修正。従来は `totalDraws` / `gameTotalDraws` / `interval` がUIに表示されるのにschemaで拒否され、逆にプラグインが扱わない `intvlSec` がschemaで許可されていた。これにより保存・再読込時にcount条件がデフォルト化する不整合を解消する。
- `OmikenValidate` は全体の検証で例外が起きると空の初期データを返す実装。壊れた既存データを空データとして開き、そのまま保存すると元データを失う危険がある。意図的な復旧動作か、エラー表示して保存を止めるべきかは未確認。現時点では変更しない。
- schema修正の実行時テスト・Webpack buildは未実施。


## import casing調査の追加結果（2026-11-13）
- src配下のVueコンポーネント34件、composables、型定義、main/config等のimport指定を実ファイル名と照合。
- composableの大文字小文字不一致は合計15箇所確認し、すべて実ファイル名に合わせて修正。今回の静的照合範囲では残件なし。
- src/AppTest.ts はアプリからimportされず、exportもない。ファイルコメントはJSONデータ作成用と説明しているため、開発用補助ファイルの可能性があり削除しない。
- ルートの webpackENV.js はpackage scriptおよび確認したWebpack/Vite設定から参照されていないように見えるが、外部手順で利用される可能性は未確認。削除保留。

## 進捗更新
- [x] src内のimport casing照合と確認済み15箇所の修正
- [ ] 未使用候補（AppTest.ts / webpackENV.js）の利用実態確認


## データ保護の修正（2026-11-13）
- `src/composables/funkValidate.ts`: Omiken全体の検証に失敗した際、空の初期データを返す処理を廃止。エラーを呼び出し元へ返し、AppEditorFetchが失敗扱いにすることで、空データのまま保存される経路を遮断。
- 同ファイル: 新規項目の検証失敗時も空オブジェクトへの再parseを試みず、エラーを呼び出し元へ返す。
- 同ファイル: Omikuji/RuleのplaceIds・enableIds・thresholdの正規化で入力オブジェクトを直接変更していたため、コピーを作成してから検証するよう変更。
- エラー発生時はAppEditorInitializeがエラーダイアログを表示し、ローディング状態を維持する。空の初期データを表示して保存可能にする変更は行っていない。
- スキーマ内部には個別フィールドを既定値へ補正する `.catch()` が残る。これらは既存データとの互換性に関わるため、別途フィールド単位で影響調査する。
- package.jsonにテスト実行スクリプト・テストフレームワークがなく、今回の変更の自動テストは未追加。Webpack build / Vite起動も未検証。

- `OmikenTypesValidate` でも、カテゴリ配列を正規化する前に `typesSchema.parse()` を通すよう修正。欠損した `unused` 等がある場合に、後段でundefinedを展開して例外になる経路を避け、型定義に従って検証する。
- テスト基盤・実行スクリプトがpackage.jsonにないことを確認。自動テスト未実施。検証失敗時の全体データ保護はコード上の経路で修正したが、実動作は未確認。


## 追加レビュー・修正（2026-11-13）
- `src/composables/FunkOmikenUpdater.ts`: おみくじ追加時、`optionId` が指すルールが既に削除されている／存在しない場合、`state.rules[optionId].enableIds` の参照で例外になる経路を確認。
- 対象ルールの存在を確認し、存在しない場合は警告を出して追加処理を中断するよう修正。おみくじ自体の登録は維持し、存在しないルールを暗黙に生成したり、別カテゴリへ誤登録したりしない。
- 確度: 高（静的に例外経路を確認）。実行テストは未実施。


## スキーマのデータ保護修正（2026-11-13）
- `src/types/OmikenSchemas.ts`: threshold全体、rule/omikujiのthreshold配列、omikujiのpost配列、place.values配列に設定されていた構造単位の`.catch()`を除去。
- これらは内部の一部データが不正な場合、条件一式・投稿一式・プレースホルダー値一式を既定値や空配列へ置き換えるため、読込後に保存すると設定を失う可能性があった。検証エラーを上位へ伝播させ、App側の読込失敗処理で止める。
- 個別フィールドの`.default()` / `.catch()`は旧データ互換性への影響があるため今回維持。個別項目の補正範囲は別途調査する。
- 確度: 高（Zodスキーマの静的挙動）。既存データ全件での互換性確認・実行テストは未実施。


## ID正規化・重複保護（2026-11-13）
- `src/composables/funkValidate.ts`: Places / Omikujis / Rulesの辞書キーを、Zod parse前の`item.id`で決めていた。ID欠損時はschemaがparse後にIDを生成するため、辞書キーが`undefined`や空文字になり、内部IDとの不整合が発生し得る。
- 各項目を先にschema parseし、変換後の`parsedItem.id`を辞書キーに使用するよう修正。
- 同一IDが複数項目に存在する場合、後続データが先行データを無言で上書きするため、重複を検出して検証エラーにするよう変更。
- 確度: 高（Zod default/transformとreduce処理の静的確認）。実データでの再現・テストは未実施。
