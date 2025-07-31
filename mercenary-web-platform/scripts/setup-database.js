#!/usr/bin/env node

/**
 * Database Setup Script for Mercenary Platform
 * This script helps configure the database connection and run initial setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Mercenary Platform - Database Setup');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('Please make sure .env.local exists in the project root.');
  process.exit(1);
}

// Read current .env.local
const envContent = fs.readFileSync(envPath, 'utf8');

// Check if database URLs are configured
const hasRealDB = envContent.includes('supabase.co') || 
                  envContent.includes('neon.tech') || 
                  envContent.includes('railway.app');

if (!hasRealDB) {
  console.log('📋 Database Configuration Needed');
  console.log('================================\n');
  console.log('Your database is not yet configured. Please follow these steps:\n');
  
  console.log('1. 🌐 Go to https://supabase.com');
  console.log('2. 📝 Create a new account or sign in');
  console.log('3. ➕ Create a new project named "mercenary-platform"');
  console.log('4. 🔑 Copy your database connection string');
  console.log('5. 📝 Update your .env.local file with the real URLs\n');
  
  console.log('Example format:');
  console.log('DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public&sslmode=require"');
  console.log('DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public&sslmode=require"\n');
  
  console.log('After updating .env.local, run this script again!');
  process.exit(0);
}

console.log('✅ Database URLs found in .env.local');

// Test database connection
console.log('\n🔍 Testing database connection...');
try {
  execSync('npx prisma db pull', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Database connection successful!');
} catch (error) {
  console.error('❌ Database connection failed!');
  console.log('\nPlease check:');
  console.log('- Your DATABASE_URL is correct');
  console.log('- Your password doesn\'t contain special characters');
  console.log('- You have internet connection');
  console.log('- The database server is running');
  process.exit(1);
}

// Push schema to database
console.log('\n📊 Creating database tables...');
try {
  execSync('npx prisma db push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Database tables created successfully!');
} catch (error) {
  console.error('❌ Failed to create database tables!');
  process.exit(1);
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Prisma client generated successfully!');
} catch (error) {
  console.error('❌ Failed to generate Prisma client!');
  process.exit(1);
}

// Verify everything works
console.log('\n🧪 Running final verification...');
try {
  execSync('npm run type-check', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ TypeScript compilation successful!');
} catch (error) {
  console.log('⚠️  TypeScript check had some warnings, but database setup is complete.');
}

console.log('\n🎉 Database Setup Complete!');
console.log('==========================\n');
console.log('Your database is now ready for the Mercenary platform!');
console.log('\nNext steps:');
console.log('1. 🚀 Start the development server: npm run dev');
console.log('2. 🔐 Test user registration and login');
console.log('3. 📊 Open Prisma Studio: npx prisma studio');
console.log('4. 🎮 Start building amazing features!\n');

console.log('Happy coding! 🚀');
