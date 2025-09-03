// ===== index.js =====
const express = require('express');
const line = require('@line/bot-sdk');
const cron = require('node-cron');

// 環境変数からLINE Bot設定を読み込み
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

// 設定チェック
if (!config.channelAccessToken || !config.channelSecret) {
  console.error('❌ 環境変数が設定されていません');
  console.log('CHANNEL_ACCESS_TOKEN:', config.channelAccessToken ? '設定済み' : '未設定');
  console.log('CHANNEL_SECRET:', config.channelSecret ? '設定済み' : '未設定');
} else {
  console.log('✅ LINE Bot設定完了');
}

const client = new line.Client(config);
const app = express();

// ヘルスチェックエンドポイント（無料プランでスリープ防止）
app.get('/', (req, res) => {
  const status = {
    status: 'LINE Bot is running! 🤖',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };
  res.json(status);
});

// Keep-aliveエンドポイント
app.get('/ping', (req, res) => {
  res.json({ 
    message: 'pong', 
    time: new Date().toISOString() 
  });
});

// Webhookエンドポイント
app.post('/webhook', line.middleware(config), (req, res) => {
  console.log('📨 Webhook受信:', new Date().toISOString());
  
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => {
      console.log('✅ イベント処理完了');
      res.json(result);
    })
    .catch((err) => {
      console.error('❌ イベント処理エラー:', err);
      res.status(500).end();
    });
});

// メッセージ処理メイン関数
async function handleEvent(event) {
  console.log('🔄 イベント処理中:', event.type);

  if (event.type !== 'message' || event.message.type !== 'text') {
    console.log('⏭️ テキストメッセージ以外はスキップ');
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;
  const userId = event.source.userId;
  
  console.log(`👤 ユーザー: ${userId.substring(0, 8)}...`);
  console.log(`💬 メッセージ: ${userMessage}`);
  
  let replyMessage = generateSmartResponse(userMessage);
  
  try {
    await client.replyMessage(event.replyToken, replyMessage);
    console.log('✅ 返信送信完了');
  } catch (error) {
    console.error('❌ 返信エラー:', error.message);
  }

  return Promise.resolve(null);
}

// スマートな応答生成
function generateSmartResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // 挨拶パターン
  if (message.includes('おはよう') || message.includes('good morning')) {
    return createTextMessage('おはようございます！🌅\n今日も素敵な一日になりますように✨\n何かお手伝いできることがあれば、お気軽にどうぞ！');
  }
  
  if (message.includes('こんにちは') || message.includes('hello')) {
    return createTextMessage('こんにちは！😊\nお疲れさまです。\n今日はどのようなことでお手伝いできますか？');
  }
  
  if (message.includes('おやすみ') || message.includes('good night')) {
    return createTextMessage('お疲れさまでした！🌙\nゆっくり休んでくださいね。\nまた明日、お待ちしています💤');
  }
  
  // 時間関連
  if (message.includes('時間') || message.includes('何時') || message.includes('time')) {
    const now = new Date();
    const jstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // JST変換
    const timeStr = jstTime.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    });
    return createTextMessage(`現在の時刻は\n📅 ${timeStr} です⏰\n\n時間を有効活用していきましょう！`);
  }
  
  // 天気関連
  if (message.includes('天気') || message.includes('weather')) {
    const weatherMessages = [
      '今日はいい天気ですね！☀️\n外出日和です。水分補給をお忘れなく！',
      '雨の日もまた素敵ですね🌧️\n読書や室内での時間を楽しみましょう！',
      '曇り空でも心は晴れやか☁️\n素敵な一日をお過ごしください！'
    ];
    return createTextMessage(weatherMessages[Math.floor(Math.random() * weatherMessages.length)]);
  }
  
  // 励まし・応援
  if (message.includes('疲れ') || message.includes('tired') || message.includes('しんど')) {
    return createTextMessage('お疲れさまです💪\n無理は禁物ですよ。\n\n少し休憩して、深呼吸してみてください🌸\nあなたのペースで大丈夫です！');
  }
  
  if (message.includes('頑張') || message.includes('がんば')) {
    return createTextMessage('頑張っていらっしゃいますね！👏\n\nでも、無理は禁物です。\n適度に休憩も取ってくださいね😌\n応援しています📣');
  }
  
  // 感謝
  if (message.includes('ありがとう') || message.includes('thanks')) {
    return createTextMessage('どういたしまして！😊\n\nお役に立てて嬉しいです🎉\nまた何かございましたら、いつでもお声がけください！');
  }
  
  // ボット情報
  if (message.includes('ボット') || message.includes('bot') || message.includes('あなた')) {
    return createTextMessage('私はLINE Botです🤖\n\n24時間いつでもお話しできます！\n・挨拶や雑談\n・時間の確認\n・ちょっとした励まし\n\nなんでもお気軽にどうぞ💬');
  }
  
  // ヘルプ・使い方
  if (message.includes('ヘルプ') || message.includes('help') || message.includes('使い方')) {
    return createFlexMessage();
  }
  
  // デフォルト応答
  const defaultResponses = [
    'メッセージありがとうございます！📱\nいつでもお話しできて嬉しいです😊',
    'お話ありがとうございます✨\n何かお手伝いできることがあれば、お気軽にどうぞ！',
    'いつもありがとうございます🙏\n今日も素敵な一日をお過ごしください！',
    'メッセージを受け取りました📩\nお返事いただけて嬉しいです！',
    'お疲れさまです！\n何かご質問があれば、いつでもお聞かせください😊'
  ];
  
  return createTextMessage(defaultResponses[Math.floor(Math.random() * defaultResponses.length)]);
}

