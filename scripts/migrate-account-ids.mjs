import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { User, AccountIdRegistry } from '../lib/models.js';
import { isEligibleRole, generateUniqueAccountId, formatAccountId } from '../lib/accountId.js';

async function migrate() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urbanfinder';
  console.log(`Connecting to MongoDB at ${uri}...`);
  await mongoose.connect(uri);

  console.log('Fetching all users...');
  const users = await User.find({});
  console.log(`Found ${users.length} total users.`);

  let migratedCount = 0;
  let alreadyValidCount = 0;
  let nonEligibleCount = 0;

  for (const user of users) {
    if (!isEligibleRole(user.role)) {
      nonEligibleCount++;
      // If a non-eligible user accidentally had an accountId, clear it
      if (user.accountId || user.accountIdNumber) {
        console.log(`Clearing non-eligible account ID from ${user.role} (${user.email})`);
        user.accountId = undefined;
        user.accountIdNumber = undefined;
        user.accountType = undefined;
        await user.save();
      }
      continue;
    }

    // Check if user already has an accountId and registry entry
    if (user.accountId && user.accountIdNumber) {
      alreadyValidCount++;
      // Verify registry has it
      const regExists = await AccountIdRegistry.findOne({ number: user.accountIdNumber });
      if (!regExists) {
        try {
          await AccountIdRegistry.create({
            number: user.accountIdNumber,
            accountId: user.accountId,
            accountType: user.role,
            user: user._id
          });
          console.log(`Synced existing ${user.accountId} (${user.role}: ${user.email}) to registry.`);
        } catch (e) {
          console.warn(`Registry sync warning for ${user.accountId}:`, e.message);
        }
      }
      continue;
    }

    // Assign new unique account ID
    try {
      const generated = await generateUniqueAccountId(user.role, user._id);
      user.accountId = generated.accountId;
      user.accountIdNumber = generated.accountIdNumber;
      user.accountType = user.role;
      await user.save();
      migratedCount++;
      console.log(`[MIGRATED] Assigned ${user.accountId} to ${user.role} (${user.name} - ${user.email})`);
    } catch (err) {
      console.error(`Failed to assign Account ID to ${user.email}:`, err);
    }
  }

  console.log('--- Migration Summary ---');
  console.log(`Total users processed: ${users.length}`);
  console.log(`Newly assigned Account IDs: ${migratedCount}`);
  console.log(`Already valid Account IDs: ${alreadyValidCount}`);
  console.log(`Non-eligible users (Customer / Provider): ${nonEligibleCount}`);

  // Print all eligible accounts
  const eligibleUsers = await User.find({ role: { $in: ['channel_partner', 'broker', 'builder', 'owner'] } })
    .select('name email role accountId accountIdNumber')
    .lean();

  console.log('\n--- Current Eligible Accounts in DB ---');
  eligibleUsers.forEach(u => {
    console.log(`- [${u.role.toUpperCase()}] ${u.name} (${u.email}): ${u.accountId} (suffix: ${u.accountIdNumber})`);
  });

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
