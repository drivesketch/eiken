# 英語の練習帳

Markdown + VitePress + GitHub Pages で管理する個人用教材です。

## ローカルで読む・編集する

Node.js 22以降を用意し、このフォルダで実行します。

```sh
npm ci
npm run docs:dev
```

表示されたローカルURLをブラウザで開きます。`docs/` のMarkdownやCSSを保存すると表示に反映されます。終了は `Ctrl+C` です。

```sh
npm run docs:build
npm run docs:preview
```

上記は配信用ファイルを生成し、その仕上がりを確認するコマンドです。

## 配置

- `docs/`：ウェブに掲載するMarkdown。ここに置いたページは、メニューに載せなくても配信されます。
- `docs/.vitepress/config.mts`：サイト名・メニュー・目次・検索の設定。
- `docs/.vitepress/theme/custom.css`：ブラウザ表示と印刷のCSS。
- `docs/grade5/review.md`：5級の復習教材。今後の教材も級別フォルダに配置します。
- `references/`：教材作成のための参照資料。Gitとサイトの対象外。
- `context.md`：制作方針。サイトの対象外。

教材を追加する場合は `docs/` に `.md` ファイルを置き、トップページと設定ファイルのメニューにリンクを追加します。見出しは `#` をページ名、`##` を大きな区切り、`###` を練習項目に使います。

## GitHub Pagesの初回設定

1. GitHubでリポジトリを作成します。既存のローカル履歴を使うので、README等の自動作成は選びません。
2. このフォルダの変更を確認してコミットし、リポジトリを接続します。

```sh
git add .
git commit -m "VitePressとGitHub Pagesを設定"
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

`OWNER` と `REPOSITORY` は実際の値に置き換えてください。すでに `origin` がある場合は追加不要です。

3. GitHubのリポジトリで **Settings → Pages → Build and deployment → Source → GitHub Actions** を選択します。
4. **Actions → Deploy VitePress to GitHub Pages → Run workflow** で初回配信を実行します。
5. 成功すると **Settings → Pages** とActionsのデプロイ結果に閲覧URLが表示されます。

以降は `main` にpushすると自動更新されます。公開先のサブパスはActionsが自動設定するため、リポジトリ名を変更しても設定の書き換えは不要です。

通常のGitHub PagesはURLを知る人が閲覧できます。非公開リポジトリからのPages利用には対応するGitHubプランが必要です。検索を避けるため `noindex, nofollow` を付けていますが、アクセス制限ではありません。

## 公式ドキュメント

- https://vitepress.dev/guide/deploy
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
