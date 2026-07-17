import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { UserModel } from '../modules/users/user.model.js';

// Run from apps/api (pnpm seed:admin) — .env lives in the package root
dotenv.config({ path: resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not found in .env — check apps/api/.env exists');
  process.exit(1);
}

// ─── Admin credentials (override via env in production!) ─────────────────────
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@minaragifting.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Minara@admin@gifting2026';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Adnan Ahmed';
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_ADMIN_PASSWORD) {
    console.error('❌  In production you must set SEED_ADMIN_PASSWORD — refusing to seed the default password');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB (minara)...');
  await mongoose.connect(MONGODB_URI!, { dbName: 'minara' });
  console.log(`✅  Connected to: ${mongoose.connection.host}`);

  const existing = await UserModel.findOne({ email: ADMIN_EMAIL }).select('+password');

  if (existing) {
    // Always reset password so we know exactly what it is
    existing.password = ADMIN_PASSWORD;
    existing.role = 'admin';
    existing.name = ADMIN_NAME;
    await existing.save();
    console.log('✅  Existing user updated → role: admin, password reset');
  } else {
    await UserModel.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      emailVerified: true,
    });
    console.log('✅  Admin user created');
  }

  // Verify — try a bcrypt compare to confirm password is correct
  const check = await UserModel.findOne({ email: ADMIN_EMAIL }).select('+password');

  if (!check?.password) {
    console.error('❌  Password not found after save — something went wrong');
    process.exit(1);
  }
  const valid = await bcrypt.compare(ADMIN_PASSWORD, check.password);
  if (!valid) {
    console.error('❌  Password verification failed — bcrypt mismatch');
    process.exit(1);
  }
  console.log('✅  Password verified with bcrypt');

  console.log('\n──────────────────────────────────────────');
  console.log('   MINARA Admin Dashboard — Login Details  ');
  console.log('──────────────────────────────────────────');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${process.env.SEED_ADMIN_PASSWORD ? '(from SEED_ADMIN_PASSWORD)' : ADMIN_PASSWORD}`);
  console.log('──────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
