export const TABLES = {
  USERS: 'Users',
  NOTES: 'Notes',
  CREDENTIALS: 'Credentials',
  IMAGE_DETAILS: 'ImageDetails',
  IMAGE_CATEGORIES: 'image_categories',
  LEGACY_VIDEOS: 'legacy_videos',
  LEGACY_IMAGES: 'legacy_images',
  LEGACY_NOTES: 'legacy_notes',
  IMAGE_FOLDERS: 'ImageFolders',
  KEY_HOLDERS: 'KeyHolders',
  PLANS: 'Plans',
  PLANSCREENS: 'PlanScreens',
  SCREENS: 'Screens',
  USERPLANS: 'UserPlans',
  MEMORY_FOLDERS: 'MemoryFolders',
  MEMORIES: 'Memories',
  OBITUARY_INFO: 'ObituaryInfo',
  SUBSCRIPTION_PLANS: 'SubscriptionPlans',
  USER_SUBSCRIPTIONS: 'UserSubscriptions',
};

export const MESSAGE = {
  DATA_NOT_FOUND: 'Data Not Found',
  RECORD_CREATED_SUCCESSFULLY: 'Record Created Successfully',
  RECORD_UPDATED_SUCCESSFULLY: 'Record Updated Successfully',
  RECORD_DELETED_SUCCESSFULLY: 'Record Deleted Successfully',
  ENTITLEMENTS: {
    USER_REGISTERED: 'User registered successfully',
    KEYHOLDER_REGISTERED: 'Key Holder registered successfully',
    PASSWORD_RESET_EMAIL_SENT:
      'Password reset instructions have been sent to your email.',
    PASSWORD_RESET_SUCCESS: 'Your password has been reset successfully.',
    PASSWORD_CHANGE_SUCCESS: 'Your password has been changed successfully.',
    EMAIL_SENT: 'Email sent successfully',
  },
};

export enum ORDER {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const PAGINATE_CONDITION = { deleted_on: null };

export const generateRandom4Digit = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

export const X_ACCESS_TOKEN = 'Authorization';
export const BEARER = 'Bearer';

export const PROFILE_PIC_BASE_PATH = './uploads/profile-pic';
export const KEY_HOLDERS_BASE_PATH = './uploads/key-holders';
export const MEMORIES_BASE_PATH = './uploads/memories';

export const FILE_CATEGORIES = {
  PROFILE_PIC: 'Profile Picture',
  MEMORIES: 'Memories',
  ASSETS: 'Assets',
};

export const generateRandomAlphanumeric = (length: number): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const TOKEN_URL_LENGTH = 74;
export const TOKEN_PIN_LENGTH = 7;
