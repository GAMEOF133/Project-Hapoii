const { Telegraf } = require('telegraf');

// توکن ربات هاپویی
const bot = new Telegraf('8812169308:AAF0IsJ_jFDe2W_D6GkpIiND-gmk3xUBra4');

// ذخیره ساده امتیازها در حافظه موقت ربات
const userScores = {};

// گوش دادن به پیام‌های کاربران (فقط در گروه‌ها یا سوپرگروه‌ها)
bot.hears(/^(هاپ|Hap|hap)$/i, (ctx) => {
    // بررسی اینکه آیا پیام در گروه یا سوپرگروه ارسال شده است یا خیر
    if (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup') {
        return; // اگر در پی‌وی بود، هیچ واکنشی نشان ندهد
    }

    const userId = ctx.from.id;
    const userName = ctx.from.first_name || 'دوست عزیز';

    // تولید امتیاز تصادفی بین 20 تا 50
    const randomPoints = Math.floor(Math.random() * (50 - 20 + 1)) + 20;

    // اضافه کردن امتیاز به حساب کاربر
    if (!userScores[userId]) {
        userScores[userId] = 0;
    }
    userScores[userId] += randomPoints;

    // ارسال پاسخ با ایموجی سگ 🐶 در گروه
    ctx.reply(`🐶 <b>${userName}</b> عزیز، مقدار <b>${randomPoints}</b> امتیاز هاپویی دریافت کردی!\n\n✨ مجموع امتیازهای تو: <b>${userScores[userId]}</b> امتیاز`, {
        parse_mode: 'HTML',
        reply_to_message_id: ctx.message.message_id
    });
});

// دستور شروع ربات (اختیاری: برای اینکه در پی‌وی بگوید فقط در گروه کار می‌کنم)
bot.start((ctx) => {
    if (ctx.chat.type === 'private') {
        ctx.reply(`سلام! من «هاپویی» 🐶 هستم.\nمن فقط توی **گروه‌ها** کار می‌کنم؛ منو به یک گروه اضافه کن و اونجا کلمه «هاپ» رو بفرست!`, {
            parse_mode: 'HTML'
        });
    }
});

// راه‌اندازی ربات
bot.launch().then(() => {
    console.log('Hapoii bot is running successfully! 🚀');
});

// مدیریت بستن امن ربات
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
