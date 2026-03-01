require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const Post = require('./models/Post');

const app = express();

// اتصال MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch(err => console.error('❌ خطأ في الاتصال:', err));

// إعدادات العرض
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // يوم واحد
}));

// تمرير بيانات الجلسة إلى جميع القوالب
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.username = req.session.username;
  next();
});

// الصفحة الرئيسية - عرض جميع المنشورات
app.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username avatar').sort('-createdAt');
    res.render('index', { posts });
  } catch (err) {
    console.error(err);
    res.send('حدث خطأ');
  }
});

// استخدام Routes
app.use('/', authRoutes);
app.use('/posts', postRoutes);

// بدء الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
});
