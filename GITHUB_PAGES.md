# GitHub Pages と月次規格確認

このリポジトリは、`main` ブランチへの反映時に GitHub Pages 用の静的サイトをビルドします。月次ワークフローは、毎月1日の 02:17 UTC に各規格の公式個別ページを確認し、成功したレコードの確認日を `client/src/data/catalogue-monitor.json` に記録します。

公式ページの題名、説明、見出し又は正規URLに変化がある場合は、サイトの規格本文を自動で書き換えず、監視データに「要確認」として保持し、GitHub Issueを作成します。これにより、版、廃止状態、Scope要約を原典で確認する前に誤って反映することを避けます。問題がない場合も、確認日が毎月更新されます。公式サイト側のアクセス制限で取得できなかった規格は、確認日を更新せず、「未取得」としてIssueに記録します。

手動実行は、GitHubの **Actions** から **Monthly official standards check** を選び、**Run workflow** を実行します。初回はリポジトリの **Settings → Pages → Build and deployment** で **GitHub Actions** を選択してください。

## 初回設定の確認記録

GitHub Pagesの公開元はGitHub Actionsに設定済みです。初回の公開ワークフローは、公開元の有効化後に手動実行して結果を確認します。ワークフロー実行時にpnpmの複数バージョン指定エラーが出る場合は、`pnpm/action-setup` 側の固定バージョンを削除し、`package.json` の `packageManager` 指定を唯一のバージョン情報として扱います。

ISO Open DataとASTM Storeの公式代替確認経路を追加後、44件すべてで公式確認に成功した。規格の版・状態が自動で書き換わった件数は0件であり、後継規格又は状態変更が検出された場合のみ、確認を要するGitHub Issueとして記録する。
