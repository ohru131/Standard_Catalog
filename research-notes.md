# 規格データ調査メモ

## 検索・参照方針

- ポータルは**規格本文の代替ではなく、規格探索と対応関係の入口**として設計する。
- 規格番号、版、題名、対応関係は公式規格機関または公式販売サイトの公開メタデータを優先して確認する。
- ISOとJIS、ASTMの試験条件は同一であると断定せず、「参考対応」「内容確認要」の表現を用いる。

## 2026-08-17時点の一次・準一次確認候補

| 系統 | 規格 | 確認できた主題 | 出典 |
| --- | --- | --- | --- |
| ISO | ISO 1099:2006 | 金属材料の疲労試験、軸力制御法 | ISO OBP 検索結果： https://www.iso.org/obp/ui/#iso:std:iso:1099:ed-2:v1:en |
| ISO | ISO 12106:2017 | 金属材料の疲労試験、軸ひずみ制御法 | ISO OBP： https://www.iso.org/obp/ui/#iso:std:iso:12106:ed-1:en |
| ASTM | ASTM E466 | 一定振幅・軸方向・力制御疲労試験 | ASTM Fatigue Standards 集約ページ： https://store.astm.org/products-services/standards-and-publications/standards/fatigue-standards-and-fracture-standards.html |
| ASTM | ASTM E606/E606M-21 | ひずみ制御疲労試験 | ASTM Fatigue Standards 集約ページ： https://store.astm.org/products-services/standards-and-publications/standards/fatigue-standards-and-fracture-standards.html |
| ASTM | ASTM E647-24 | 疲労き裂進展速度測定 | ASTM Fatigue Standards 集約ページ： https://store.astm.org/products-services/standards-and-publications/standards/fatigue-standards-and-fracture-standards.html |
| JIS | JIS Z 2289:2026 | 金属材料の軸力制御疲労試験方法 | JSA Webdesk 検索結果： https://webdesk.jsa.or.jp/books/W11M0090/ |
| JIS | JIS Z 2279:1992 | 金属材料の高温低サイクル疲労試験方法 | 規格公開情報： https://kikakurui.com/z2/Z2279-1992-01.html |

## ブラウザ確認ログ

- `iso.org/standard/38900.html` はISO 1099ではなく ISO 11079:2007 を表示したため、掲載根拠には使用しない。
- ISO OBP のハッシュURLはブラウザの初回画面では本文を展開できなかったため、出典として保存しつつ、規格の要約・版は複数の公開メタデータで突合する。
- ASTMの公式集約ページでは、E466-21、E606/E606M-21、E647-24、E467-21、E468/E468M-23a、E2948-24、E2368-25、E2714-26、E2207-15(2021)、E1049-85(2023)、E1823-26の題名・版を確認した。
- 経済産業省の2026年3月JIS制定・改正告知は、当月に12件の制定・81件の改正があったことを示す。掲載するJIS Z 2289:2026の詳細はJSAの公開商品メタデータで二重確認する。

## 初期収載データの設計

| ID | 区分 | 規格番号 | 掲載題名 | 試験テーマ | 対応・関連JIS | 関係の扱い |
| --- | --- | --- | --- | --- | --- | --- |
| ASTM-01 | ASTM | ASTM E466-21 | Force Controlled Constant Amplitude Axial Fatigue Tests of Metallic Materials | 軸力・応力制御 | JIS Z 2289:2026 | 方法領域が近い。完全一致は原典確認。 |
| ASTM-02 | ASTM | ASTM E606/E606M-21 | Strain-Controlled Fatigue Testing | 軸ひずみ制御／低サイクル | JIS Z 2279:1992 | 高温低サイクル領域の関連規格。 |
| ASTM-03 | ASTM | ASTM E647-24 | Measurement of Fatigue Crack Growth Rates | 疲労き裂進展 | — | き裂進展の代表規格。 |
| ASTM-04 | ASTM | ASTM E467-21 | Verification of Constant Amplitude Dynamic Forces in an Axial Fatigue Testing System | 動的力の検証 | JIS Z 2289:2026 | 試験系の検証に関連。 |
| ASTM-05 | ASTM | ASTM E468/E468M-23a | Presentation of Constant Amplitude Fatigue Test Results for Metallic Materials | 結果整理・表示 | JIS Z 2289:2026 | 結果の提示に関連。 |
| ASTM-06 | ASTM | ASTM E2207-15(2021) | Strain-Controlled Axial-Torsional Fatigue Testing with Thin-Walled Tubular Specimens | 軸ねじり複合負荷 | — | 複合動的負荷。 |
| ASTM-07 | ASTM | ASTM E2948-24 | Rotating Bending Fatigue Tests of Solid Round Fine Wire | 回転曲げ | JIS Z 2274:2024 | 回転曲げ領域の関連規格。 |
| ASTM-08 | ASTM | ASTM E2368-25 | Strain Controlled Thermomechanical Fatigue Testing | 熱機械疲労 | — | 温度連成。 |
| ASTM-09 | ASTM | ASTM E2714-26 | Creep-Fatigue Testing | クリープ疲労 | — | 高温・時間依存。 |
| ISO-01 | ISO | ISO 1099:2017 | Metallic materials — Fatigue testing — Axial force-controlled method | 軸力制御 | JIS Z 2289:2026 | 同一テーマ。ISO対応程度は原典確認。 |
| ISO-02 | ISO | ISO 12106:2017 | Metallic materials — Fatigue testing — Axial-strain-controlled method | 軸ひずみ制御 | JIS Z 2279:1992 | 低サイクル／高温領域の関連JIS。 |
| ISO-03 | ISO | ISO 1143:2021 | Metallic materials — Rotating bar bending fatigue testing | 回転曲げ | JIS Z 2274:2024 | 整合作業の公開情報あり。採用程度は原典確認。 |
| ISO-04 | ISO | ISO 12111:2011 | Metallic materials — Fatigue testing — Strain-controlled thermomechanical fatigue testing method | 熱機械疲労 | — | ASTM E2368と同一試験領域。 |
| JIS-01 | JIS | JIS Z 2289:2026 | 金属材料の軸力制御疲労試験方法 | 軸力制御 | ISO 1099:2017 | ISO対応の詳細は規格票で確認。 |
| JIS-02 | JIS | JIS Z 2274:2024 | 金属材料の回転曲げ疲労試験方法 | 回転曲げ | ISO 1143:2021 | 整合の公開説明あり。 |
| JIS-03 | JIS | JIS Z 2279:1992 | 金属材料の高温低サイクル疲労試験方法 | 高温低サイクル | ISO 12106:2017 | 試験領域の関連。完全一致は原典確認。 |

