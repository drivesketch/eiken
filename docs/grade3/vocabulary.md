---
description: 英検3級の単語900・熟語300の全1,200項目。Sectionを選び、日本語訳を隠して50項目ずつ確かめよう。
pageClass: vocabulary-page
outline: false
---

<script setup>
import { data } from './vocabulary.data'
import VocabularyStudy from '../.vitepress/theme/components/VocabularyStudy.vue'
</script>

# 英検3級 単語・熟語

英語を声に出して、意味を思い出そう。迷ったら「訳を見る」で確かめよう。

<VocabularyStudy :groups="data" />

::: details このページの使い方と収録内容
まずはSectionを選び、50項目ずつ、英語を読んで日本語の意味を答えてみましょう。
Section 1～9は単語900項目、Section 10～12は熟語300項目です。
「日本語訳を表示」をONにすると、表示中の範囲の訳をまとめて確認できます。
初期状態はOFFです。単語ごとの「訳を見る」も使えます。
分類や範囲を切り替えると、訳はもう一度隠れます。

1ページに50項目ずつ表示します。前後の矢印や範囲のメニューでページを切り替えられます。
「すべての分類」を選ぶと、全項目を番号順に50項目ずつ練習できます。
印刷時は、選択中の範囲の訳も表示されます。

参照元は `references/grade3/vocabulary/` の `パス単_3級_Section1_回答あり.pdf` ～ `パス単_3級_Section12_回答あり.pdf` 全12冊です。
各PDF前半の問題用ページと後半の解答用ページは同じ番号なので、解答用ページから一度だけ収録しています。
全60ページのうち、日本語訳のある30ページを使用しています。

| 分類 | 項目数 | 原本の番号 |
| --- | --- | --- |
| Section 1 | 100 | 1～100 |
| Section 2 | 100 | 101～200 |
| Section 3 | 100 | 201～300 |
| Section 4 | 100 | 301～400 |
| Section 5 | 100 | 401～500 |
| Section 6 | 100 | 501～600 |
| Section 7 | 100 | 601～700 |
| Section 8 | 100 | 701～800 |
| Section 9 | 100 | 801～900 |
| Section 10 | 100 | 901～1000 |
| Section 11 | 100 | 1001～1100 |
| Section 12 | 100 | 1101～1200 |

番号・順序・語義は原本に合わせています。同じ綴りでも意味が異なる項目は別々に収録しています。
波線・アポストロフィなどの表記を統一しています。
:::
