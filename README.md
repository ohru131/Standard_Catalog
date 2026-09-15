# Fatigue / Index

**ASTM・ISO・JISの疲労試験、動的試験、動特性および破壊靭性規格を横断検索する静的ポータルです。**

公開サイトは [GitHub Pages][1] で閲覧できます。本リポジトリは、材料、試験領域、規格体系、キーワードから規格を絞り込み、試験計画を始めるための参照情報を提供します。規格本文そのものを転載するものではありません。

| 項目 | 内容 |
|---|---|
| 収載範囲 | ASTM・ISO・JISの疲労、動的試験、動的粘弾性、制振・減衰、破壊靭性 |
| 収載件数 | 44規格 |
| 主な対象材料 | 金属、高分子、ゴム、セラミックス、複合材料、試験システム |
| 公開先 | [ohru131.github.io/Standard_Catalog][1] |
| 自動確認 | 毎月1日 02:17 UTC（日本時間 11:17）に規格ページとリンク切れを確認 |

## 主な機能

規格番号、試験方法、材料名によるキーワード検索に加え、規格体系、試験領域、材料、関連JISの有無で規格を絞り込めます。選択した規格では、公式ScopeおよびASTMのSignificance and Useに基づく日本語要約、代表的な試験構成、主要結果、レポート記載項目を確認できます。

各詳細画面の**先頭の規格番号**は、ASTM、ISO、JISなどの公式個別規格ページへの直接リンクです。画面内には「データ自動更新日」と確認済み規格数も表示します。

詳細画面下部の**参照リンク**には、公式個別ページに加えて、日本産業標準調査会（JISC）のJIS検索、日本規格協会（JSA Webdesk）の規格検索、日本溶接協会の疲労ナレッジプラットフォーム、NIMSの疲労データシートなど、日本語で読める関連情報源を規格の体系・試験領域に応じて表示します。日本語のリンクを先に並べます。

| 表示・操作 | 内容 |
|---|---|
| 規格一覧 | 体系・試験領域・材料での絞り込みとキーワード検索 |
| 規格詳細 | 公式記述に基づく要約、試験内容・条件、結果、報告チェックリスト |
| 関連規格 | 同一テーマまたはISO/JIS対応の規格へ切替 |
| 公式原典 | 先頭の規格番号、または詳細下部のリンクから公式個別ページを開く |
| 参照リンク | 詳細下部の「参照リンク（日本語・英語）」から、JISC・日本規格協会などの日本語情報源と公式ページを開く |

## 月次の公式確認

GitHub Actionsの `Monthly official standards check` は、各規格の公式個別ページまたは公式メタデータを確認し、成功したレコードの確認日を `client/src/data/catalogue-monitor.json` に記録します。ISO規格ではISO公式オープンデータを、ASTMの一部規格ではASTM Storeの公式個別ページを確認経路として利用します。

公式ページの題名、説明、見出し、正規URL、後継規格または状態に差分が見つかった場合、本文やScope要約を自動で書き換えることはしません。変更候補を「要確認」として保存し、GitHub Issueを作成します。これにより、規格の版・廃止状態・適用範囲を原典で確認してから反映できます。

手動で確認する場合は、GitHubの **Actions** から **Monthly official standards check** を選び、**Run workflow** を実行してください。詳細は [GITHUB_PAGES.md](./GITHUB_PAGES.md) を参照してください。

## リンクの一括管理と月次のリンク切れ自動除外

画面に出るURLは、規格の公式ページも日本語の関連リンクも含めて `client/src/data/links.json` の1ファイルで一括管理します。各リンクはID、URL、表示名、言語（`ja` / `en`）、種別、説明、`pinned` を持ち、規格ごとの割り当て（`standardLinks`）、規格体系ごとの共通リンク（`authorityLinks`）、試験領域ごとの共通リンク（`categoryLinks`）で画面に展開します。URLの追加・差し替えはこのファイルだけを編集します。

`scripts/check-links.mjs` は、このレジストリの全URLに対して到達性を確認し、結果を `client/src/data/link-health.json` に記録します。HEADを拒否するサイトがあるためGETで再確認し、一時的な障害で消えないよう1回の判定につき複数回リトライします。

401・403・429（ISOなど、自動アクセスを拒否するサイト）は、サーバーが応答しておりURL自体は存在するため、リンク切れとは区別して `restricted` として記録します。失敗回数には数えず、自動非表示の対象にもしません。

