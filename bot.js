const { Telegraf, Markup } = require('telegraf');

// توکن ربات هاپویی
const bot = new Telegraf('8812169308:AAF0IsJ_jFDe2W_D6GkpIiND-gmk3xUBra4');

// آیدی عددی ادمین
const ADMIN_ID = '7334867757';

// دیتابیس موقت کاربران (امتیاز، لول، و زمان آخرین هاپ)
const db = {};
const waitingForSupport = {};
const waitingForCasino = {}; // برای ذخیره انتخاب کاربر در کازینو

// تابع کمکی برای گرفتن اطلاعات کاربر
function getUser(userId) {
    if (!db[userId]) {
        db[userId] = {
            score: 0,
            level: 1,
            lastHapTime: 0
        };
    }
    return db[userId];
}

// دستور استارت ربات در پی‌وی
bot.start((ctx) => {
    if (ctx.chat.type === 'private') {
        waitingForSupport[ctx.from.id] = false;
        ctx.reply(`سلام! من «هاپویی» 🐶 هستم.\nاز گزینه‌های زیر استفاده کنید:`, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('📞 ارتباط با پشتیبانی', 'support')],
                [Markup.button.callback('🛒 خرید هاپو کوین', 'buy_coin')]
            ])
        });
    }
});

// کلیک دکمه پشتیبانی
bot.action('support', async (ctx) => {
    await ctx.answerCbQuery();
    waitingForSupport[ctx.from.id] = true;
    await ctx.reply('✍️ لطفاً پیام خود را برای پشتیبانی بنویسید و ارسال کنید:');
});

// کلیک دکمه خرید کوین
bot.action('buy_coin', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply('🛒 برای خرید هاپو کوین و اطلاع از تعرفه‌ها، به بخش پشتیبانی پیام دهید.');
});

// مدیریت پیام‌های متنی پی‌وی (پشتیبانی و انتخاب‌های کازینو)
bot.on('text', async (ctx, next) => {
    if (ctx.chat.type !== 'private') return next();

    const userId = String(ctx.from.id);
    const userText = ctx.message.text.trim();
    const user = getUser(userId);

    // پاسخ ادمین به کاربران
    if (userId === ADMIN_ID && ctx.message.reply_to_message) {
        const repliedText = ctx.message.reply_to_message.text || '';
        const match = repliedText.match(/🆔 آیدی عددی:\s*<code>(\d+)<\/code>/);
        if (match && match[1]) {
            try {
                await bot.telegram.sendMessage(match[1], `📩 <b>پاسخ پشتیبانی:</b>\n\n${userText}`, { parse_mode: 'HTML' });
                await ctx.reply('✅ پاسخ ارسال شد.');
            } catch (err) {
                await ctx.reply('❌ ارسال ناموفق (شاید کاربر ربات را بلاک کرده).');
            }
            return;
        }
    }

    // پیام پشتیبانی کاربر
    if (waitingForSupport[userId]) {
        waitingForSupport[userId] = false;
        await ctx.reply('✅ پیام برای پشتیبانی ارسال شد. به زودی پاسخ داده می‌شود.');
        const adminMsg = `📩 <b>پیام جدید پشتیبانی!</b>\n\n👤 نام: ${ctx.from.first_name}\n🆔 آیدی: <code>${userId}</code>\n\n💬 متن:\n${userText}`;
        try { await bot.telegram.sendMessage(ADMIN_ID, adminMsg, { parse_mode: 'HTML' }); } catch (e) {}
        return;
    }

    // پردازش مرحله دوم کازینو (انتخاب عدد یا زوج/فرد توسط کاربر)
    if (waitingForCasino[userId]) {
        const betType = waitingForCasino[userId]; // عدد انتخابی یا 'even'/'odd'
        delete waitingForCasino[userId];

        // بررسی اینکه لول کاربر حداقل 6 باشد
        if (user.level < 6) {
            return ctx.reply(`❌ خطا! برای بازی در کازینو باید حداقل لول شما **6** باشد (لول فعلی شما: ${user.level}).`);
        }

        // بررسی اینکه کاربر حداقل 10 امتیاز برای شرط‌بندی داشته باشد
        if (user.score < 10) {
            return ctx.reply(`⚠️ امتیاز شما برای شروع بازی کافی نیست! (حداقل 10 امتیاز لازم است).`);
        }

        // ریختن تاس (عدد تصادفی بین 1 تا 6)
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        let isWin = false;
        let prizeMultiplier = 0;

        if (betType === 'even') {
            if (diceRoll % 2 === 0) { isWin = true; prizeMultiplier = 2; }
        } else if (betType === 'odd') {
            if (diceRoll % 2 !== 0) { isWin = true; prizeMultiplier = 2; }
        } else {
            const chosenNum = parseInt(betType);
            if (diceRoll === chosenNum) { isWin = true; prizeMultiplier = 3; }
        }

        const betAmount = 10; // هزینه هر بار بازی کازینو

        if (isWin) {
            const reward = betAmount * prizeMultiplier;
            user.score += (reward - betAmount); // اضافه کردن سود
            return ctx.reply(`🎲 تاس ریخته شد و عدد **${diceRoll}** آمد!\n\n🎉 تبریک! شما برنده شدید و **${reward}** امتیاز جایزه گرفتید!\n✨ امتیاز کل شما: ${user.score}`);
        } else {
            user.score -= betAmount; // کم کردن امتیاز به دلیل باخت
            if (user.score < 0) user.score = 0;
            return ctx.reply(`🎲 تاس ریخته شد و عدد **${diceRoll}** آمد!\n\n😢 متأسفانه باختید و ${betAmount} امتیاز از شما کسر شد.\n✨ امتیاز کل شما: ${user.score}`);
        }
    }

    return next();
});

