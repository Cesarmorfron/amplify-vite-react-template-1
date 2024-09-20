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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventObject = event as any;

  // Obtener los registros del evento
  const record = eventObject.Records[0].ses;
  console.log(record);

  // Obtener la dirección del remitente
  const from = record.mail.commonHeaders.from[0];
  console.log(`Email received from: ${from}`);

  const email = from.match(/<([^>]+)>/)?.[1];

  if (!email) {
    console.log('No se encontró ningún email.');
    return 'no email valid';
  }

  const whitelist = await getWhitelistContact(email);

  if (!whitelist.Item) return 'no email whitelisted';

  await deleteWhitelistContact(email);

  const currentDate = new Date();
  const isoDate = currentDate.toISOString();

  await createBlacklistContact(isoDate, email);

  const contactsToDelete = await queryContactsToDelete(email);

  if (!contactsToDelete.Items) return;

  const deletePromises = contactsToDelete.Items.map((contact) =>
    deleteContact(contact.id)
  );
  await Promise.all(deletePromises);

  return 'success';
};

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

async function deleteWhitelistContact(email: string) {
  await dynamoDb
    .delete({
      TableName: TABLE_NAME_WHITELIST,
      Key: {
        id: email,
      },
    })
    .promise();
}

async function deleteContact(id: string) {
  await dynamoDb
    .delete({
      TableName: TABLE_NAME_CONTACT,
      Key: {
        id: id,
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
        __typename: 'WhitelistContact',
        createdAt: isoDate,
        updatedAt: isoDate,
        id: email,
      },
    })
    .promise();
}