| 状態 | 画面上の扱い |
|---|---|
| 到達できる | 通常どおり表示 |
| 自動確認を拒否された（401・403・429） | 表示を維持。失敗回数を加算しない |
| 連続2回（通常の月次実行では2か月）到達できない補助リンク | 参照リンク一覧から**自動的に非表示** |
| 同じ条件で到達できない公式ページ（`pinned: true`） | 一次情報への導線を残すため表示を維持し、到達できなかった旨を注記 |
| 再び到達できるようになった | 次回の確認で**自動的に再表示** |

失敗回数は実行ごとに数えます。同じ日に手動実行を繰り返すと、その回数だけ加算される点に注意してください。非表示のしきい値は `links.json` の `policy.hideAfterConsecutiveFailures` で変更できます。しきい値に達したリンクは、GitHub Issueでも通知します。

```bash
# 全リンクの死活確認（link-health.json を更新）
pnpm check:links
```

| 環境変数 | 既定値 | 内容 |
|---|---|---|
| `LINK_CHECK_ATTEMPTS` | `3` | 1リンクあたりのリトライ回数 |
| `LINK_CHECK_CONCURRENCY` | `4` | 同時確認数 |
| `LINK_CHECK_TIMEOUT_MS` | `25000` | 1リクエストのタイムアウト |
| `LINK_CHECK_FAIL_THRESHOLD` | `links.json` の設定値 | 自動非表示とする連続失敗回数 |
| `LINK_CHECK_LIMIT` | 制限なし | 先頭から確認するリンク数（動作確認用） |

## CI/CD

GitHub Actionsにより、変更内容の検証、GitHub Pagesへの公開、月次の公式確認を分離して実行します。

| ワークフロー | 実行契機 | 処理内容 |
|---|---|---|
| `Validate portal` | `main` 宛てのプルリクエスト、手動実行 | 型検査とGitHub Pages用ビルドを実行し、公開前の変更を検証 |
| `Deploy static site to GitHub Pages` | `main` へのpush、手動実行 | 型検査・静的ビルド後にGitHub Pagesへ公開 |
| `Monthly official standards check` | 毎月1日 02:17 UTC、手動実行 | 公式確認、全リンクの死活確認、確認日更新、要確認Issue作成、Pages再公開 |

> `Monthly official standards check` は差分を自動で本文へ反映しません。公式記録に変化があった場合は、GitHub Issueで確認対象として通知します。

## ローカルで実行する

Node.js 20以上とpnpmを用意して、次のコマンドを実行します。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

型検査と本番ビルドは次のとおりです。GitHub Pagesと同じ配下パスでビルドを確認する場合は、`VITE_BASE_PATH` を指定します。

```bash
pnpm check
pnpm build

# GitHub Pages用のビルド確認
VITE_BASE_PATH=/Standard_Catalog/ pnpm build
```

公式規格ページの確認スクリプトは、以下で手動実行できます。

```bash
pnpm check:standards
pnpm check:links
```

## リポジトリ構成

| パス | 役割 |
|---|---|
| `client/src/pages/Home.tsx` | 規格目録、検索・絞り込み、規格詳細の画面実装 |
| `client/src/data/catalogue-monitor.json` | 月次確認の実行日、確認結果、要確認状態 |
| `client/src/data/links.json` | 画面に出る全URLの一括管理レジストリ（編集対象） |
| `client/src/data/link-health.json` | リンク死活監視の結果と自動非表示の状態（自動生成） |
| `client/src/data/links.ts` | レジストリと死活結果を突き合わせ、表示可能なリンクだけを返す |
| `scripts/check-standards.mjs` | 公式規格ページ・公式メタデータの確認処理 |
| `scripts/check-links.mjs` | 全参照URLの死活確認とリンク切れの自動非表示判定 |
| `.github/workflows/ci.yml` | プルリクエストの型検査・GitHub Pages用ビルド |
| `.github/workflows/deploy-pages.yml` | GitHub Pagesへの静的サイト公開 |
| `.github/workflows/monthly-standards-check.yml` | 月次の公式確認、差分Issue、再公開 |
| `GITHUB_PAGES.md` | GitHub Pagesおよび月次確認の運用メモ |

## 更新時の留意事項

規格番号、版、状態、公式URL、Scope要約を更新する場合は、必ず規格機関の公式個別ページまたは公式メタデータで確認してください。自動確認の結果は、情報更新の候補を検知するためのものであり、規格の適用可否や試験の適合性を保証するものではありません。実際の試験計画では、購入・契約した規格本文、装置構成、校正、治具、計測器および試験条件を個別に確認してください。

## 参考リンク

[1]: https://ohru131.github.io/Standard_Catalog/ "Fatigue / Index — GitHub Pages"
