const { Telegraf, Markup } = require('telegraf');

// توکن ربات هاپویی
const bot = new Telegraf('8812169308:AAF0IsJ_jFDe2W_D6GkpIiND-gmk3xUBra4');

// آیدی عددی صاحب بات (شما)
const ADMIN_ID = '7334867757';

// ذخیره موقت امتیازها و وضعیت کاربران
const userScores = {};
const waitingForSupport = {}; 

// دستور شروع ربات در پی‌وی
bot.start((ctx) => {
    if (ctx.chat.type === 'private') {
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

// دریافت پیام‌های متنی در پی‌وی (هم برای ارسال پیام کاربر به ادمین، هم پاسخ ادمین به کاربر)
bot.on('text', async (ctx, next) => {
    if (ctx.chat.type !== 'private') {
        return next();
    }

    const userId = String(ctx.from.id);
    const userText = ctx.message.text;

    // ۱. اگر ادمین (شما) به یک پیامی Reply کرده باشد تا به کاربر جواب دهد
    if (userId === ADMIN_ID && ctx.message.reply_to_message) {
        const repliedText = ctx.message.reply_to_message.text || '';
        
        // استخراج آیدی عددی کاربر از داخل متنی که ادمین به آن ریپلی کرده است
        const match = repliedText.match(/🆔 آیدی عددی:\s*<code>(\d+)<\/code>/);

        if (match && match[1]) {
            const targetUserId = match[1];

            try {
                // ارسال پاسخ ادمین به کاربر اصلی
                await bot.telegram.sendMessage(
                    targetUserId, 
                    `📩 <b>پاسخ پشتیبانی:</b>\n\n${userText}`, 
                    { parse_mode: 'HTML' }
                );

                // تایید ارسال به ادمین
                await ctx.reply('✅ پاسخ شما با موفقیت برای کاربر ارسال شد.');
            } catch (err) {
                console.error('خطا در ارسال پاسخ به کاربر:', err);
                await ctx.reply('❌ ارسال پاسخ ناموفق بود (احتمالاً کاربر ربات را بلاک کرده است).');
            }
            return;
        }
    }

    // ۲. اگر کاربر عادی دکمه پشتیبانی را زده و حالا دارد پیامش را می‌فرستد
    if (waitingForSupport[userId]) {
        waitingForSupport[userId] = false; 

        const userName = ctx.from.first_name || 'بدون نام';
        const userUsername = ctx.from.username ? `@${ctx.from.username}` : 'ندارد';

        await ctx.reply('✅ پیام برای پشتیبانی ارسال شد. به زودی جواب پیگیری برای شما ارسال خواهد شد.');

        const adminMessage = `📩 <b>پیام جدید برای پشتیبانی!</b>\n\n👤 فرستنده: ${userName}\n🔗 یوزرنیم: ${userUsername}\n🆔 آیدی عددی: <code>${userId}</code>\n\n💬 متن پیام:\n${userText}`;
        
        try {
            await bot.telegram.sendMessage(ADMIN_ID, adminMessage, { parse_mode: 'HTML' });
        } catch (err) {
            console.error('خطا در ارسال پیام به ادمین:', err);
        }

        return;
    }

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
    console.log('Hapoii bot with full support & reply system is running! 🚀');
});

// مدیریت بستن امن ربات
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
