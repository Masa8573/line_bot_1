# line_bot_1

// ===== README.md =====
/*
# 無料デプロイ対応 LINE Bot

## 🚀 Renderでの無料デプロイ手順

### 1. GitHubリポジトリ作成
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/line-bot.git
git push -u origin main
```

### 2. Renderアカウント作成
1. https://render.com にアクセス
2. GitHubアカウントでサインアップ（無料）

### 3. Web Service作成
1. Dashboard → "New" → "Web Service"
2. GitHubリポジトリを選択
3. 設定:
   - Name: line-bot-free
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
   - Instance Type: Free

### 4. 環境変数設定
Environment Variables セクションで追加:
- CHANNEL_ACCESS_TOKEN: [LINEから取得]
- CHANNEL_SECRET: [LINEから取得]
- NODE_ENV: production

### 5. LINE Webhook設定
1. LINE Developers Console
2. Webhook URL: https://your-app-name.onrender.com/webhook
3. Webhook使用: ON

## 🎯 機能一覧
- ✅ 挨拶応答（おはよう、こんにちは、おやすみ）
- ✅ 時間確認（現在時刻の表示）
- ✅ 天気関連の会話
- ✅ 励まし・応援メッセージ
- ✅ ヘルプ機能（Flexメッセージ）
- ✅ 定期メッセージ配信
- ✅ Keep-alive機能

## 📱 使い方
ユーザーが以下のメッセージを送信すると特別な応答:
- "おはよう" → 朝の挨拶
- "時間" → 現在時刻表示
- "天気" → 天気関連メッセージ
- "疲れた" → 励ましメッセージ
- "ヘルプ" → 使い方ガイド

## 🔧 ローカル開発
```bash
npm install
export CHANNEL_ACCESS_TOKEN="your_token"
export CHANNEL_SECRET="your_secret"
npm start
```

## 📊 監視
- Health Check: GET /
- Keep-alive: GET /ping
- ログでリアルタイム監視

## 🆓 無料枠の制限
- Renderフリープラン: 750時間/月
- 15分間非アクティブでスリープ
- Keep-alive機能で対応

## 🔗 リンク
- Render: https://render.com
- LINE Developers: https://developers.line.biz/ja/
*/
