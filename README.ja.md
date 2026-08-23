# Face Redactor / 顔ぼかし

[![Build standalone HTML](https://github.com/ttomohisa/htmlapps-face-redactor/actions/workflows/build-standalone.yml/badge.svg)](https://github.com/ttomohisa/htmlapps-face-redactor/actions/workflows/build-standalone.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Single HTML](https://img.shields.io/badge/distribution-single%20HTML-0ea5e9)](https://ttomohisa.github.io/htmlapps-face-redactor/face-redactor.html)

[English README](README.md)

画像内の顔をブラウザだけで検出し、モザイク・ぼかし・塗りつぶし・目線・絵文字・任意画像などで隠せる、プライバシー重視の単一HTMLアプリです。自動検出で漏れた場所は手動マスクで補えます。

## 🚀 デモ

### [GitHub Pages で Face Redactor を開く](https://ttomohisa.github.io/htmlapps-face-redactor/face-redactor.html)

GitHub Pages から最初のHTMLを取得した後、顔検出・マスク編集・画像加工・保存はブラウザ内で実行します。選択した画像をアプリがサーバーへアップロードすることはありません。

[![Face Redactor screenshot](assets/screenshot.png)](https://ttomohisa.github.io/htmlapps-face-redactor/face-redactor.html)

## 主な機能

- **顔検出を端末内で実行** — YuNet + ONNX Runtime Web で、選択した画像をサーバーへ送らず検出します。
- **小さい顔・遠くの顔にも対応しやすい設定** — 最小の顔サイズを 12 / 24 / 48 px から選び、必要に応じて検出感度も調整できます。
- **検出漏れを手動で補完** — 手動マスクの追加、移動、リサイズ、有効/無効、個別削除ができます。
- **隠し方を選べる** — モザイク、ぼかし、塗りつぶし、目線、絵文字、任意画像に対応しています。
- **スタンプ編集** — 絵文字、文字、画像スタンプを追加でき、元に戻す・やり直すも利用できます。
- **ブラウザ内で保存まで完結** — JPEG / PNG / WebP、画質・縮小率、推定ファイルサイズ、対応端末では共有にも対応します。
- **スマホでも操作しやすいUI** — タッチ操作、ズーム・パン、追従ヘッダー、下部アクションバーに対応しています。
- **単一HTML + 通信防止** — ONNX Runtime Web と YuNet をHTML内に内包し、Content Security Policy で実行時のネットワーク通信を遮断します。

> 顔検出は完全ではありません。保存前に必ず画像全体を確認し、必要に応じて手動マスクを追加してください。

## すぐに使う

### Webデモを使う

[デモを開く](https://ttomohisa.github.io/htmlapps-face-redactor/face-redactor.html)だけで利用できます。インストールやアカウント登録は不要です。

### HTMLファイルをそのまま使う

1. [face-redactor.html](https://github.com/ttomohisa/htmlapps-face-redactor/blob/main/face-redactor.html) をダウンロードします。
2. Chromium系ブラウザ、Firefox、Safariなどの現在のブラウザで開きます。
3. 画像を追加して編集を開始します。チェックイン済みの単一HTMLを使う場合、ローカルWebサーバーは不要です。

### 単一HTMLをビルドする

1. このリポジトリをダウンロードまたはクローンします。
2. Windowsで `build-standalone.bat` を実行します。
3. `dist/index.html` を開きます。
4. より小さい持ち運び用ラッパーを使う場合は `dist/index.self-extract.html` を開きます。

Python、Node.js、ローカルWebサーバーは不要です。ビルドにはWindows PowerShellを使用します。

通常のビルドでは以下が生成されます。

```text
dist/
├─ index.html
├─ index.self-extract.html
├─ self-extract-manifest.json
└─ .nojekyll
```

## 使い方

1. ファイル選択、ドラッグ＆ドロップ、またはクリップボード貼り付けで画像を追加します。
2. **顔を検出**を実行し、検出されたマスクを確認します。
3. 小さい顔・遠くの顔が漏れている場合は、**最小の顔サイズ**を小さくします。まず **12 px** を試してください。
4. 候補を多めに拾いたい場合や誤検出を減らしたい場合は、検出感度を調整します。
5. 検出漏れや追加で隠したい場所には手動マスクを追加します。
6. 隠し方と強さ・余白・形状などを調整します。
7. ズームしながら画像全体を確認します。
8. JPEG / PNG / WebPで保存するか、対応端末では共有します。

### 最小の顔サイズ

**最小の顔サイズ**は、どの程度小さい顔まで検出対象にするかを指定する設定です。

| プリセット | 値 | 向いている画像 |
| --- | ---: | --- |
| 小さい顔も | 12 px | 集合写真、人混み、遠くにいる人物 |
| 標準 | 24 px | 一般的な写真 |
| 大きい顔だけ | 48 px | アップの人物写真、検出を軽くしたい場合 |

値を小さくすると遠くの顔を拾いやすくなる一方、処理時間や誤検出が増えることがあります。

### 手動マスク

自動検出で顔が漏れた場合や、顔以外の場所を隠したい場合は **マスク追加** を使います。画像上をドラッグしてマスクを作成し、そのまま移動・リサイズできます。右側の一覧では、個別の有効/無効や削除もできます。

### キーボード操作

| ショートカット | 操作 |
| --- | --- |
| `D` | 顔を再検出 |
| `M` | 手動マスクモードを切り替え |
| `Delete` | 選択中のマスクを削除 |
| `Space` | 動画プレビューの再生 / 一時停止 |

## 開発とビルド

```text
.
├─ face-redactor.html               # チェックイン済み単一HTML
├─ src/index.template.html          # アプリ本体の編集元
├─ assets/screenshot.png            # README用スクリーンショット
├─ app.config.json                  # アプリ情報とビルド設定
├─ dependencies.json                # 外部ビルド依存（現在なし）
├─ build-standalone.bat             # Windows用ビルド入口
├─ build-standalone.ps1             # 単一HTMLの生成処理
├─ scripts/
│  ├─ build-self-extract.ps1        # 自己解凍HTMLの生成
│  ├─ verify-self-extract.ps1       # 自己解凍HTMLの検証
│  └─ check-repository.ps1          # リポジトリ・ビルド検証
├─ dist/                            # 生成物
└─ .github/workflows/
   └─ build-standalone.yml          # CIでのビルド検証
```

ソース変更時は `face-redactor.html` と `src/index.template.html` の内容を同期させてください。

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

ONNX Runtime Web と YuNet モデルは編集元HTMLへすでに内包されています。ONNX Runtime のWASMはgzip圧縮したBase64として内包し、起動時にブラウザの `DecompressionStream` APIで端末内展開します。

## プライバシーと通信防止

このアプリは、選択したメディアを端末内に留める構成です。

- 選択した画像・動画をアプリがアップロードすることはありません。
- ONNX Runtime Web と YuNet 顔検出モデルをHTML内に内包しています。
- Content Security Policy の `connect-src 'none'` により、実行時のネットワーク接続を遮断しています。
- ONNX Runtime Web の内包WASMをコンパイル・実行するため `wasm-unsafe-eval` / `unsafe-eval` を許可していますが、これによってネットワーク通信が許可されるわけではありません。
- 自己解凍版はブラウザの `DecompressionStream` APIを使って、圧縮されたアプリを端末内で復元します。

Webサイト上で利用する場合は、最初にHTML自体を取得する通信は発生します。その後、ユーザーが明示的に共有機能を利用しない限り、選択した画像・動画は端末内に留まります。

## 制限事項

- 顔検出には見落としや誤検出が発生することがあるため、保存前の目視確認が必要です。
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
