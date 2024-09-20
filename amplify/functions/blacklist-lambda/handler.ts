/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Schema } from '../../data/resource';
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME_CONTACT = 'Contact-xlznjcoayzddxlockvuufrw5vi-NONE';
const TABLE_NAME_WHITELIST = 'WhitelistContact-xlznjcoayzddxlockvuufrw5vi-NONE';
const TABLE_NAME_BLACKLIST = 'BlacklistContact-xlznjcoayzddxlockvuufrw5vi-NONE';

export const handler: Schema['blacklistLambda']['functionHandler'] = async (
  event
) => {
  console.log(event);
  const email = getEmailFromEvent(event);

  const whitelist = await getWhitelistContact(email);
  console.log('whitelist.Item');
  console.log(whitelist.Item);

  if (!whitelist.Item) return 'no email whitelisted';

  await deleteWhitelistContact(email);

  const currentDate = new Date();
  const isoDate = currentDate.toISOString();

  await createBlacklistContact(isoDate, email);

  const contactsToDelete = await queryContactsToDelete(email);

  console.log('contactsToDelete');
  console.log(contactsToDelete);
  if (!contactsToDelete.Items) return 'no contacts to delete';

  const deletePromises = contactsToDelete.Items.map((contact) =>
    deleteContact(contact.id)
  );
  await Promise.all(deletePromises);

  return 'success';
};

function getEmailFromEvent(event: any) {
  const eventObject = event as any;

  const record = eventObject.Records[0].ses;
  console.log(record);

  const from = record.mail.commonHeaders.from[0];
  console.log(`Email received from: ${from}`);

  const email = from.match(/<([^>]+)>/)?.[1];

  if (!email) {
    console.log('No se encontró ningún email.');
    throw new Error('no email valid');
  }
  return email;
}

async function queryContactsToDelete(email: string) {
  return await dynamoDb
    .query({
      TableName: TABLE_NAME_CONTACT,
      IndexName: 'contactsByEmailContact',
      KeyConditionExpression: 'emailContact = :emailContact',
      ExpressionAttributeValues: {
        ':emailContact': email,
      },
    })
    .promise();
}

async function deleteContact(id: string) {
  console.log('id');
  console.log(id);
  await dynamoDb
    .delete({
      TableName: TABLE_NAME_CONTACT,
      Key: {
        id: id,
      },
    })
    .promise();
}

async function deleteWhitelistContact(email: string) {
  console.log('email');
  console.log(email);
  await dynamoDb
    .delete({
      TableName: TABLE_NAME_WHITELIST,
      Key: {
        id: email,
      },
    })
    .promise();
}

async function getWhitelistContact(email: string) {
  return await dynamoDb
    .get({
      TableName: TABLE_NAME_WHITELIST,
      Key: {
        id: email,
      },
    })
    .promise();
}

async function createBlacklistContact(isoDate: string, email: string) {
  await dynamoDb
    .put({
      TableName: TABLE_NAME_BLACKLIST,
      Item: {
        __typename: 'BlacklistContact',
        createdAt: isoDate,
        updatedAt: isoDate,
        id: email,
      },
    })
    .promise();
}
