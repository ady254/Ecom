/**
 * Migration: quranOptions / tasbeehOptions / janamazOptions → variants[]
 *
 * Run once against your live MongoDB to move all legacy product option data
 * into the new unified variants[] structure.
 *
 * Usage:
 *   cd apps/api
 *   npx ts-node -e "require('./src/scripts/migrate-options-to-variants')"
 *
 * Or with the .env loaded:
 *   node -r dotenv/config -e "require('./dist/scripts/migrate-options-to-variants')"
 */

import mongoose from 'mongoose';
import { ProductModel } from '../modules/products/product.model';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI env var is not set');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const products = await ProductModel.find({
    $or: [
      { 'quranOptions.enabled': true },
      { 'tasbeehOptions.enabled': true },
      { 'janamazOptions.enabled': true },
    ],
  });

  console.log(`Found ${products.length} products to migrate`);
  let migrated = 0;

  for (const p of products) {
    const existingNames = new Set((p.variants ?? []).map(v => v.name));
    let changed = false;

    if (
      p.quranOptions?.enabled &&
      (p.quranOptions.languages ?? []).length > 0 &&
      !existingNames.has('Quran Type')
    ) {
      p.variants.push({
        name: 'Quran Type',
        options: p.quranOptions.languages.map(l => ({ label: l })),
      });
      changed = true;
    }

    if (
      p.tasbeehOptions?.enabled &&
      (p.tasbeehOptions.types ?? []).length > 0 &&
      !existingNames.has('Tasbeeh Type')
    ) {
      p.variants.push({
        name: 'Tasbeeh Type',
        options: p.tasbeehOptions.types.map(t => ({ label: t })),
      });
      changed = true;
    }

    if (
      p.janamazOptions?.enabled &&
      (p.janamazOptions.shapes ?? []).length > 0 &&
      !existingNames.has('Janamaz Shape')
    ) {
      p.variants.push({
        name: 'Janamaz Shape',
        options: p.janamazOptions.shapes.map(s => ({ label: s })),
      });
      changed = true;
    }

    if (changed) {
      await p.save();
      migrated++;
      console.log(`  ✓ Migrated: "${p.name}" (${p._id})`);
    }
  }

  console.log(`\nDone. Migrated ${migrated} / ${products.length} products.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
