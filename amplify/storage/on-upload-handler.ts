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

    console.log('dataUser');
    console.log(dataUser);
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
    console.log('filteredRecords');
    console.log(filteredRecords);

    if(filteredRecords.length <= 0) {
      throw new Error('filtered Records is 0')
    }

    const emailsToCheck = filteredRecords.map((row) => row.email);
    const [whitelistData, blacklistData] = await Promise.all([
      dynamoDb
        .batchGet({
          RequestItems: {
            [TABLE_NAME_WHITELIST]: {
              Keys: emailsToCheck.map((email) => ({ id: email })),
            },
          },
        })
        .promise(),
      dynamoDb
        .batchGet({
          RequestItems: {
            [TABLE_NAME_BLACKLIST]: {
              Keys: emailsToCheck.map((email) => ({ id: email })),
            },
          },
        })
        .promise(),
    ]);

    const whitelistEmails = new Set(
      whitelistData.Responses![TABLE_NAME_WHITELIST]?.map((item) => item.id) ||
        []
    );
    const blacklistEmails = new Set(
      blacklistData.Responses![TABLE_NAME_BLACKLIST]?.map((item) => item.id) ||
        []
    );
    console.log('whitelistEmails');
    console.log(whitelistEmails);
    console.log('blacklistEmails');
    console.log(blacklistEmails);

    const currentDate = new Date();
    const isoDate = currentDate.toISOString();

    // Procesar los registros filtrados
    const contactPromises = filteredRecords.map(async (row) => {
      const email = row.email;
      const lastName = row.apellidos || '';
      const name = row.nombre || '';

      if (!blacklistEmails.has(email)) {
        if (!whitelistEmails.has(email)) {
          // Crear en whitelist y enviar notificación solo si no está en la whitelist
          await Promise.all([
            createWhiteContact(isoDate, email),
            notifyNewContactLambda(
              email,
              dataUser.Item!.email,
              dataUser.Item!.name,
              dataUser.Item!.lastName
            ),
          ]);
        }

        // Crear el contacto
        await createContact(isoDate, email, name, lastName);
      }
    });

    // Esperar a que se completen todas las promesas
    await Promise.all(contactPromises);

    console.log('csv updated');
    await updateCsvFlagToUser(dataUser.Item);
  } catch (error) {
    await updateCsvFlagToUser(dataUser.Item);
    console.error('Error processing S3 event', error);
    throw error;
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
        processedEmails.add(email);
        return true;
      }
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
    name: string,
    lastName: string
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
};

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
