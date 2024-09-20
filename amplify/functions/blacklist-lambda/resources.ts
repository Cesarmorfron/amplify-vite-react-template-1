import { defineFunction } from '@aws-amplify/backend';

export const blacklistLambda = defineFunction({
  name: 'blacklist-lambda',
  entry: './handler.ts',
});
