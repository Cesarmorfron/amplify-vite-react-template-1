// import type { S3Handler } from 'aws-lambda';

// export const handler: S3Handler = async (event) => {
//   const objectKeys = event.Records.map((record) => record.s3.object.key);
//   console.log(`Upload handler invoked for objects [${objectKeys.join(', ')}]`);
// };

import { S3Handler } from 'aws-lambda';
import AWS from 'aws-sdk';
const S3 = new AWS.S3();
import { DynamoDB } from 'aws-sdk';
// import csvParser from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'csv-parse';

// const s3 = new S3();
const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = 'Contact-xlznjcoayzddxlockvuufrw5vi-NONE';

export const handler: S3Handler = async (event) => {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;
  const decodedKey = decodeURIComponent(objectKey);
  const fileName = decodedKey.split('/').pop() || 'unknown';
  const idUser = fileName.split('|')[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const results: any[] = [];

  console.log('idUser');
  console.log(idUser);
  console.log('bucketName');
  console.log(bucketName);
  console.log('objectKey');
  console.log(objectKey);
  console.log('decodedKey');
  console.log(decodedKey);

  const bucket = bucketName;
  const key = decodedKey;

  try {
    const params = {
      Bucket: bucket,
      Key: key,
    };
    const data = await S3.getObject(params).promise();

    const csvData = data.Body!.toString('utf-8');

    // Analizar el CSV
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csvTransformArray: any[] = await new Promise((resolve, reject) => {
      parse(
        csvData,
        { columns: true, delimiter: ';' },
        async (err, records) => {
          if (err) {
            reject(err);
          } else {
            console.log('records');
            console.log(records);
            resolve(records);
          }
        }
      );
    });

    console.log('successfully');
    console.log(csvTransformArray);

    for(const row of csvTransformArray){
      console.log('row')
      console.log(row)
      if (row.email) {
        const email = row.email;
        const lastName = row.lastName ? row.lastName : '';
        const name = row.name ? row.name : '';
        const currentDate = new Date();
        const isoDate = currentDate.toISOString();

        await dynamoDb
          .put({
            TableName: TABLE_NAME,
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
    }


  } catch (error) {
    console.error('Error processing S3 event', error);
    throw error;
  }
};

// try {
//   const s3Stream = s3.getObject({ Bucket: bucketName, Key: objectKey }).createReadStream();
//   console.log('s3Stream')

//   s3Stream.pipe(csvParser())
//     .on('data', async (row) => {
//       console.log(row)
//       console.log(row[0])
//       console.log(row[1])
//       console.log(row[2])
//       const email = row[2]
//       const lastName = row[1]? row[1] : ''
//       const name = row[0] ? row[0] : ''
//       if (email) {
//         await dynamoDb.put({
//           TableName: TABLE_NAME,
//           Item: {
//             id: uuidv4(),
//             emailContact: email,
//             name,
//             lastName,
//             idUser
//           }
//         }).promise();
//       }
//     })
//     .on('end', () => {
//       console.log('CSV file processed successfully.');
//     });

// } catch (error) {
//   console.error('Error processing S3 event', error);
//   throw error;
// }
