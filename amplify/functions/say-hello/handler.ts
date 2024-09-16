import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';

const ses = new AWS.SES();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler: Schema['sayHello']['functionHandler'] = async (event) => {
  // Extraer el idUser desde los argumentos
  const { idUser, email, name, lastName, vigil, funeral, dateDeceased } =
    event.arguments;
  console.log('idUser:', idUser);
  console.log(idUser, email, name, lastName, vigil, funeral, dateDeceased);

  const params = {
    TableName: 'Contact-xlznjcoayzddxlockvuufrw5vi-NONE',
    IndexName: 'contactsByIdUser',
    KeyConditionExpression: 'idUser = :idUser',
    ExpressionAttributeValues: {
      ':idUser': idUser,
    },
  };

  try {
    const data = await dynamoDB.query(params).promise();
    console.log('Escaneo exitoso:', data);

    const emailContacts = data.Items?.map((contact) => contact.emailContact);

    console.log(emailContacts)
    
    if (emailContacts) {
      const paramsSes = {
        Destination: {
          ToAddresses: emailContacts,
        },
        Message: {
          Body: {
            Text: { Data: 'Este es el contenido del correo' },
          },
          Subject: { Data: 'Asunto del correo' },
        },
        Source: 'cemofron@gmail.com',
      };

      const data = await ses.sendEmail(paramsSes).promise();
      console.log(data);
    } else {
      console.log(`User: ${idUser} no tenia contactos`);
    }
  } catch (err) {
    console.error('Error al escanear DynamoDB:', err);
    throw new Error('Error al escanear la tabla Contact');
  }

  return `Hello, ${idUser}!`;
};
