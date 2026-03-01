const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// إعداد multer لقراءة الملفات من الذاكرة (بدون تخزين محلي)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // حد 5 ميجا للصورة
});

// صفحة تسجيل الدخول
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('login', { error: null });
});

// معالجة تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('login', { error: 'اسم المستخدم غير موجود' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { error: 'كلمة المرور غير صحيحة' });
    }
    req.session.userId = user._id;
    req.session.username = user.username;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'حدث خطأ، حاول مرة أخرى' });
  }
});

// صفحة تسجيل حساب جديد
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('register', { error: null });
});

// معالجة تسجيل حساب جديد مع رفع صورة الأفتار
router.post('/register', upload.single('avatar'), async (req, res) => {
  try {
    const { username, password } = req.body;
    // التحقق من عدم وجود اسم مستخدم مكرر
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { error: 'اسم المستخدم موجود بالفعل' });
    }

    // تحويل صورة الأفتار إلى Base64 إذا وُجدت
    let avatarBase64 = '';
    if (req.file) {
      avatarBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم الجديد
    const newUser = new User({
      username,
      password: hashedPassword,
      avatar: avatarBase64
    });

    await newUser.save();

    // تسجيل الدخول تلقائياً بعد التسجيل
    req.session.userId = newUser._id;
    req.session.username = newUser.username;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'حدث خطأ، حاول مرة أخرى' });
  }
});

// تسجيل الخروج
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
