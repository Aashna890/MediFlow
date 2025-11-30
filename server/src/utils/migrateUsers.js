import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for migration');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Define simple schema for migration
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  passwordHistory: [{
    password: String,
    changedAt: Date
  }],
  forcePasswordChange: Boolean,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  passwordChangedAt: Date,
  createdAt: Date
}, { timestamps: true, strict: false });

const User = mongoose.model('User', userSchema);

const migrateExistingUsers = async () => {
  try {
    await connectDB();

    console.log('Starting user migration...');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        // Check if user already has new fields
        if (user.passwordHistory !== undefined && user.forcePasswordChange !== undefined) {
          console.log(`User ${user.email} already migrated, skipping...`);
          skippedCount++;
          continue;
        }

        // Add new fields without changing password
        user.passwordHistory = [];
        user.forcePasswordChange = false;
        user.passwordChangedAt = user.createdAt || new Date();

        // Save without triggering password hashing middleware
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              passwordHistory: [],
              forcePasswordChange: false,
              passwordChangedAt: user.createdAt || new Date()
            }
          }
        );

        console.log(`✓ Migrated user: ${user.email}`);
        migratedCount++;
      } catch (error) {
        console.error(`✗ Error migrating user ${user.email}:`, error.message);
      }
    }

    console.log('\n=================================');
    console.log('Migration Summary:');
    console.log(`Total users: ${users.length}`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log('=================================\n');

    console.log('Migration completed successfully!');
    console.log('Note: Existing passwords remain unchanged.');
    console.log('Users can continue logging in with their current passwords.');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// Run migration
migrateExistingUsers();
