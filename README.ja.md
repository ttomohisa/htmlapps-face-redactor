# Face Redactor / 顔ぼかし

[![Build standalone HTML](https://github.com/ttomohisa/htmlapps-face-redactor/actions/workflows/build-standalone.yml/badge.svg)](https://github.com/ttomohisa/htmlapps-face-redactor/actions/workflows/build-standalone.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Single HTML](https://img.shields.io/badge/distribution-single%20HTML-0ea5e9)](https://browser-kitty.com/)

[English README](README.md)

画像内の顔をブラウザだけで検出し、モザイク・ぼかし・塗りつぶし・目線・絵文字・任意画像で隠せる、プライバシー重視の単一HTMLツールです。

顔検出から画像加工まで端末内で処理します。選択した写真をアプリがサーバーへアップロードすることはありません。

## 主な機能

- **YuNet + ONNX Runtime Web** による端末内の顔検出
- 小さい顔・遠くの顔を拾いやすくする **最小の顔サイズ 12 / 24 / 48 px** のクイック設定
- 「多めに拾う / 標準 / 厳しめ」で変更できる検出感度と詳細パラメータ
- 自動検出に加えて、検出漏れや隠したい場所を手動マスクで追加
- マスクの移動・リサイズ・有効/無効・個別削除
- モザイク / ぼかし / 塗りつぶし / 目線 / 絵文字 / 任意画像による匿名化
- 絵文字・テキスト・画像スタンプ
- 元に戻す・やり直す
- ズーム・パン・マウス・タッチ操作
- ファイル選択、ドラッグ＆ドロップ、クリップボード貼り付け
- JPEG / PNG / WebP 保存、画質・縮小率の指定
- 保存前のファイルサイズ概算
- 対応端末で Web Share API による共有
- 1つのHTML内で日本語・英語を切り替え
- スマホ向けのコンパクトな追従ヘッダーと下部アクションバー
- Content Security Policy による実行時ネットワーク通信の遮断
- 持ち運びやすい自己解凍形式HTMLの生成

> 顔検出は完全ではありません。保存前に必ず画像全体を確認し、必要に応じて手動マスクを追加してください。

## すぐに使う

### 単一HTMLをビルドする

1. このリポジトリをダウンロードまたはクローンします。
2. Windowsで `build-standalone.bat` を実行します。
3. 生成された `dist/index.html` を現在のブラウザで開きます。
4. 圧縮された持ち運び用ファイルを使う場合は `dist/index.self-extract.html` を開きます。

Python、Node.js、ローカルWebサーバーは不要です。ビルドにはWindows PowerShellを使用します。

### 生成されるファイル

通常のビルドでは以下が生成されます。

```text
dist/
├─ index.html
├─ index.self-extract.html
├─ self-extract-manifest.json
└─ .nojekyll
```

生成済みHTMLはリポジトリには含めず、必要なときにビルドする運用です。

## 使い方

1. ファイル選択、ドラッグ＆ドロップ、またはクリップボード貼り付けで画像を追加します。
2. 顔検出を実行し、検出されたマスクを確認します。
3. 小さい顔・遠くの顔が漏れている場合は、**最小の顔サイズ**を小さくします。まず **12 px** を試してください。
4. 顔を多めに拾いたい場合や誤検出を減らしたい場合は、検出感度を調整します。
5. 検出漏れや追加で隠したい場所には手動マスクを追加します。
6. 隠し方と強さ・見た目を調整します。
7. 画像全体を確認して保存します。

### 最小の顔サイズ

**最小の顔サイズ**は、どの程度小さい顔まで検出対象にするかを指定する設定です。

| プリセット | 値 | 向いている画像 |
| --- | ---: | --- |
| 小さい顔も | 12 px | 集合写真、人混み、遠くにいる人物 |
| 標準 | 24 px | 一般的な写真 |
| 大きい顔だけ | 48 px | アップの人物写真、検出を軽くしたい場合 |

値を小さくすると遠くの顔を拾いやすくなる一方、処理時間や誤検出が増えることがあります。

### キーボード操作

| ショートカット | 操作 |
| --- | --- |
| `D` | 顔を再検出 |
| `M` | 手動マスクを追加 |
| `Delete` | 選択中のマスクを削除 |
| `Space` | 動画プレビューの再生 / 一時停止 |

## 開発とビルド

```text
.
├─ src/index.template.html          # アプリ本体のテンプレート
├─ app.config.json                  # アプリ情報とビルド設定
├─ dependencies.json                # 外部ビルド依存（現在なし）
├─ build-standalone.bat             # Windows用ビルド入口
├─ build-standalone.ps1             # 単一HTMLの生成処理
├─ scripts/
│  ├─ build-self-extract.ps1        # 自己解凍HTMLの生成
│  ├─ verify-self-extract.ps1       # 自己解凍HTMLの検証
│  └─ check-repository.ps1          # リポジトリ・ビルド検証
├─ dist/                            # 生成物。リポジトリには含めない
└─ .github/workflows/
   └─ build-standalone.yml          # CIでのビルド検証
```

### ビルド

通常は以下を実行します。

```bat
build-standalone.bat
```

PowerShellから直接実行する場合：

```powershell
.\build-standalone.ps1
```

自己解凍版を作らず `dist/index.html` だけ生成する場合：

```powershell
.\build-standalone.ps1 -SkipSelfExtract
```

ONNX Runtime Web と YuNet モデルは編集元HTMLへすでに内包されているため、通常のビルド時にJavaScriptライブラリやモデルをダウンロードする必要はありません。

## プライバシーと通信防止

生成されるアプリは、選択したファイルをブラウザ内だけで処理する構成です。

- 選択した画像・動画をアプリがアップロードすることはありません。
- ONNX Runtime Web と YuNet 顔検出モデルをHTML内に内包しています。
- Content Security Policy の `connect-src 'none'` により、実行時のネットワーク接続を遮断しています。
- ONNX Runtime Web の内包WASMをコンパイル・実行するため `wasm-unsafe-eval` / `unsafe-eval` を許可していますが、これによってネットワーク通信が許可されるわけではありません。
- 自己解凍版はブラウザの `DecompressionStream` APIを使って、圧縮されたアプリを端末内で復元します。

Webサイト上で公開した場合は、最初にHTML自体を取得するための通信は発生します。その後、ユーザーが明示的に共有機能を利用しない限り、選択した画像・動画は端末内に留まります。

## 制限事項

- 顔検出には見落としや誤検出が発生することがあります。
- 極端に小さい顔、隠れている顔、強くぼけた顔、回転した顔、特殊な角度の顔は検出しにくい場合があります。
- 最小の顔サイズを小さくすると、処理時間や誤検出が増えることがあります。
- 動画は読み込み・プレビューできますが、現在の版では加工済み動画の書き出しには対応していません。
- 大きな画像では端末のメモリを多く使用し、端末性能によって処理に時間がかかることがあります。
- Web Share API の利用可否はブラウザ・OSによって異なります。
- `index.self-extract.html` は `DecompressionStream` に対応したブラウザが必要です。

## 使用ライブラリ

| ライブラリ / モデル | バージョン | ライセンス | 用途 |
| --- | ---: | --- | --- |
| ONNX Runtime Web | 1.27.0 | MIT | ブラウザ内でのニューラルネットワーク推論 |
| YuNet 顔検出モデル | OpenCV Zoo | MIT | 顔検出 |

第三者ライブラリのライセンス詳細は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を確認してください。

## コントリビューション

バグ報告や機能提案はGitHub Issuesから歓迎します。再現手順に加えて、利用ブラウザ・端末情報があると原因を確認しやすくなります。

## ライセンス

Copyright © 2026 ttomohisa

このプロジェクトは [MIT License](LICENSE) で公開されています。
