import { S3Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
const S3 = new AWS.S3();
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'csv-parse';
const lambda = new AWS.Lambda();

// const s3 = new S3();
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

  try {
    const paramsGetEmails = {
      TableName: TABLE_NAME_CONTACT,
      IndexName: 'contactsByIdUser',
      KeyConditionExpression: 'idUser = :idUser',
      ExpressionAttributeValues: {
        ':idUser': idUser,
      },
    };

    const paramsGetUser = {
      TableName: TABLE_NAME_USER,
      Key: {
        id: idUser,
      },
    };

    const paramsS3 = {
      Bucket: bucket,
      Key: key,
    };

    const [dataUser, dataDDB, dataS3] = await Promise.all([
      dynamoDb.get(paramsGetUser).promise(),
      dynamoDb.query(paramsGetEmails).promise(),
      S3.getObject(paramsS3).promise(),
    ]);
    console.log('dataUser');
    console.log(dataUser);

    if (!dataUser || !dataUser.Item) {
      throw new Error(`user: ${idUser} does not exist`);
    }

    const emailContacts = new Set(
      dataDDB.Items?.map((contact) => contact.emailContact) || []
    );

    const csvData = dataS3.Body!.toString('utf-8');

    // Analizar el CSV
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredRecords = await analyseCSV(csvData, emailContacts);
    console.log('filteredRecords');
    console.log(filteredRecords);

    for (const row of filteredRecords) {
      const email = row.email;
      const lastName = row.apellidos || '';
      const name = row.nombre || '';
      const currentDate = new Date();
      const isoDate = currentDate.toISOString();

      const paramsGetWhitelist = {
        TableName: TABLE_NAME_WHITELIST,
        Key: {
          id: email,
        },
      };

      const paramsGetBlacklist = {
        TableName: TABLE_NAME_BLACKLIST,
        Key: {
          id: email,
        },
      };

      const [dataWhitelist, dataBlacklist] = await Promise.all([
        dynamoDb.get(paramsGetWhitelist).promise(),
        dynamoDb.get(paramsGetBlacklist).promise(),
      ]);
      console.log('dataBlacklist');
      console.log(dataBlacklist);
      console.log('dataWhitelist');
      console.log(dataWhitelist);

      if (!dataBlacklist.Item) {
        console.log(1);
        if (!dataWhitelist.Item) {
          console.log(2);
          await createWhiteContact(isoDate, email);

          await notifyNewContactLambda(
            email,
            dataUser.Item.email,
            dataUser.Item.name,
            dataUser.Item.lastName
          );
        }

        await createContact(isoDate, email, name, lastName);
      }
    }

    await updateCsvFlagToUser(dataUser.Item);
  } catch (error) {
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
        flagUploadCsv: false,
      },
    })
    .promise();
}
