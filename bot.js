const { Telegraf } = require('telegraf');

 توکن ربات هاپویی
const bot = new Telegraf('8812169308AAF0IsJ_jFDe2W_D6GkpIiND-gmk3xUBra4');

 ذخیره ساده امتیازها در حافظه موقت ربات (برای ذخیره دائمی می‌توان از دیتابیس استفاده کرد)
const userScores = {};

 گوش دادن به پیام‌های کاربران
bot.hears(^(هاپHaphap)$i, (ctx) = {
    const userId = ctx.from.id;
    const userName = ctx.from.first_name  'دوست عزیز';

     تولید امتیاز تصادفی بین 20 تا 50
    const randomPoints = Math.floor(Math.random()  (50 - 20 + 1)) + 20;

     اضافه کردن امتیاز به حساب کاربر
    if (!userScores[userId]) {
        userScores[userId] = 0;
    }
    userScores[userId] += randomPoints;

     ارسال پاسخ با ایموجی سگ 🐶
    ctx.reply(`🐶 b${userName}b عزیز، مقدار b${randomPoints}b امتیاز هاپویی دریافت کردی!nn✨ مجموع امتیازهای تو b${userScores[userId]}b امتیاز`, {
        parse_mode 'HTML',
        reply_to_message_id ctx.message.message_id  ریپلای روی پیام کاربر
    });
});

 دستور شروع ربات
bot.start((ctx) = {
    ctx.reply(`سلام! من «هاپویی» 🐶 هستم.nکافیه توی چت کلمه «هاپ» رو بفرستی تا امتیاز هاپویی بگیری!`, {
        parse_mode 'HTML'
    });
});

 راه‌اندازی ربات
bot.launch().then(() = {
    console.log('Hapoii bot is running successfully! 🚀');
});

 مدیریت بستن امن ربات
process.once('SIGINT', () = bot.stop('SIGINT'));
process.once('SIGTERM', () = bot.stop('SIGTERM'));