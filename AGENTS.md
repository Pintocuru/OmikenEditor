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
