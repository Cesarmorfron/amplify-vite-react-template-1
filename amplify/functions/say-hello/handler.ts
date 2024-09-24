import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';

const ses = new AWS.SES();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

export const handler: Schema['sayHello']['functionHandler'] = async (event) => {
  // Extraer el idUser desde los argumentos
  const { idUser, name, lastName, vigil, funeral, dateDeceased } =
    event.arguments;

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

    const emailContacts = data.Items?.filter(
      (contact) => contact.emailContact
    ).map((contact) => contact.emailContact);

    // send email
    if (emailContacts && emailContacts.length > 0) {
      const emailPromises = emailContacts.map((emailContact) => {
        const paramsSes = {
          Destination: {
            ToAddresses: [emailContact],
          },
          Message: {
            Body: {
              Html: {
                Data: `Con profundo pesar sentimos comunicarle el fallecimiento de <b>${name} ${lastName}</b>, quien nos dejó el <b>${dateDeceased}</b>.
              
              ${vigil || funeral ? `<p>En estos momentos difíciles, nos gustaría compartir los detalles de las ceremonias que se llevarán a cabo en su honor.</p>` : ''}
              
              ${vigil ? `<p>El velatorio se realizará en: <b>${vigil}</b></p>` : ''}
              
              ${funeral ? `<p>El funeral tendrá lugar en: <b>${funeral}</b></p>` : ''}
              
              ${vigil || funeral ? `<p>Si desea acompañarnos en estos momentos, su presencia será muy apreciada.</p>` : ''}
              
              <p>Con el corazón entristecido,</p>
              
              <p><a href="https://esquelaelectronica.com">esquelaelectronica</a></p>`,
              },
            },
            Subject: {
              Data: `Fallecimiento de ${name} ${lastName}`,
            },
          },
          Source: 'no-reply@esquelaelectronica.com',
        };
    
        if (process.env.emailActivated === 'true') {
          return ses.sendEmail(paramsSes).promise();
        } else {
          console.log('emailActivated false');
          return Promise.resolve(); 
        }
      });
    
      await Promise.all(emailPromises);
    }

    // send sms
    const mobileContacts = data.Items?.filter((contact) => contact.mobile).map(
      (contact) => contact.mobile
    );

    if (mobileContacts) {
      const snsMessages = mobileContacts.map((mobile) => {
        const message = `Lamentamos informar que ${name} ${lastName} falleció el ${dateDeceased}.${vigil ? ` El velatorio se realizará en: ${vigil}.` : ''}${funeral ? ` El funeral tendrá lugar en: ${funeral}.` : ''} esquelaelectronica.com`;

        const paramsSns = {
          Message: message,
          PhoneNumber: mobile,
          Subject: `Fallecimiento de ${name} ${lastName}`,
        };

        if (process.env.smsActivated === 'true') {
          return sns.publish(paramsSns).promise();
        } else {
          console.log('smsActivated false');
        }
      });

      await Promise.all(snsMessages);
    }
  } catch (err) {
    console.error('Error lambda:', err);
  }

  return `Hello, ${idUser}!`;
};
