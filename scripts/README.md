# Database Seeding Scripts

This directory contains scripts to populate your PostgreSQL database with dummy data for testing and development purposes.

## KYC Submissions Seeder

The `seed-kyc-submissions.js` script creates 30 dummy KYC submission records along with corresponding user accounts.

### What it creates:

1. **30 Users** with realistic names, emails, and phone numbers
2. **30 KYC Submissions** with varied statuses and levels

### Generated Data:

- **Users**: Random first/last names, email addresses, phone numbers
- **KYC Levels**: Randomly assigned levels 1, 2, or 3
- **KYC Statuses**:
  - PENDING (~33%)
  - PROCESSING (~17%)
  - APPROVED (~30%)
  - REJECTED (~20%)
- **Documents**: Simulated URLs for ID images, selfies, address proofs
- **Nationalities**: Mix of 20 different countries
- **ID Types**: passport, drivinglicense, idcard, bvn
- **Timestamps**: Realistic submission dates over the past 2 years

### Usage:

```bash
# Run the JavaScript version (recommended)
npm run seed:kyc

# Or run the TypeScript version
npm run seed:kyc:ts
```

### Prerequisites:

1. **PostgreSQL Database**: Make sure your Docker PostgreSQL container is running
2. **Environment Variables**: Ensure your `.env` file has the correct `DATABASE_URL`
3. **Prisma Schema**: Run `npx prisma migrate deploy` if needed

### Example output:

```
🌱 Starting to seed KYC submissions...
✅ Created/found user: john.smith0@example.com
✅ Created KYC submission for john.smith0@example.com - Status: APPROVED, Level: 1
...
🎉 Successfully created 30 KYC submissions!

📊 Summary:
Status distribution: { APPROVED: 9, PROCESSING: 5, PENDING: 10, REJECTED: 6 }
Level distribution: { 'Level 1': 10, 'Level 2': 10, 'Level 3': 10 }
Total submissions: 30
```

### Data Characteristics:

- **Realistic Names**: Uses common first and last names from various cultures
- **Unique Constraints**: Each user has unique email and username
- **Varied Statuses**: KYC submissions have different approval states
- **Random Timestamps**: Submissions spread across the last 2 years
- **Conditional Data**: Rejected submissions have rejection reasons
- **Optional Fields**: Some fields are randomly populated (backImage, addressProof, etc.)

### Database Tables Affected:

- `User` - Creates 30 new user records
- `KycSubmission` - Creates 30 KYC submission records linked to users

### Notes:

- The script uses `upsert` for users, so running it multiple times won't create duplicates
- All passwords are hashed using bcrypt with the default password "password123"
- KYC submissions are always created new (no upsert), so running multiple times will create additional submissions
- Image URLs are placeholder URLs for testing purposes

### Cleanup:

To remove all seeded data:

```sql
-- Remove KYC submissions first (due to foreign key constraints)
DELETE FROM "KycSubmission" WHERE "userId" IN (
  SELECT id FROM "User" WHERE email LIKE '%@example.com'
);

-- Remove seeded users
DELETE FROM "User" WHERE email LIKE '%@example.com';
```