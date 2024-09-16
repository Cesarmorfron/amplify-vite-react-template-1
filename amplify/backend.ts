import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { myFirstFunction } from './my-first-function/resource';
import { sayHello } from './functions/say-hello/resources';

defineBackend({
  auth,
  data,
  storage,
  myFirstFunction,
  sayHello
});