// دستور کازینو در پی‌وی
bot.command('casino', (ctx) => {
    if (ctx.chat.type !== 'private') return;
    const userId = ctx.from.id;
    const user = getUser(userId);

    if (user.level < 6) {
        return ctx.reply(`❌ برای ورود به کازینو باید حداقل **لول 6** باشید!\n✨ لول فعلی شما: ${user.level}`);
    }

    ctx.reply(`🎰 **به کازینو هاپویی خوش آمدید!**\nلطفاً نوع شرط‌بندی خود را انتخاب کنید:\n(هزینه هر بار بازی: 10 امتیاز)`, {
        ...Markup.inlineKeyboard([
            [Markup.button.callback('🔢 عدد ۶', 'casino_6'), Markup.button.callback('🔢 عدد ۵', 'casino_5')],
            [Markup.button.callback('🔢 عدد ۴', 'casino_4'), Markup.button.callback('🔢 عدد ۳', 'casino_3')],
            [Markup.button.callback('🔢 عدد ۲', 'casino_2'), Markup.button.callback('🔢 عدد ۱', 'casino_1')],
            [Markup.button.callback(' زوج (2 برابر)', 'casino_even'), Markup.button.callback(' فرد (2 برابر)', 'casino_odd')]
        ])
    });
});

// مدیریت کلیک دکمه‌های کازینو
bot.action(/^casino_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const actionVal = ctx.match[1]; // مثلا '6' یا 'even'
    waitingForCasino[userId] = actionVal;

    if (actionVal === 'even') {
        await ctx.reply('🎲 شما گزینه **زوج** را انتخاب کردید. اگر تاس زوج بیاید ۲ برابر می‌برید!');
    } else if (actionVal === 'odd') {
        await ctx.reply('🎲 شما گزینه **فرد** را انتخاب کردید. اگر تاس فرد بیاید ۲ برابر می‌برید!');
    } else {
        await ctx.reply(`🎲 شما روی عدد **${actionVal}** شرط بستید. اگر همین عدد بیاید ۳ برابر می‌برید!`);
    }
});

// دستور «هاپ» در گروه‌ها با محدودیت زمانی ۵ دقیقه و سیستم لول‌بندی ۳۵ تایی
bot.hears(/^(هاپ|Hap|hap)$/i, (ctx) => {
    if (ctx.chat.type === 'private') {
        return ctx.reply('لطفاً کلمه «هاپ» را داخل **گروه** بفرستید!');
    }

    const userId = ctx.from.id;
    const userName = ctx.from.first_name || 'دوست عزیز';
    const now = Date.now();
    const user = getUser(userId);

    const cooldownTime = 5 * 60 * 1000; // ۵ دقیقه به میلی‌ثانیه

    // بررسی محدودیت زمانی ۵ دقیقه
    if (now - user.lastHapTime < cooldownTime) {
        const remainingSeconds = Math.ceil((cooldownTime - (now - user.lastHapTime)) / 1000);
        const remainingMinutes = Math.ceil(remainingSeconds / 60);
        return ctx.reply(`⏳ هاپت نمی‌اومده! لطفاً **${remainingMinutes} دقیقه** دیگر صبر کن.`, {
            reply_to_message_id: ctx.message.message_id
        });
    }

    // به‌روزرسانی زمان آخرین هاپ
    user.lastHapTime = now;

    // اضافه کردن ۱ واحد به امتیاز (هر هاپ معادل 1 عدد)
    user.score += 1;

    let levelUpMessage = '';

    // بررسی رسیدن امتیاز به 35 برای افزایش لول و ریست شدن
    if (user.score >= 35) {
        user.score = 0; // ریست شدن امتیاز از 0
        user.level += 1; // اضافه شدن یک لول
        levelUpMessage = `\n\n🎉 تبریک! امتیاز شما به 35 رسید و لول شما به **${user.level}** تغییر کرد! امتیازها ریست شدند (از 0).`;
    }

    ctx.reply(`🐶 <b>${userName}</b> عزیز، هاپ کردی و 1 امتیاز گرفتی!\n✨ امتیاز فعلی: <b>${user.score} / 35</b> (لول: ${user.level})${levelUpMessage}`, {
        parse_mode: 'HTML',
        reply_to_message_id: ctx.message.message_id
    });
});

// راه‌اندازی ربات
bot.launch().then(() => {
    console.log('Hapoii bot with Level, Cooldown & Casino is running! 🚀');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
