// import type { S3Handler } from 'aws-lambda';

// export const handler: S3Handler = async (event) => {
//   const objectKeys = event.Records.map((record) => record.s3.object.key);
//   console.log(`Upload handler invoked for objects [${objectKeys.join(', ')}]`);
// };

import { S3Handler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { DynamoDB } from 'aws-sdk';
import csvParser from 'csv-parser';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos

const s3 = new S3();
const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = 'YourDynamoDBTableName';

export const handler: S3Handler = async (event) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;
  const fileName = objectKey.split('/').pop()?.split('.')[0] || 'unknown'; 
  const idUser = fileName.split('|')[0];

  console.log('bucketName')
  console.log(bucketName)
  console.log('objectKey')
  console.log(objectKey)
  console.log('fileName')
  console.log(fileName)
  console.log('idUser')
  console.log(idUser)
  
  return;
  try {
    const s3Stream = s3.getObject({ Bucket: bucketName, Key: objectKey }).createReadStream();
    
    s3Stream.pipe(csvParser())
      .on('data', async (row) => {
        const { email, name, lastName } = row;
        if (email && name && lastName) {
          await dynamoDb.put({
            TableName: TABLE_NAME,
            Item: {
              id: uuidv4(), // Genera un ID único para cada fila
              emailContact: email,
              name,
              lastName,
              idUser
            }
          }).promise();
        }
      })
      .on('end', () => {
        console.log('CSV file processed successfully.');
      });

  } catch (error) {
    console.error('Error processing S3 event', error);
    throw error;
  }
};
