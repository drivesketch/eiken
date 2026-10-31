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
- `docs/grade4/review.md`：4級の復習教材。全12課で、説明・本文・日本語訳・質問・言い換え・自分の話・解答をそろえています。
- `docs/grade5/vocabulary.md`：5級の単語学習ページ。訳の個別・一括表示、分類の切り替えに対応。1ページ50項目で固定。
- `content/grade5/vocabulary.md`：単語学習の元データ。番号・英語・日本語のMarkdown表で全600項目を管理します。サイトのページにはなりません。
- `docs/grade4/vocabulary.md`：4級の単語学習ページ。5級と同じ共通コンポーネントを使います。
- `content/grade4/vocabulary.md`：4級の元データ。全700項目を管理し、参照PDF間の同じ番号の重複は一度だけ収録します。
- `docs/grade3/vocabulary.md`：3級の単語学習ページ。Sectionの選択、訳の表示切り替えに対応。1ページ50項目で固定。
- `content/grade3/vocabulary.md`：3級の元データ。単語900・熟語300の全1,200項目を12SectionのMarkdown表で管理します。参照PDF前半の問題用ページは重複収録しません。
- `references/`：教材作成のための参照資料。Gitとサイトの対象外。
- `context.md`：制作方針。サイトの対象外。

教材を追加する場合は `docs/` に `.md` ファイルを置き、トップページと設定ファイルのメニューにリンクを追加します。見出しは `#` をページ名、`##` を大きな区切り、`###` を練習項目に使います。

単語・訳の修正は、対象級の `content/grade5/vocabulary.md`・`content/grade4/vocabulary.md`・`content/grade3/vocabulary.md` を編集します。各級の `vocabulary.data.ts` から共通の `docs/.vitepress/vocabulary-loader.ts` を使ってビルド時に表を読み取り、分類別の件数と番号の連続性を検証します。重複・欠番・空欄があるとビルドは失敗します。学習画面は共通の `VocabularyStudy.vue` で表示し、PDF自体は配信しません。

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

## 文型・語法の画面切り替え

復習教材は各級1つの `review.md` のまま編集します。ウェブでは番号ボタンから課を選び、本文末尾の課名付きリンクで前後へ移動できます。使い方・進め方は補助リンクから開けます。各課の解答は折りたたみで表示されます。「全体を読む・印刷」でまとめて表示し、「1課ずつ読む」で戻れます。印刷したい解答や日本語訳は先に開いてください。

表示の分割は `docs/.vitepress/workbook-pages.ts`、操作画面は `WorkbookPager.vue` が担当します。`## Passage N` / `## Lesson N` と、`## Answer Key` 内の対応する `### Passage N` / `### Lesson N` を番号で対応付けています。
