const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); // ✅ Добавляем axios
const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL || 'https://zhiroazhigatel.netlify.app/';
const backendUrl = (process.env.BACKEND_URL || 'https://init-railway-backend-v2-production.up.railway.app').replace(/\/+$/, '');

if (!token) {
    console.error('BOT_TOKEN is required. Set it in Railway or pass it before npm start.');
    process.exit(1);
}

const bot = new TelegramBot(token, {polling: true});


// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Добро пожаловать в Жиросжигатель! Мы рады видеть вас среди наших пользователей. Впереди вас ждут эффективные тренировки и проверенные методики, которые помогут вам достичь своих целей. Если у вас есть вопросы или нужна помощь, наша команда всегда готова поддержать вас. Удачи и успешных тренировок! 💪🔥', {

        })

        await bot.sendMessage(chatId, 'Перейти в никуда', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Войти', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(text === '/hello') {
        await bot.sendMessage(chatId, 'test', {

        })
    }
});

async function sendInvoice(chatId, title, trainingId, price) {
    try {
        await bot.sendInvoice(
            chatId,
            title, // Заголовок платежа
            "Доступ к эксклюзивному плану тренировок", // Описание платежа
            JSON.stringify({ user_id: chatId, training_id: trainingId }), // Payload
            "", // Telegram Stars (оставляем пустым)
            "XTR", // Валюта (Telegram Stars)
            [{ label: title, amount: price * 100 }], // Цена в Stars
            {
                need_name: false,
                need_phone_number: false,
                need_email: false,
                need_shipping_address: false
            }
        );

        console.log("✅ Инвойс отправлен!");
    } catch (error) {
        console.error("❌ Ошибка при отправке инвойса:", error);
        bot.sendMessage(chatId, "❌ Ошибка при создании инвойса. Попробуйте позже.");
    }
}

// ✅ Бот обрабатывает команду покупки (от Mini App)
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Проверяем, есть ли запрос на оплату
    if (text && text.startsWith("PAYMENT_REQUEST|")) {
        const parts = text.split("|");
        if (parts.length < 4) {
            return bot.sendMessage(chatId, "❌ Ошибка: неверный формат запроса.");
        }

        const trainingId = parts[1];
        const price = parseInt(parts[2], 10);
        const title = parts[3];

        console.log(`✅ Обрабатываем платеж: ID ${trainingId}, Цена ${price}, Название ${title}`);

        // Отправляем инвойс
        await sendInvoice(chatId, title, trainingId, price);
    }
});

// ✅ Подтверждение оплаты
bot.on("pre_checkout_query", async (query) => {
    await bot.answerPreCheckoutQuery(query.id, true);
});

// 🎉 Обработка успешной оплаты
bot.on("successful_payment", async (msg) => {
    const chatId = msg.chat.id;
    const paymentInfo = msg.successful_payment;

    console.log("✅ Оплата прошла! Данные о платеже:", paymentInfo);

    try {
        // if (!paymentInfo.invoice_payload) {
        //     throw new Error("🚨 Ошибка: invoice_payload отсутствует!");
        // }

        // ✅ Получаем user_id и telegram_id из payload
        const payload = JSON.parse(paymentInfo.invoice_payload);
        const telegramId = payload.telegram_id; // Telegram ID
        const userId = payload.user_id; // User ID из базы данных
        const trainingId = payload.training_id;

        console.log(`📦 Полученные данные: Telegram ID: ${telegramId}, User ID: ${userId}, Training ID: ${trainingId}`);

        // if (!userId) {
        //     throw new Error("❌ Ошибка: user_id отсутствует в payload!");
        // }

        // **Добавляем тренировку пользователю**
        console.log(`🌍 Добавляем тренировку ${trainingId} пользователю ${userId}`);

        const addTrainingResponse = await axios.post(`${backendUrl}/trainings/add-training`, {
            user_id: userId,
            training_id: trainingId,
        });

        console.log("✅ Тренировка добавлена:", addTrainingResponse.data);
        await bot.sendMessage(chatId, `✅ Поздравляем! Вы купили план тренировок 🎉 Теперь он доступен в вашем профиле.`);

    } catch (error) {
        console.error("❌ Ошибка при обработке покупки:", error);
        await bot.sendMessage(chatId, "⚠ Ошибка при обработке платежа. Свяжитесь с поддержкой.");
    }
});

console.log("🚀 Bot is running...");
//test update



//
// // 💰 Handle /buy command to request payment with Telegram Stars
// bot.onText(/\/buy/, async (msg) => {
//     const chatId = msg.chat.id;
//
//     try {
//         await bot.sendInvoice(
//             chatId,
//             "План тренировок", // ✅ Title (REQUIRED)
//             "Доступ к эксклюзивному плану тренировок", // ✅ Description (REQUIRED)
//             `purchase_${chatId}_${Date.now()}`, // ✅ Unique Payload (Order ID)
//             "", // ✅ Leave provider_token empty for Telegram Stars
//             "XTR", // ✅ Currency for Telegram Stars
//             [
//                 { label: "План тренировок", amount: 1 } // ✅ 500 Stars
//             ],
//             {
//                 need_name: false,
//                 need_phone_number: false,
//                 need_email: false,
//                 need_shipping_address: false,
//                 send_phone_number_to_provider: false,
//                 send_email_to_provider: false,
//                 is_flexible: false
//             }
//         );
//
//         console.log("✅ Инвойс успешно отправлен!");
//
//     } catch (error) {
//         console.error("❌ Ошибка при отправке инвойса:", error);
//     }
// });
//
// // ✅ Handle successful payments
// bot.on("pre_checkout_query", async (query) => {
//     await bot.answerPreCheckoutQuery(query.id, true);
// });
//
// // ✅ Handle successful payments (confirm training plan purchase)
// bot.on("successful_payment", async (msg) => {
//     const chatId = msg.chat.id;
//     const paymentInfo = msg.successful_payment;
//     let payload;
//
//     try {
//         // Check if payload is valid JSON or just a plain string
//         if (paymentInfo.invoice_payload.startsWith("{")) {
//             payload = JSON.parse(paymentInfo.invoice_payload); // If JSON, parse it
//         } else {
//             payload = { order_id: paymentInfo.invoice_payload }; // Otherwise, store as a string
//         }
//
//         console.log("✅ Оплата завершена!", paymentInfo);
//
//         // Extract user_id and training_id from payload (if available)
//         const userId = payload.user_id || chatId;
//         const trainingId = payload.training_id || "default_training_plan";
//
//         // Here, you should save the purchase to a database or give the user access
//         await bot.sendMessage(chatId, `🎉 Оплата прошла успешно! Вы получили доступ к плану тренировок.`);
//
//     } catch (error) {
//         console.error("❌ Ошибка при обработке покупки:", error);
//         bot.sendMessage(chatId, "⚠ Ошибка при обработке платежа. Свяжитесь с поддержкой.");
//     }
// });
//
// console.log("🚀 Bot is ready!");
