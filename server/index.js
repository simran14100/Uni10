// server/index.js
// server/index.js
const path = require('path');

// 1) Load root .env  => /www/wwwroot/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
// 2) Then load server/.env as fallback (yeh existing values override NAHI karega)
    require('dotenv').config({ path: path.join(__dirname, '.env') });

    console.log('[ENV CHECK] Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Loaded' : 'Not Set');
    console.log('[ENV CHECK] Cloudinary API Key:', process.env.CLOUDINARY_API_KEY ? mask(process.env.CLOUDINARY_API_KEY) : 'Not Set');
    console.log('[ENV CHECK] Cloudinary API Secret:', process.env.CLOUDINARY_API_SECRET ? mask(process.env.CLOUDINARY_API_SECRET) : 'Not Set');

// ✅ add this right after the two dotenv.config(...) lines
const fs = require('fs');

function mask(v) {
  if (!v || v.length < 6) return v ? '***' : '(empty)';
  return v.slice(0, 4) + '***' + v.slice(-2);
}

const ROOT_ENV = path.join(__dirname, '..', '.env');
const SERVER_ENV = path.join(__dirname, '.env');

console.log('[ENV PATHS]', {
  ROOT_ENV,
  SERVER_ENV,
  rootExists: fs.existsSync(ROOT_ENV),
  serverExists: fs.existsSync(SERVER_ENV),
});

console.log(
  '[ENV CHECK]',
  'KEY_ID:', mask(process.env.RAZORPAY_KEY_ID || ''),
  'KEY_SECRET:', mask(process.env.RAZORPAY_KEY_SECRET || ''),
  'CURRENCY:', process.env.RAZORPAY_CURRENCY || '(empty)'
);

console.log('[CWD]', process.cwd());






const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const categoriesRoutes = require('./routes/categories');
const wishlistRoutes = require('./routes/wishlist');
const reviewsRoutes = require('./routes/reviews');
const settingsRoutes = require('./routes/settings');
const uploadsRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');
const supportRoutes = require('./routes/support');
const invoicesRoutes = require('./routes/invoices');
const inquiryRoutes = require('./routes/inquiry');
const couponsRoutes = require('./routes/coupons');
const paymentRoutes = require('./routes/payment');
const trackingRoutes = require('./routes/tracking');
const shippingRoutes = require('./routes/shipping');
const influencerDataRoutes = require('./routes/influencerData');
const seoRoutes = require('./routes/seo');

const app = express();
const PORT = process.env.PORT || 5055;

/* --------------------------- LOG EACH REQUEST --------------------------- */
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

/* -------------------------------- CORS --------------------------------- */
// Disable CORS restrictions for development
const corsOptions = {
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));
console.log('[CORS] Enabled with options:', corsOptions);

/* ------------------------- STATIC UPLOAD DIRECTORIES -------------------- */
// Serve uploaded files from server/uploads (same as multer destination)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Also expose uploads under /api/uploads for frontends that proxy only /api

/* -------------------------- SERVE CLIENT-SIDE BUILD ------------------------- */
// Serve static files from the client-side build directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

// API routes (or other specific routes) should go here

/* ---------------------------- CORE MIDDLEWARES -------------------------- */
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ------------------- SERVER-SIDE SEO META TAG INJECTION ------------------- */
// This middleware handles frontend routes and injects product-specific meta tags
const { seoMetaInjectionMiddleware } = require('./middleware/seoMetaInjection');
app.use(seoMetaInjectionMiddleware);

