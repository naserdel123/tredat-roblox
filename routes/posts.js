const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Middleware للتحقق من تسجيل الدخول
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// صفحة إنشاء منشور جديد
router.get('/new', requireLogin, (req, res) => {
  res.render('new', { error: null });
});

// معالجة إنشاء منشور جديد
router.post('/new', requireLogin, upload.fields([
  { name: 'itemImage', maxCount: 1 },
  { name: 'wantImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { itemName, want, tiktokUrl } = req.body;

    // تحويل الصور إلى Base64
    let itemImageBase64 = '';
    if (req.files['itemImage'] && req.files['itemImage'][0]) {
      const file = req.files['itemImage'][0];
      itemImageBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    let wantImageBase64 = '';
    if (req.files['wantImage'] && req.files['wantImage'][0]) {
      const file = req.files['wantImage'][0];
      wantImageBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    if (!itemImageBase64 || !wantImageBase64) {
      return res.render('new', { error: 'يرجى رفع الصور المطلوبة' });
    }

    const newPost = new Post({
      user: req.session.userId,
      itemName,
      itemImage: itemImageBase64,
      want,
      wantImage: wantImageBase64,
      tiktokUrl
    });

    await newPost.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('new', { error: 'حدث خطأ أثناء النشر' });
  }
});

module.exports = router;
