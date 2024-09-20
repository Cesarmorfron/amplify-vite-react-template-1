import { defineFunction } from '@aws-amplify/backend';

export const newContact = defineFunction({
  name: 'new-contact',
  entry: './handler.ts',
  environment: {
    emailActivated: 'false',
  },
});
