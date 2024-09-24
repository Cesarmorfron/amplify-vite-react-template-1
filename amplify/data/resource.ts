import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { sayHello } from '../functions/say-hello/resources';
import { newContact } from '../functions/new-contact/resources';
import { blacklistLambda } from '../functions/blacklist-lambda/resources';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
// const schemaTest = a.schema({
//   Todo: a
//     .model({
//       content: a.string(),
//     })
//     .authorization((allow) => [allow.publicApiKey()]),
// });

const schema = a.schema({
  sayHello: a
    .query()
    .arguments({
      idUser: a.string(),
      email: a.string(),
      name: a.string(),
      lastName: a.string(),
      vigil: a.string(),
      funeral: a.string(),
      dateDeceased: a.string(),
      company: a.string(),
    })
    .returns(a.string())
    .handler(a.handler.function(sayHello))
    .authorization((allow) => [allow.publicApiKey()]),
  newContact: a
    .query()
    .arguments({
      emailContact: a.string(),
      emailUser: a.string(),
      nameUser: a.string(),
      lastName: a.string(),
    })
    .returns(a.string())
    .handler(a.handler.function(newContact))
    .authorization((allow) => [allow.publicApiKey()]),
  blacklistLambda: a
    .query()
    .arguments({
      email: a.string(),
    })
    .returns(a.string())
    .handler(a.handler.function(blacklistLambda))
    .authorization((allow) => [allow.publicApiKey()]),
  User: a
    .model({
      name: a.string(),
      lastName: a.string(),
      city: a.string(),
      birthDate: a.string(),
      email: a.string(),
      deceased: a.boolean(),
      vigil: a.string(),
      funeral: a.string(),
      dateDeceased: a.string(),
      flagUploadCsv: a.boolean(),
      company: a.string(),
    })
    .secondaryIndexes((index) => [index('company')])
    .authorization((allow) => [allow.publicApiKey()]),
  Contact: a
    .model({
      id: a.string(),
      emailContact: a.string(),
      name: a.string(),
      lastName: a.string(),
      idUser: a.string(),
      mobile: a.string(),
    })
    .secondaryIndexes((index) => [index('idUser')])
    .authorization((allow) => [allow.publicApiKey()]),
  BlacklistContact: a
    .model({
      id: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  WhitelistContact: a
    .model({
      id: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  DeceasedNotified: a
    .model({
      id: a.string(),
      date: a.string(),
      company: a.string(),
      emails: a.integer(),
      sms: a.integer(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;
// export type thoughtSchema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
