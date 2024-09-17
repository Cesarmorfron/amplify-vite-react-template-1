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
            Html: { 
              Data: `Con profundo pesar siento comunicarle el fallecimiento de <b>${name} ${lastName}</b>, quien nos dejó el <b>${dateDeceased}</b>.
              
              ${(vigil || funeral) ? `<p>En estos momentos difíciles, nos gustaría compartir los detalles de las ceremonias que se llevarán a cabo en su honor.</p>` : ''}
              
              ${vigil ? `<p>La vigil se realizará en: <b>${vigil}</b></p>` : ''}
              
              ${funeral ? `<p>El funeral tendrá lugar en: <b>${funeral}</b></p>` : ''}
              
              ${(vigil || funeral) ? `<p>Si desea acompañarnos en estos momentos, su presencia será muy apreciada.</p>` : ''}
              
              <p>Con el corazón entristecido,</p>
              
              <p><a href="https://esquelaelectronica.com">esquelaelectronica</a></p>`
            },
          },
          Subject: { Data: `Notificación de fallecimiento de ${name} ${lastName}` },
        },
        Source: 'no-reply@esquelaelectronica.com',
      };
      
      const data = await ses.sendEmail(paramsSes).promise();
      
      console.log(data);
    } else {
      console.log(`User: ${idUser} no tenia contactos`);
    }
  } catch (err) {
    console.error('Error lambda:', err);
    throw new Error('Error lambda');
  }

  return `Hello, ${idUser}!`;
};