/* -------------------------------- ROUTES -------------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api', influencerDataRoutes);



// For any other requests, serve the index.html from the client-side build

// For any other requests, serve the index.html from the client-side build
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'));
});


// Debug env endpoint (masking enabled)
app.get('/api/_debug/env', (_req, res) => {
  const mask = (v) =>
    !v || v.length < 6 ? (v ? '***' : '(empty)') : v.slice(0, 4) + '***' + v.slice(-2);

  res.json({
    ok: true,
    data: {
      RZP_KEY_ID: mask(process.env.RAZORPAY_KEY_ID || ''),
      RZP_KEY_SECRET: mask(process.env.RAZORPAY_KEY_SECRET || ''),
      RZP_CURRENCY: process.env.RAZORPAY_CURRENCY || '(empty)',
      MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
      JWT_SECRET: mask(process.env.JWT_SECRET || ''),
    },
  });
});












// General error handling middleware
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER]', err);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  res.status(statusCode).json({ ok: false, message });
});

function logRoutes() {
  app._router.stack.forEach(function (middleware) {
    if (middleware.route) { // routes registered directly on the app
      console.log(`[ROUTE] ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') { // router middleware 
      middleware.handle.stack.forEach(function (handler) {
        const route = handler.route;
        if (route) {
          // Adjust middleware.regexp.source to correctly extract the mounted path
          const mountedPath = middleware.regexp.source
            .replace('^\\/', '/')
            .replace('\\/?(?:(?=/)|$)', '')
            .replace('\\b/?(?!\\/|$)', ''); // Remove trailing slashes and regex artifacts
          console.log(`[ROUTE] ${Object.keys(route.methods).join(', ').toUpperCase()} ${mountedPath === '/' ? '' : mountedPath}${route.path}`);
        }
      });
    }
  });
}

async function start() {
  const uri = process.env.MONGODB_URI;
  console.log('[MONGODB_URI]', uri ? 'Loaded' : 'Not Set', uri || '(empty)');

  if (!uri) {
    console.warn(
      'MONGODB_URI not set; starting server without DB connection. Some API routes may be unavailable.'
    );
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log('Static uploads available at /uploads and /api/uploads');
      logRoutes(); // Call logRoutes after server starts
    });
    return;
  }

  try {
    await mongoose.connect(uri, { dbName: 'UNI10' });
    console.log('Connected to MongoDB (UNI10)');

    // Seed base users (idempotent)
    try {
      const User = require('./models/User');
      const bcrypt = require('bcrypt');

      const seeds = [
        { name: 'UNI10 Admin', email: 'uni10@gmail.com', password: '12345678', role: 'admin' },
        { name: 'Sachin', email: 'sachin@gmail.com', password: '123456', role: 'user' },
        // Add another seed only if you want this account available:
        // { name: 'Sachin T', email: 'sachintakoria2204@gmail.com', password: '12345678', role: 'user' },
      ];

      for (const s of seeds) {
        const email = s.email.toLowerCase();
        const existing = await User.findOne({ email });
        if (!existing) {
          const hash = await bcrypt.hash(s.password, 10);
          await User.create({
            name: s.name,
            email,
            passwordHash: hash,
            role: s.role,
          });
          console.log(`${s.role} user created: ${email}`);
        } else {
          // ensure role correct for admin
          if (s.role === 'admin' && existing.role !== 'admin') {
            existing.role = 'admin';
            await existing.save();
            console.log(`Existing user promoted to admin: ${email}`);
          } else {
            console.log(`${s.role} user already exists: ${email}`);
          }
        }
      }
    } catch (e) {
      console.error('Failed to seed users', e);
    }

    // Ensure default feature rows exist in home settings
    try {
      const SiteSetting = require('./models/SiteSetting');
      let settings = await SiteSetting.findOne();
      if (!settings) {
        settings = await SiteSetting.create({
          home: {
            featureRows: [
              { key: 'tshirts', title: 'T-SHIRTS', link: '/collection/t-shirts', imageAlt: 'T-Shirts Collection' },
              { key: 'denims', title: 'DENIMS', link: '/collection/denims', imageAlt: 'Denims Collection' },
              { key: 'hoodies', title: 'HOODIES', link: '/collection/hoodies', imageAlt: 'Hoodies Collection' },
            ],
          },
        });
        console.log('Default feature rows created in home settings');
      } else if (!settings.home || !settings.home.featureRows || settings.home.featureRows.length === 0) {
        settings.home = settings.home || {};
        settings.home.featureRows = [
          { key: 'tshirts', title: 'T-SHIRTS', link: '/collection/t-shirts', imageAlt: 'T-Shirts Collection' },
          { key: 'denims', title: 'DENIMS', link: '/collection/denims', imageAlt: 'Denims Collection' },
          { key: 'hoodies', title: 'HOODIES', link: '/collection/hoodies', imageAlt: 'Hoodies Collection' },
        ];
        await settings.save();
        console.log('Default feature rows added to existing home settings');
      }
    } catch (e) {
      console.error('Failed to seed feature rows', e);
    }

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log('Static uploads available at /uploads and /api/uploads');
      logRoutes(); // Call logRoutes after server starts
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} (without DB)`);
      console.log('Static uploads available at /uploads and /api/uploads');
    });
  }
}

start();

function logRoutes() {
  app._router.stack.forEach(function (middleware) {
    if (middleware.route) { // routes registered directly on the app
      console.log(`[ROUTE] ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') { // router middleware 
      middleware.handle.stack.forEach(function (handler) {
        const route = handler.route;
        if (route) {
          // Adjust middleware.regexp.source to correctly extract the mounted path
          const mountedPath = middleware.regexp.source
            .replace('^\\/', '/')
            .replace('\\/?(?:(?=/)|$)', '')
            .replace('\\b/?(?!\\/|$)', ''); // Remove trailing slashes and regex artifacts
          console.log(`[ROUTE] ${Object.keys(route.methods).join(', ').toUpperCase()} ${mountedPath === '/' ? '' : mountedPath}${route.path}`);
        }
      });
    }
  });
}
