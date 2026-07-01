const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Не обязателен, если Railway подставит переменные

const app = express();
app.use(bodyParser.json());

const allowedOrigins = (process.env.CORS_ORIGIN || 'https://zhiroazhigatel.netlify.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Разрешите отправку cookies/credentials
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data', 'Telegram-Init-Data']
}));

// testing without headers
//
// // Проверка подключения к базе данных
// app.use((req, res, next) => {
//     console.log("Request Headers:", req.headers);
//     res.setHeader('Access-Control-Allow-Origin', 'https://zhiroazhigatel.netlify.app'); // Ваш фронтенд-домен
//     res.setHeader('Access-Control-Allow-Credentials', 'true'); // Обязательно для cookies/credentials
//     res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE'); // Поддерживаемые методы
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Обязательно, если передаются данные
//     next();
// });


// routes connections
const testRoutes = require('./routes/test');
const setupRoutes = require('./routes/setup');
const userRoutes = require('./routes/users');
const insertMealPlans = require('./routes/insertMealPlans');
const guidesRoutes = require('./routes/guides');
const insertMealPlansDays = require('./routes/insertMealPlanDays');
const mealPlansRoutes = require('./routes/mealplans');
const user_guidesRoutes = require('./routes/user_guides');
const user_mealplansRoutes = require('./routes/user_mealplans');
const mealsRoutes = require('./routes/mealsRoutes');
const trainingPlansRoutes = require('./routes/trainingPlansRoutes');


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Zhiroszhigatel backend is running' });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// routes application
app.use('/test', testRoutes);
app.use('/setup', setupRoutes);
app.use('/users', userRoutes);
app.use('/mealplans', insertMealPlans);
app.use('/guides', guidesRoutes);
app.use('/mealplans-days', insertMealPlansDays);
app.use('/mealplans', mealPlansRoutes);
app.use('/user_guides', user_guidesRoutes);
app.use('/user_mealplans', user_mealplansRoutes);
app.use('/meals', mealsRoutes);
app.use('/trainings', trainingPlansRoutes);

app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    console.log("Requested");
    next();
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, '::', () => {
    console.log(`Server listening on [::]${PORT}`);
});