// テキストメッセージ作成
function createTextMessage(text) {
  return {
    type: 'text',
    text: text
  };
}

// Flexメッセージ作成（ヘルプ用）
function createFlexMessage() {
  return {
    type: 'flex',
    altText: 'ボットの使い方ガイド',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '使い方ガイド',
            weight: 'bold',
            size: 'xl',
            color: '#1DB446'
          },
          {
            type: 'text',
            text: '私にできること',
            weight: 'bold',
            margin: 'md'
          },
          {
            type: 'text',
            text: '🌅 挨拶（おはよう、こんにちは）\n⏰ 時間確認（時間、何時）\n☀️ 天気の話（天気、weather）\n💪 励まし（疲れた、頑張る）\n❓ ヘルプ（help、使い方）',
            wrap: true,
            margin: 'md',
            size: 'sm'
          },
          {
            type: 'text',
            text: '何でもお気軽にお話しください！',
            margin: 'md',
            size: 'sm',
            color: '#666666'
          }
        ]
      }
    }
  };
}

// 定期メッセージ機能
function setupScheduledMessages() {
  console.log('📅 定期メッセージスケジュール設定中...');
  
  // 平日朝の挨拶（月〜金 8:00 JST）
  cron.schedule('0 8 * * 1-5', async () => {
    console.log('🌅 朝の挨拶メッセージ送信中...');
    const message = createTextMessage(
      '🌅 おはようございます！\n\n新しい一日の始まりです。\n今日も素敵な一日になりますように✨\n\n何かお手伝いできることがあれば、いつでもお声がけください！'
    );
    // 実際のデプロイでは特定のユーザーIDまたはブロードキャスト
    // await sendBroadcastMessage(message);
  }, {
    timezone: "Asia/Tokyo"
  });
  
  // 金曜の励ましメッセージ（金 17:00 JST）
  cron.schedule('0 17 * * 5', async () => {
    console.log('🎉 週末挨拶メッセージ送信中...');
    const message = createTextMessage(
      '🎉 金曜日お疲れさまでした！\n\n今週もよく頑張りました👏\n素敵な週末をお過ごしください。\n\nまた来週、お待ちしています！'
    );
    // await sendBroadcastMessage(message);
  }, {
    timezone: "Asia/Tokyo"
  });
  
  console.log('✅ 定期メッセージ設定完了');
}

// ブロードキャストメッセージ送信
async function sendBroadcastMessage(message) {
  try {
    await client.broadcast(message);
    console.log('📢 ブロードキャスト送信完了:', new Date().toISOString());
  } catch (error) {
    console.error('❌ ブロードキャスト送信エラー:', error.message);
  }
}

// サーバー起動
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('\n🚀 =========================');
  console.log(`🤖 LINE Bot Server起動！`);
  console.log(`📡 Port: ${port}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('==========================\n');
  
  // 設定状態の表示
  console.log('📋 設定状況:');
  console.log(`✅ Express Server: 起動中`);
  console.log(`${config.channelAccessToken ? '✅' : '❌'} LINE Access Token: ${config.channelAccessToken ? '設定済み' : '未設定'}`);
  console.log(`${config.channelSecret ? '✅' : '❌'} LINE Secret: ${config.channelSecret ? '設定済み' : '未設定'}`);
  
  // 定期メッセージ設定
  setupScheduledMessages();
  
  console.log('\n📚 エンドポイント:');
  console.log('GET  / : ヘルスチェック');
  console.log('GET  /ping : Keep-alive');
  console.log('POST /webhook : LINE Webhook');
  
  console.log('\n🎯 機能:');
  console.log('・智能对话响应');
  console.log('・時間・天気情報');
  console.log('・励まし・応援メッセージ');
  console.log('・定期メッセージ配信');
  console.log('・Flexメッセージ対応\n');
});

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未処理のPromise拒否:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ キャッチされていない例外:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERMを受信。Graceful shutdown中...');
  process.exit(0);
});

// Keep-alive機能（無料プランでのスリープ防止）
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    console.log('💓 Keep-alive:', new Date().toISOString());
  }, 25 * 60 * 1000); // 25分毎
}

console.log('\n📝 セットアップ完了！');
console.log('🔗 Webhook URL: https://your-app-name.onrender.com/webhook');

module.exports = app;
