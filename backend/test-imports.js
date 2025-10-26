console.log('Testing individual imports...');

try {
  console.log('Testing config/supabase...');
  const supabase = require('./config/supabase');
  console.log('✓ Supabase config loaded');
} catch (error) {
  console.log('✗ Supabase config error:', error.message);
}

try {
  console.log('Testing middleware/errorHandler...');
  const errorHandler = require('./middleware/errorHandler');
  console.log('✓ Error handler loaded');
} catch (error) {
  console.log('✗ Error handler error:', error.message);
}

try {
  console.log('Testing routes/auth...');
  const authRoutes = require('./routes/auth');
  console.log('✓ Auth routes loaded');
  console.log('Auth routes type:', typeof authRoutes);
  console.log('Is function?', typeof authRoutes === 'function');
} catch (error) {
  console.log('✗ Auth routes error:', error.message);
}

console.log('Import test complete!');