## 実装時の掲載ルール

1. カードには「区分」「材料」「制御方式」「規格番号」「版」「対応JIS」を明示する。
2. 対応JISが最新版ISOへの完全一致であると確認できない場合は「関連JIS」「原典で要確認」と表示する。
3. 詳細パネルに適用範囲の短い要約と、一次・準一次の公式参照リンクを配置する。

## 動特性規格の追加調査（2026-08-17）

| 規格 | 個別公式ページ | 確認できた内容 | 掲載上の扱い |
| --- | --- | --- | --- |
| ASTM E1876-22 | https://store.astm.org/e1876-22.html | 衝撃加振法による動的ヤング率、剛性率、ポアソン比の測定 | セラミックス・金属等を含む弾性材料向けの共振法として追加 |
| ASTM E756-05(2017) | https://store.astm.org/e0756-05r17.html | 制振特性、損失係数、ヤング率又はせん断弾性率を扱う。周波数範囲は50–5000 Hz | 制振・損失係数の動特性として追加 |
| ASTM D4065-20 | https://store.astm.org/d4065-20.html | プラスチックの弾性率・損失弾性率を温度、周波数又は時間の関数として扱う | 高分子・プラスチックDMAとして追加 |
| ISO 6721-2:2019 | https://www.iso.org/standard/73143.html | ISO 6721-2:2008の後継。プラスチックのねじり振り子法による動的機械特性 | ISO 6721系列の現行版として追加 |
| JIS K 7244-1:1998 | https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+K+7244-1%3A1998 | 硬質プラスチックの線形粘弾性領域における動的機械特性の共通事項 | ISO 6721系列に関連するJISとして追加 |

### 公式ページ確認時の注意

- ISO 6721-2:2008の個別公式ページ（https://www.iso.org/standard/43492.html）は**Withdrawn**で、ISO 6721-2:2019への改訂を明示している。そのためポータルでは2019年版の個別公式ページを優先する。
- ASTM E756-05(2017)の個別公式ページは、損失係数、ヤング率又はせん断弾性率を測定対象とし、金属、セラミックス、ゴム、プラスチック、強化エポキシ、木材などに言及している。材料フィルタは「主対象」と「適用可能な材料」を混同しないよう、レコードの主対象で分類する。
- ISO 1143:2021の個別公式ページ（https://www.iso.org/standard/79575.html）は、金属材料の回転棒曲げ疲労試験を対象とし、空気中の室温又は高温での試験を示す。ポータルのISO 1143リンクはこの個別ページへ更新する。

## 個別公式ページへのURL更新方針

| 規格体系 | URLの表記規則 | 例 |
| --- | --- | --- |
| ASTM | `store.astm.org` の規格番号別ページ | https://store.astm.org/e1876-22.html |
| ISO | `iso.org/standard/{標準ID}.html` の規格別ページ | https://www.iso.org/standard/79575.html |
| JIS | `webdesk.jsa.or.jp` の `bunsyo_id` を持つ規格別ページ | https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+K+7244-1%3A1998 |

集約ページ、委員会カタログ、検索結果ページはレコードの参照先として用いず、各規格の公式個別ページを優先する。個別ページを公式に確認できない場合のみ、登録済みの公式検索ページではなく、該当規格の公式オンライン閲覧ページを使う。
