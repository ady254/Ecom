import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Resolve .env relative to this file's location (apps/api/.env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not found in .env — check apps/api/.env exists');
  process.exit(1);
}

// ─── Admin credentials ────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'itsadnanahmad5@gmail.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME = 'Adnan Ahmed';
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🔌  Connecting to MongoDB (minara)...');
  await mongoose.connect(MONGODB_URI!, { dbName: 'minara' });
  console.log(`✅  Connected to: ${mongoose.connection.host}`);

  // Use the exact same schema as user.model.ts so pre-save hooks work
  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, minlength: 8, select: false },
      phone: String,
      role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
      googleId: String,
      avatar: String,
      addresses: { type: Array, default: [] },
      wishlist: { type: Array, default: [] },
      isActive: { type: Boolean, default: true },
      refreshToken: { type: String, select: false },
    },
    { timestamps: true }
  );

  // Add the same pre-save bcrypt hook as the real UserModel
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password as string, 12);
    next();
  });

  // Reuse registered model if it already exists in this connection
  const User = (mongoose.models.User as mongoose.Model<mongoose.Document> | undefined)
    ?? mongoose.model('User', userSchema);

  const existing = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

  if (existing) {
    // Always reset password so we know exactly what it is
    (existing as mongoose.Document & { password: string; role: string; name: string }).password = ADMIN_PASSWORD;
    (existing as mongoose.Document & { role: string }).role = 'admin';
    (existing as mongoose.Document & { name: string }).name = ADMIN_NAME;
    await existing.save();
    console.log(`✅  Existing user updated → role: admin, password reset`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`✅  Admin user created`);
  }

  // Verify — try a bcrypt compare to confirm password is correct
  const check = await User.findOne({ email: ADMIN_EMAIL }).select('+password') as
    (mongoose.Document & { password: string }) | null;

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
  console.log(`   URL:      http://localhost:3001/login`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('──────────────────────────────────────────\n');
  console.log('⚡  Make sure the API server is running:');
  console.log('   cd apps/api && pnpm dev\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
