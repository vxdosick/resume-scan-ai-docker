const express = require('express');
const app = express();
const path = require('path');
const promptRoutes = require('./routes/promptRoutes');
const errorRoutes = require('./routes/errorRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')
const authMiddleware = require('./middlewares/authMiddleware')
const PORT = 3000;

require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));

app.use('/send-prompt', authMiddleware, promptRoutes);

app.use('/auth', authRoutes);

app.use('/error', errorRoutes);
app.get('/', (req, res) => {
    res.render('index-nonauth', {title: "ResumeScanAi"});
})
app.use('/dashboard', authMiddleware, dashboardRoutes);

const start = async () => {
    try {
        await mongoose.connect('mongodb://mongo:27017/MWC_project', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("MongoDB connected successfully");
       app.listen(PORT, () => {
           console.log(`Server started on port http://localhost:${PORT}`);
       }) 
    } catch (error) {
        console.error("Error: ", error);
    }
}
start() 