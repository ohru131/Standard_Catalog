# 月次規格監視：未取得規格の公式確認経路

調査日：2026-08-18

## 初回実行の取得失敗

初回の44件監視では、ISOの13件が `www.iso.org/standard/{id}.html` に対するHTTP 403、ASTM E756が `www.astm.org` に対するHTTP 403となった。JIS Webdeskおよび他のASTM Storeページは取得できている。

## 採用する公式確認経路

| 規格機関 | 対象 | 月次確認に使用する公式経路 | 判定に使用する項目 |
| --- | --- | --- | --- |
| ISO | ISO 13件 | [ISO Open Data: ISO Deliverables Metadata](https://www.iso.org/open-data.html) のJSONLines配布物 | reference、edition、publicationDate、currentStage、replacedBy、title |
| ASTM | ASTM E756-05(2017) | `https://store.astm.org/e0756-05r17.html` | 個別規格ページのtitle、description、h1、canonical URL |

## ISO Open Dataの利用根拠

ISO Open DataはISO自身が公開する機械可読なメタデータで、ISO deliverables metadataは日次更新と明記されている。公開済み又は開発中のdeliverableについて、規格番号、版、発行日、現在のstage、置換元・置換先を含む。月次監視では規格本文を複製せず、これらの公開メタデータのみを照合する。

## 安全な更新方針

規格番号・版・状態が変化した場合でも、目録の規格番号や日本語要約は自動的に書き換えない。ISO Open Dataが後継規格又はstageの変更を示した場合は、監視結果に要確認として記録し、GitHub Issueで原典確認を促す。確認日のみは、公式経路での照合成功時に自動更新する。

## 参考URL

1. https://www.iso.org/open-data.html
2. https://isopublicstorageprod.blob.core.windows.net/opendata/_latest/iso_deliverables_metadata/json/iso_deliverables_metadata.jsonl
3. https://store.astm.org/e0756-05r17.html
