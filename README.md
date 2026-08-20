# Fatigue / Index

**ASTM・ISO・JISの疲労試験、動的試験、動特性および破壊靭性規格を横断検索する静的ポータルです。**

公開サイトは [GitHub Pages][1] で閲覧できます。本リポジトリは、材料、試験領域、規格体系、キーワードから規格を絞り込み、試験計画を始めるための参照情報を提供します。規格本文そのものを転載するものではありません。

| 項目 | 内容 |
|---|---|
| 収載範囲 | ASTM・ISO・JISの疲労、動的試験、動的粘弾性、制振・減衰、破壊靭性 |
| 収載件数 | 44規格 |
| 主な対象材料 | 金属、高分子、ゴム、セラミックス、複合材料、試験システム |
| 公開先 | [ohru131.github.io/Standard_Catalog][1] |
| 自動確認 | 毎月1日 02:17 UTC（日本時間 11:17） |

## 主な機能

規格番号、試験方法、材料名によるキーワード検索に加え、規格体系、試験領域、材料、関連JISの有無で規格を絞り込めます。選択した規格では、公式ScopeおよびASTMのSignificance and Useに基づく日本語要約、代表的な試験構成、主要結果、レポート記載項目を確認できます。

各詳細画面の**先頭の規格番号**は、ASTM、ISO、JISなどの公式個別規格ページへの直接リンクです。画面内には「データ自動更新日」と確認済み規格数も表示します。

| 表示・操作 | 内容 |
|---|---|
| 規格一覧 | 体系・試験領域・材料での絞り込みとキーワード検索 |
| 規格詳細 | 公式記述に基づく要約、試験内容・条件、結果、報告チェックリスト |
| 関連規格 | 同一テーマまたはISO/JIS対応の規格へ切替 |
| 公式原典 | 先頭の規格番号、または詳細下部のリンクから公式個別ページを開く |

## 月次の公式確認

GitHub Actionsの `Monthly official standards check` は、各規格の公式個別ページまたは公式メタデータを確認し、成功したレコードの確認日を `client/src/data/catalogue-monitor.json` に記録します。ISO規格ではISO公式オープンデータを、ASTMの一部規格ではASTM Storeの公式個別ページを確認経路として利用します。

公式ページの題名、説明、見出し、正規URL、後継規格または状態に差分が見つかった場合、本文やScope要約を自動で書き換えることはしません。変更候補を「要確認」として保存し、GitHub Issueを作成します。これにより、規格の版・廃止状態・適用範囲を原典で確認してから反映できます。

手動で確認する場合は、GitHubの **Actions** から **Monthly official standards check** を選び、**Run workflow** を実行してください。詳細は [GITHUB_PAGES.md](./GITHUB_PAGES.md) を参照してください。

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
```

## リポジトリ構成

| パス | 役割 |
|---|---|
| `client/src/pages/Home.tsx` | 規格目録、検索・絞り込み、規格詳細の画面実装 |
| `client/src/data/catalogue-monitor.json` | 月次確認の実行日、確認結果、要確認状態 |
| `scripts/check-standards.mjs` | 公式規格ページ・公式メタデータの確認処理 |
| `.github/workflows/deploy-pages.yml` | GitHub Pagesへの静的サイト公開 |
| `.github/workflows/monthly-standards-check.yml` | 月次の公式確認、差分Issue、再公開 |
| `GITHUB_PAGES.md` | GitHub Pagesおよび月次確認の運用メモ |

## 更新時の留意事項

規格番号、版、状態、公式URL、Scope要約を更新する場合は、必ず規格機関の公式個別ページまたは公式メタデータで確認してください。自動確認の結果は、情報更新の候補を検知するためのものであり、規格の適用可否や試験の適合性を保証するものではありません。実際の試験計画では、購入・契約した規格本文、装置構成、校正、治具、計測器および試験条件を個別に確認してください。

## 参考リンク

[1]: https://ohru131.github.io/Standard_Catalog/ "Fatigue / Index — GitHub Pages"
