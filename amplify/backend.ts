import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { myFirstFunction } from './my-first-function/resource';
import { sayHello } from './functions/say-hello/resources';
import { newContact } from './functions/new-contact/resources';
import { blacklistLambda } from './functions/blacklist-lambda/resources';
// import { myDynamoDBFunction } from "./functions/dynamoDB-function/resource";
import { Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';
// import { StartingPosition, EventSourceMapping } from "aws-cdk-lib/aws-lambda";

const backend = defineBackend({
  auth,
  data,
  storage,
  myFirstFunction,
  sayHello,
  newContact,
  blacklistLambda,
  // myDynamoDBFunction,
});

const contactTable = backend.data.resources.tables['Contact'];
const policy = new Policy(Stack.of(contactTable), 'MyLambdaPolicy', {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:*'],
      resources: ['*'],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ses:SendEmail'],
      resources: ['*'],
    }),
  ],
});
backend.sayHello.resources.lambda.role?.attachInlinePolicy(policy);
backend.newContact.resources.lambda.role?.attachInlinePolicy(policy);
backend.blacklistLambda.resources.lambda.role?.attachInlinePolicy(policy);

// backend.myDynamoDBFunction.resources.lambda.role?.attachInlinePolicy(policy);

// const mappingDynamoDbFunction = new EventSourceMapping(
//   Stack.of(contactTable),
//   "MyDynamoDBFunctionTodoEventStreamMappingDynamoDbFunction",
//   {
//     target: backend.myDynamoDBFunction.resources.lambda,
//     eventSourceArn: contactTable.tableStreamArn,
//     startingPosition: StartingPosition.LATEST,
//   }
// );

// mappingDynamoDbFunction.node.addDependency(policy);
