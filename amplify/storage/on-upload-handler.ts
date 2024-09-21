/* eslint-disable @typescript-eslint/no-explicit-any */
import { S3Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
const S3 = new AWS.S3();
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'csv-parse';
const lambda = new AWS.Lambda();

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME_CONTACT = 'Contact-xlznjcoayzddxlockvuufrw5vi-NONE';
const TABLE_NAME_WHITELIST = 'WhitelistContact-xlznjcoayzddxlockvuufrw5vi-NONE';
const TABLE_NAME_BLACKLIST = 'BlacklistContact-xlznjcoayzddxlockvuufrw5vi-NONE';
const TABLE_NAME_USER = 'User-xlznjcoayzddxlockvuufrw5vi-NONE';

export const handler: S3Handler = async (event) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;
  const decodedKey = decodeURIComponent(objectKey);
  const fileName = decodedKey.split('/').pop() || 'unknown';
  const idUser = fileName.split('|')[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const results: any[] = [];

  const bucket = bucketName;
  const key = decodedKey;

  const dataUser = await dynamoDb
    .get({
      TableName: TABLE_NAME_USER,
      Key: {
        id: idUser,
      },
    })
    .promise();

  if (!dataUser || !dataUser.Item) {
    throw new Error(`user: ${idUser} does not exist`);
  }

  try {
    const [dataDDB, dataS3] = await Promise.all([
      dynamoDb
        .query({
          TableName: TABLE_NAME_CONTACT,
          IndexName: 'contactsByIdUser',
          KeyConditionExpression: 'idUser = :idUser',
          ExpressionAttributeValues: {
            ':idUser': idUser,
          },
        })
        .promise(),
      S3.getObject({
        Bucket: bucket,
        Key: key,
      }).promise(),
    ]);

    const emailContacts = new Set(
      dataDDB.Items?.map((contact) => contact.emailContact) || []
    );

    const csvData = dataS3.Body!.toString('utf-8');

    const filteredRecords = await analyseCSV(csvData, emailContacts);

    if (filteredRecords.length <= 0) {
      console.log('no new emails for this contact');
      return;
    }

    const emailsToCheck = filteredRecords.filter((row) => row.email).map((row) => row.email);

    let whitelistEmailsSet = new Set<string>();
    let blacklistEmailsSet = new Set<string>();

    const chunkSize = 99;
    for (let i = 0; i < emailsToCheck.length; i += chunkSize) {
      const chunk = emailsToCheck.slice(i, i + chunkSize);

      const [whitelistData, blacklistData] = await Promise.all([
        dynamoDb
          .batchGet({
            RequestItems: {
              [TABLE_NAME_WHITELIST]: {
                Keys: chunk.map((email) => ({ id: email })),
              },
            },
          })
          .promise(),
        dynamoDb
          .batchGet({
            RequestItems: {
              [TABLE_NAME_BLACKLIST]: {
                Keys: chunk.map((email) => ({ id: email })),
              },
            },
          })
          .promise(),
      ]);
      const whitelistEmailsBatch = new Set<string>(
        whitelistData.Responses![TABLE_NAME_WHITELIST]?.map(
          (item) => item.id
        ) || []
      );
      const blacklistEmailsBatch = new Set<string>(
        blacklistData.Responses![TABLE_NAME_BLACKLIST]?.map(
          (item) => item.id
        ) || []
      );

      whitelistEmailsSet = new Set(
        ...whitelistEmailsSet,
        ...whitelistEmailsBatch
      );
      blacklistEmailsSet = new Set(
        ...blacklistEmailsSet,
        ...blacklistEmailsBatch
      );
    }

    const currentDate = new Date();
    const isoDate = currentDate.toISOString();

    await processContacts(
      filteredRecords,
      blacklistEmailsSet,
      whitelistEmailsSet,
      isoDate,
      {
        email: dataUser.Item!.email,
        name: dataUser.Item!.name,
        lastName: dataUser.Item!.lastName,
        idUser,
      },
      10
    );
  } catch (error) {
    console.error('Error processing S3 event', error);
    throw error;
  } finally {
    await updateCsvFlagToUser(dataUser.Item);
  }
};

async function processContacts(
  filteredRecords: any[],
  blacklistEmails: Set<string>,
  whitelistEmails: Set<string>,
  isoDate: string,
  dataUser: { email: string; name: string; lastName: string; idUser: string },
  concurrencyLimit: number
) {
  const processContact = async (row: any) => {
    const email = row.email;
    const lastName = row.apellidos || '';
    const name = row.nombre || '';
    let mobile = row.movil || '';
    if (mobile !== '') {
      mobile = mobile.charAt(0) !== '+' ? '+34' + mobile : mobile;
    }

    if (!blacklistEmails.has(email)) {
      if (!whitelistEmails.has(email)) {
        // Crear en whitelist y enviar notificación
        await Promise.all([
          createWhiteContact(isoDate, email),
          notifyNewContactLambda(
            email,
            dataUser.email,
            dataUser.name,
            dataUser.lastName
          ),
        ]);
      }
      // Crear el contacto
      console.log('mobile');
      console.log(mobile);
      await createContact(
        isoDate,
        email,
        mobile,
        name,
        lastName,
        dataUser.idUser
      );
    }
  };

  // Crear las promesas sin ejecutarlas aún
  const contactPromises = filteredRecords.map(
    (row) => () => processContact(row)
  );

  // Limitar la concurrencia al procesar los contactos
  await limitConcurrency(contactPromises, concurrencyLimit);
}

async function limitConcurrency(promises: any[], limit: number) {
  const results = [];
  const executing: any[] = [];

  for (const promise of promises) {
    const p = promise().then((result: any) => {
      // Eliminar la promesa completada del conjunto en ejecución
      executing.splice(executing.indexOf(p), 1);
      return result;
    });
    results.push(p);
    executing.push(p);

    // Si llegamos al límite de concurrencia, esperamos que termine alguna
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function analyseCSV(csvData: string, emailContacts: Set<any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const csvTransformArray: any[] = await new Promise((resolve, reject) => {
    parse(csvData, { columns: true, delimiter: ';' }, (err, records) => {
      if (err) {
        reject(err);
      } else {
        resolve(records);
      }
    });
  });

  const processedEmails = new Set<string>();
  const filteredRecords = csvTransformArray.filter((row) => {
    const email = row.email;
    if (email && !emailContacts.has(email) && !processedEmails.has(email)) {
      console.log('row email');
      console.log(row);
      processedEmails.add(email);
      return true;
    } else if (row.movil) {
      console.log('row mobile');
      console.log(row);
      return true;
    }
    console.log('row false');
    console.log(row);
    return false;
  });
  return filteredRecords;
}

async function notifyNewContactLambda(
  email: string,
  emailUser: string,
  name: string,
  lastName: string
) {
  const paramsInvokeLambda = {
    FunctionName:
      'amplify-d2la42mrj91oaz-ma-newcontactlambdaA0C0D661-LggoK7jQ2xw3',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({
      arguments: {
        emailContact: email,
        emailUser: emailUser,
        nameUser: name,
        lastName: lastName,
      },
    }),
  };

  await lambda.invoke(paramsInvokeLambda).promise();
}

async function createContact(
  isoDate: string,
  email: string,
  mobile: string,
  name: string,
  lastName: string,
  idUser: string
) {
  await dynamoDb
    .put({
      TableName: TABLE_NAME_CONTACT,
      Item: {
        __typename: 'Contact',
        createdAt: isoDate,
        updatedAt: isoDate,
        id: uuidv4(),
        emailContact: email,
        mobile,
        name,
        lastName,
        idUser,
      },
    })
    .promise();
}

async function createWhiteContact(isoDate: string, email: string) {
  await dynamoDb
    .put({
      TableName: TABLE_NAME_WHITELIST,
      Item: {
        __typename: 'WhitelistContact',
        createdAt: isoDate,
        updatedAt: isoDate,
        id: email,
      },
    })
    .promise();
}

async function updateCsvFlagToUser(Item: DynamoDB.DocumentClient.AttributeMap) {
  await dynamoDb
    .put({
      TableName: TABLE_NAME_USER,
      Item: {
        ...Item,
        flagUploadCsv: true,
      },
    })
    .promise();
}
