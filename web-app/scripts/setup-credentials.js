#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Mercenary Platform - Configuración de Credenciales');
console.log('=====================================================\n');

const envPath = path.join(__dirname, '..', '.env.local');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupCredentials() {
  console.log('📋 Este script te ayudará a configurar todas las credenciales necesarias.\n');
  
  const credentials = {};
  
  // Supabase Configuration
  console.log('🗄️  CONFIGURACIÓN DE SUPABASE');
  console.log('────────────────────────────');
  credentials.DATABASE_URL = await question('Database URL de Supabase: ');
  credentials.NEXT_PUBLIC_SUPABASE_URL = await question('Supabase Project URL: ');
  credentials.NEXT_PUBLIC_SUPABASE_ANON_KEY = await question('Supabase Anon Key: ');
  credentials.SUPABASE_SERVICE_ROLE_KEY = await question('Supabase Service Role Key: ');
  
  console.log('\n🔑 CONFIGURACIÓN DE GOOGLE OAUTH');
  console.log('─────────────────────────────────');
  credentials.GOOGLE_CLIENT_ID = await question('Google Client ID: ');
  credentials.GOOGLE_CLIENT_SECRET = await question('Google Client Secret: ');
  
  console.log('\n🐙 CONFIGURACIÓN DE GITHUB OAUTH');
  console.log('─────────────────────────────────');
  credentials.GITHUB_CLIENT_ID = await question('GitHub Client ID: ');
  credentials.GITHUB_CLIENT_SECRET = await question('GitHub Client Secret: ');
  
  // Generate .env.local content
  const envContent = `# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=mercenary-super-secret-jwt-key-2025-production-ready

# Database Configuration (PostgreSQL - Supabase)
DATABASE_URL="${credentials.DATABASE_URL}"
# Local SQLite for development (backup)
DATABASE_URL_SQLITE="file:./dev.db"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="${credentials.NEXT_PUBLIC_SUPABASE_URL}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${credentials.NEXT_PUBLIC_SUPABASE_ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${credentials.SUPABASE_SERVICE_ROLE_KEY}"

# OAuth Providers
GOOGLE_CLIENT_ID="${credentials.GOOGLE_CLIENT_ID}"
GOOGLE_CLIENT_SECRET="${credentials.GOOGLE_CLIENT_SECRET}"
GITHUB_CLIENT_ID="${credentials.GITHUB_CLIENT_ID}"
GITHUB_CLIENT_SECRET="${credentials.GITHUB_CLIENT_SECRET}"

# API Configuration
API_BASE_URL=http://localhost:3000/api/v1
`;

  // Write to .env.local
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ CONFIGURACIÓN COMPLETADA');
  console.log('═══════════════════════════');
  console.log(`📁 Archivo creado: ${envPath}`);
  console.log('\n🚀 Próximos pasos:');
  console.log('1. Ejecutar: npx prisma db push');
  console.log('2. Ejecutar: npx prisma generate');
  console.log('3. Ejecutar: npm run dev');
  console.log('4. Testear OAuth en http://localhost:3000/login');
  
  rl.close();
}

async function checkExistingEnv() {
  if (fs.existsSync(envPath)) {
    const overwrite = await question('\n⚠️  El archivo .env.local ya existe. ¿Sobrescribir? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('❌ Configuración cancelada.');
      rl.close();
      return false;
    }
  }
  return true;
}

async function main() {
  try {
    const proceed = await checkExistingEnv();
    if (proceed) {
      await setupCredentials();
    }
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    rl.close();
  }
}

if (require.main === module) {
  main();
}
