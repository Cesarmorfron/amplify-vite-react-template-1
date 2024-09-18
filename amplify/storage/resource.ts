import { defineFunction, defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'amplifyTeamDrive',
  access: (allow) => ({
    'csvs-contacts/*': [
      allow.authenticated.to(['read', 'write']),
      allow.guest.to(['read', 'write']),
    ],
  }),
  triggers: {
    onUpload: defineFunction({
      entry: './on-upload-handler.ts',
    }),
  },
});
