# GitHub Pages と月次規格確認

このリポジトリは、`main` ブランチへの反映時に GitHub Pages 用の静的サイトをビルドします。月次ワークフローは、毎月1日の 02:17 UTC に各規格の公式個別ページを確認し、成功したレコードの確認日を `client/src/data/catalogue-monitor.json` に記録します。

公式ページの題名、説明、見出し又は正規URLに変化がある場合は、サイトの規格本文を自動で書き換えず、監視データに「要確認」として保持し、GitHub Issueを作成します。これにより、版、廃止状態、Scope要約を原典で確認する前に誤って反映することを避けます。問題がない場合も、確認日が毎月更新されます。公式サイト側のアクセス制限で取得できなかった規格は、確認日を更新せず、「未取得」としてIssueに記録します。

手動実行は、GitHubの **Actions** から **Monthly official standards check** を選び、**Run workflow** を実行します。初回はリポジトリの **Settings → Pages → Build and deployment** で **GitHub Actions** を選択してください。
