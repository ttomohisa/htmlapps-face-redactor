# Face Redactor / 顔ぼかし

画像内の顔をブラウザーだけで検出し、モザイク・ぼかし・塗りつぶし・目線・絵文字・任意画像で隠せる単一HTMLツールです。Browser-Kitty への組み込みを想定し、`htmlapps-template` のUI/リポジトリ構成に合わせています。

## 主な機能

- YuNet + ONNX Runtime Web による端末内の顔検出
- 最小顔サイズを「小さい顔も / 標準 / 大きい顔だけ」からすぐ切り替え、12 / 24 / 48 px をワンタップ設定
- スマホでは画像直下から最小顔サイズ・検出感度を変更して、その場で再検出
- 検出漏れ用の手動マスク
- マスクの移動・リサイズ・個別削除・有効/無効
- モザイク / ぼかし / 塗りつぶし / 目線 / 絵文字 / 任意画像
- スタンプ、テキストスタンプ、画像スタンプ
- Undo / Redo
- ズーム、パン、スマホのタッチ操作
- JPEG / PNG / WebP 保存、品質・縮小率指定、保存サイズ概算
- Web Share API 対応端末で共有
- 画像のドラッグ＆ドロップ、ファイル選択、クリップボード貼り付け
- 日本語 / English 切替
- 処理結果をスマホでも確認しやすいトースト表示
- スマホ向けのカードUI、コンパクトな固定ヘッダー、下部編集アクションバー

> 顔検出は完全ではありません。保存前に画像全体を確認し、必要に応じて手動マスクを追加してください。

## プライバシー

画像・動画はアプリのサーバーへアップロードしません。顔検出モデルと実行環境はHTML内に含まれ、`connect-src 'none'` のCSPで実行時ネットワーク通信を遮断しています。

## 使い方

1. `dist/index.html` をブラウザーで開きます。
2. 画像を選択、ドロップ、または貼り付けます。
3. 自動検出結果を確認し、漏れがあれば手動マスクを追加します。
4. 隠し方と強さを調整します。
5. 画像全体を確認して保存します。

## ビルド

Windows / PowerShell:

```powershell
.\build-standalone.ps1
```

または:

```bat
build-standalone.bat
```

`src/index.template.html` を検証して `dist/index.html` を生成し、続けて `dist/index.self-extract.html` も生成します。依存ライブラリとYuNetモデルは既にHTMLへ内包されています。自己解凍版が不要な場合は `-SkipSelfExtract` を指定できます。

`dist/` の生成HTMLはリポジトリには含めず、ビルド時に生成する運用です。

## 構成

```text
src/index.template.html              編集元の単一HTML
dist/index.html             配布用HTML
dist/index.self-extract.html 自己解凍版HTML
scripts/build-self-extract.ps1 自己解凍版の生成
scripts/verify-self-extract.ps1 自己解凍版の検証
app.config.json             アプリ情報
dependencies.json           外部ビルド依存（現在なし）
scripts/check-repository.ps1 検証
.github/workflows/build-standalone.yml CI
```

## 動画について

動画ファイルは読み込み・プレビューできますが、現在の版では加工済み動画の書き出しには対応していません。

## License

MIT License. ONNX Runtime Web と YuNet のライセンスについては `THIRD_PARTY_NOTICES.md` を参照してください。
