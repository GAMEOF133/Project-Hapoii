const { Telegraf, Markup } = require('telegraf');

// توکن ربات هاپویی
const bot = new Telegraf('8812169308:AAF0IsJ_jFDe2W_D6GkpIiND-gmk3xUBra4');

// آیدی عددی صاحب بات (شما)
const ADMIN_ID = '7334867757';

// ذخیره موقت امتیازها و وضعیت کاربران
const userScores = {};
const waitingForSupport = {}; // برای اینکه بفهمیم کاربر در حال نوشتن پیام برای پشتیبانی است

// دستور شروع ربات در پی‌وی
bot.start((ctx) => {
    if (ctx.chat.type === 'private') {
        // اگر کاربر قبلاً در حالت انتظار پشتیبانی بوده، خارجش می‌کنیم
        waitingForSupport[ctx.from.id] = false;

        ctx.reply(`سلام! من «هاپویی» 🐶 هستم.\nامتیازدهی در **گروه‌ها** انجام می‌شود. از گزینه‌های زیر استفاده کنید:`, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('📞 ارتباط با پشتیبانی', 'support')],
                [Markup.button.callback('🛒 خرید هاپو کوین', 'buy_coin')]
            ])
        });
    }
});

// کلیک روی دکمه پشتیبانی
bot.action('support', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    
    // فعال کردن حالت انتظار پیام پشتیبانی برای این کاربر
    waitingForSupport[userId] = true;

    await ctx.reply('✍️ لطفاً پیام خود را برای پشتیبانی بنویسید و ارسال کنید:', {
        parse_mode: 'HTML'
    });
});

// کلیک روی دکمه خرید هاپو کوین
bot.action('buy_coin', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('🛒 برای خرید هاپو کوین و اطلاع از تعرفه‌ها، لطفاً به بخش فروشگاه مراجعه کنید.');
});

// دریافت پیام‌های متنی کاربران در پی‌وی (برای بخش پشتیبانی)
bot.on('text', async (ctx, next) => {
    // اگر پیام در گروه بود، بگذارید کدهای دیگر (مثل امتیاز هاپ) کارشان را بکنند
    if (ctx.chat.type !== 'private') {
        return next();
    }

    const userId = ctx.from.id;
    const userText = ctx.message.text;

    // اگر کاربر دکمه پشتیبانی را زده و منتظر پیامش هستیم
    if (waitingForSupport[userId]) {
        waitingForSupport[userId] = false; // غیرفعال کردن حالت انتظار

        const userName = ctx.from.first_name || 'بدون نام';
        const userUsername = ctx.from.username ? `@${ctx.from.username}` : 'ندارد';

        // ۱. ارسال پیام تایید به خود کاربر
        await ctx.reply('✅ پیام برای پشتیبانی ارسال شد. به زودی جواب پیگیری برای شما ارسال خواهد شد.');

        // ۲. ارسال پیام کاربر به ادمین (شما)
        const adminMessage = `📩 <b>پیام جدید برای پشتیبانی!</b>\n\n👤 فرستنده: ${userName}\n🔗 یوزرنیم: ${userUsername}\n🆔 آیدی عددی: <code>${userId}</code>\n\n💬 متن پیام:\n${userText}`;
        
        try {
            await bot.telegram.sendMessage(ADMIN_ID, adminMessage, { parse_mode: 'HTML' });
        } catch (err) {
            console.error('خطا در ارسال پیام به ادمین:', err);
        }

        return;
    }

    // اگر دستورات دیگر یا متن عادی بود
    return next();
});

// گوش دادن به کلمه «هاپ» در گروه‌ها برای امتیازدهی
bot.hears(/^(هاپ|Hap|hap)$/i, (ctx) => {
    if (ctx.chat.type !== 'private') {
        const userId = ctx.from.id;
        const userName = ctx.from.first_name || 'دوست عزیز';

        const randomPoints = Math.floor(Math.random() * (50 - 20 + 1)) + 20;

        if (!userScores[userId]) {
            userScores[userId] = 0;
        }
        userScores[userId] += randomPoints;

        ctx.reply(`🐶 <b>${userName}</b> عزیز، مقدار <b>${randomPoints}</b> امتیاز هاپویی دریافت کردی!\n\n✨ مجموع امتیازهای تو: <b>${userScores[userId]}</b> امتیاز`, {
            parse_mode: 'HTML',
            reply_to_message_id: ctx.message.message_id
        });
    }
});

// راه‌اندازی ربات
bot.launch().then(() => {
    console.log('Hapoii bot with support system is running! 🚀');
});

// مدیریت بستن امن ربات
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));const { Telegraf, Markup } = require('telegraf');

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
