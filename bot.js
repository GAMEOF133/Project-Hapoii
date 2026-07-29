const { Telegraf, Markup } = require('telegraf');

// توکن ربات هاپویی
const bot = new Telegraf('8812169308:AAF0IsJ_jFDe2W_D6GkpIiND-gmk3xUBra4');

// ذخیره ساده امتیازها در حافظه موقت ربات
const userScores = {};

// دستور شروع ربات (در پی‌وی دکمه‌ها را نمایش می‌دهد)
bot.start((ctx) => {
    if (ctx.chat.type === 'private') {
        ctx.reply(`سلام! من «هاپویی» 🐶 هستم.\nمن امتیازدهی رو توی **گروه‌ها** انجام می‌دم، و از طریق گزینه‌های زیر می‌تونی با پشتیبانی در ارتباط باشی یا هاپو کوین بخوای تهیه کنی:`, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('📞 ارتباط با پشتیبانی', 'support')],
                [Markup.button.callback('🛒 خرید هاپو کوین', 'buy_coin')]
            ])
        });
    }
});

// مدیریت کلیک روی دکمه پشتیبانی
bot.action('support', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('💬 برای ارتباط با پشتیبانی، می‌توانید به آیدی زیر پیام دهید:\n@YourSupportID');
});

// مدیریت کلیک روی دکمه خرید هاپو کوین
bot.action('buy_coin', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('🛒 برای خرید هاپو کوین و اطلاع از تعرفه‌ها، لطفاً به بخش فروشگاه یا پشتیبانی مراجعه کنید.');
});

// گوش دادن به پیام‌های کاربران (فقط در گروه‌ها یا سوپرگروه‌ها برای امتیاز)
bot.hears(/^(هاپ|Hap|hap)$/i, (ctx) => {
    if (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup') {
        return; // در پی‌وی کاری انجام نمی‌دهد
    }

    const userId = ctx.from.id;
    const userName = ctx.from.first_name || 'دوست عزیز';

    // تولید امتیاز تصادفی بین 20 تا 50
    const randomPoints = Math.floor(Math.random() * (50 - 20 + 1)) + 20;

    if (!userScores[userId]) {
        userScores[userId] = 0;
    }
    userScores[userId] += randomPoints;

    ctx.reply(`🐶 <b>${userName}</b> عزیز، مقدار <b>${randomPoints}</b> امتیاز هاپویی دریافت کردی!\n\n✨ مجموع امتیازهای تو: <b>${userScores[userId]}</b> امتیاز`, {
        parse_mode: 'HTML',
        reply_to_message_id: ctx.message.message_id
    });
});

// راه‌اندازی ربات
bot.launch().then(() => {
    console.log('Hapoii bot is running successfully with buttons! 🚀');
});

// مدیریت بستن امن ربات
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
