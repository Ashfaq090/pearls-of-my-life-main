import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { KeyHolder } from '../entities/keyholder.entity';

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  try {
    const userRepository = dataSource.getRepository(User);
    const planRepository = dataSource.getRepository(SubscriptionPlan);
    const keyHolderRepository = dataSource.getRepository(KeyHolder);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@pearloflife.com' },
    });

    if (!existingAdmin) {
      // Create Admin User
      const adminPassword = await bcrypt.hash('Admin@123', 10);
      const admin = userRepository.create({
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@pearloflife.com',
        username: 'admin',
        hashed_password: adminPassword,
        role: UserRole.ADMIN,
        is_email_verified: true,
        is_active: true,
      });
      await userRepository.save(admin);
      console.log('✓ Admin user created: admin@pearloflife.com / Admin@123');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: 'user@example.com' },
    });

    let user;
    if (!existingUser) {
      // Create Regular User
      const userPassword = await bcrypt.hash('user123', 10);
      user = userRepository.create({
        first_name: 'John',
        last_name: 'Doe',
        email: 'user@example.com',
        username: 'johndoe',
        hashed_password: userPassword,
        role: UserRole.USER,
        is_email_verified: true,
        is_active: true,
      });
      await userRepository.save(user);
      console.log('✓ Regular user created: user@example.com / user123');
    } else {
      user = existingUser;
      console.log('✓ Regular user already exists');
    }

    // Create Subscription Plans (only if they don't exist)
    const existingPlans = await planRepository.find();
    if (existingPlans.length === 0) {
      // Advanced Auto-Obituary Plan
      const basicPlan = planRepository.create({
        name: 'Advanced Auto-Obituary Plan',
        price: 3,
        description:
          'Includes auto-obituary section plus additional life details.',
        features: JSON.stringify([
          '1 picture to be used as funeral program cover photo',
          'Grandchildren Names & age • Siblings (Dates & Degrees)',
          'Work Achievements',
          'Education Achievements',
          'Special Achievements',
          'When & where you met your spouse',
          'Other',
        ]),
        isActive: true,
        videoRecordingAllowed: false,
        maxVideoLengthInSeconds: 0,
        maxVideoUploads: 0,
        audioRecordingAllowed: false,
        maxAudioLengthInSeconds: 0,
        maxAudioUploads: 0,
        max_images: 1,
        maxNotes: 10,
        max_video_length: 0, // Legacy field
        max_uploads: 10, // Legacy field
        billing_period: 'monthly',
      });
      await planRepository.save(basicPlan);

      // Legacy Creation Plan
      const standardPlan = planRepository.create({
        name: 'Legacy Creation Plan',
        price: 7,
        description:
          'Leave the comfort of the sound of your voice. Make a video of you talking/singing etc. (Look in the section for talking topics.) Auto-obituary plan plus video memories, pictures, audio notes and short stories. Highlight your achievements over the years.',
        features: JSON.stringify([
          'Record up to ten 3-minute videos a year',
          'Upload up to 30 pictures w/ audio recorded descriptions.',
          'Record audio notes',
        ]),
        isActive: true,
        videoRecordingAllowed: true,
        maxVideoLengthInSeconds: 1800, // 30 minutes total (10 videos x 3 minutes)
        maxVideoUploads: 10,
        audioRecordingAllowed: true,
        maxAudioLengthInSeconds: 1800, // 30 minutes total
        maxAudioUploads: 20,
        max_images: 30,
        maxNotes: 50,
        max_video_length: 1800, // Legacy field
        max_uploads: 50, // Legacy field
        billing_period: 'monthly',
      });
      await planRepository.save(standardPlan);

      // Ultimate Legacy Creation Plan (excluded from public plans)
      // const premiumPlan = planRepository.create({
      //   name: 'Ultimate Legacy Creation Plan',
      //   price: 11,
      //   description:
      //     'Includes legacy creation plan plus additional videos, pictures and audio notes.',
      //   features: JSON.stringify([
      //     'Records an additional three minute video',
      //     'Show as seen at the end',
      //     'Includes additional 60 pictures & 20 audio notes.',
      //     'Unlimited video and audio recording',
      //   ]),
      //   isActive: true,
      //   videoRecordingAllowed: true,
      //   maxVideoLengthInSeconds: 7200, // 2 hours total
      //   maxVideoUploads: 50,
      //   audioRecordingAllowed: true,
      //   maxAudioLengthInSeconds: 7200, // 2 hours total
      //   maxAudioUploads: 100,
      //   max_images: 90, // 30 + 60 additional
      //   maxNotes: 200,
      //   max_video_length: 7200, // Legacy field
      //   max_uploads: 150, // Legacy field
      //   billing_period: 'monthly',
      // });
      // await planRepository.save(premiumPlan);

      console.log('✓ Subscription plans created');
    } else {
      console.log('✓ Subscription plans already exist');
    }

    // Create Key Holder for user (only if user exists and doesn't have one)
    if (user) {
      const existingKeyHolder = await keyHolderRepository.findOne({
        where: { user_id: user.id },
      });

      if (!existingKeyHolder) {
        const keyHolder = keyHolderRepository.create({
          user_id: user.id,
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          phone_number: '+1234567890',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          relation: 'Spouse',
          pin: '1234',
        });
        await keyHolderRepository.save(keyHolder);
        console.log('✓ Key holder created');
      } else {
        console.log('✓ Key holder already exists for user');
      }
    }

    console.log('✓ Database seeding completed successfully!');
  } catch (error) {
    console.error('✗ Error during database seeding:', error);
    throw error;
  }
}
