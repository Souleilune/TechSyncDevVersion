// test-deps.js
console.log('Testing basic express...');
const express = require('express');
console.log('✓ Express loaded');

console.log('Testing cors...');
const cors = require('cors');
console.log('✓ CORS loaded');

console.log('Testing helmet...');
const helmet = require('helmet');
console.log('✓ Helmet loaded');

console.log('Testing rate limit...');
const rateLimit = require('express-rate-limit');
console.log('✓ Rate limit loaded');

console.log('Testing dotenv...');
require('dotenv').config();
console.log('✓ Dotenv loaded');

console.log('All dependencies loaded successfully!');