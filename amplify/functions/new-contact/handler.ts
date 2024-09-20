import type { Schema } from '../../data/resource';
import AWS from 'aws-sdk';
const ses = new AWS.SES();

export const handler: Schema['newContact']['functionHandler'] = async (
  event
) => {
  console.log(event);
  const { emailContact, emailUser, nameUser, lastName } = event.arguments;

  try {
    const paramsSes = {
      Destination: {
        ToAddresses: [emailContact!],
      },
      Message: {
        Body: {
          Html: {
            Data: `
              <p>Hola,</p>
              <p>Te informamos que <b>${nameUser} ${lastName}</b> con email: <b>${emailUser}</b> te ha añadido como contacto en nuestra aplicación <b>Esquela Electrónica</b>. Esta aplicación tiene como objetivo notificar a amigos y seres queridos en caso de fallecimiento.</p>
              <p><b>¿Qué significa esto para ti?</b><br/>
              Si decides aceptar, <b>solo utilizaremos tu correo para notificarte en caso de fallecimiento</b> del usuario que te ha agregado. No recibirás publicidad ni otras comunicaciones.</p>
              <p><b>Opciones disponibles:</b></p>
              <ul>
                <li><b>Aceptar:</b> Si no haces nada, tu correo será utilizado únicamente para este propósito.</li>
                <li><b>Rechazar:</b> Si prefieres no recibir notificaciones, puedes rechazar respondiendo a este email con la palabra: Baja</li>
              </ul>
              <p><b>Protección de datos:</b> Cumplimos con el GDPR y tu información será tratada con la máxima confidencialidad. En cualquier momento, puedes solicitar la eliminación de tus datos escribiéndonos a <a href="mailto:notificaciones@esquelaelectronica.com">notificaciones@esquelaelectronica.com</a>.</p>
              <p>Gracias por tu atención.</p>
              <p>Un saludo,<br/>El equipo de <a href="https://www.esquelaelectronica.com/">Esquela Electrónica</a></p>
            `,
          },
        },
        Subject: {
          Data: `Confirmación de contacto en Esquela Electrónica`,
        },
      },
      Source: 'notificaciones@esquelaelectronica.com',
    };

    if (process.env.emailActivated === 'true') {
      const data = await ses.sendEmail(paramsSes).promise();
      console.log(data);
    } else {
      console.log('emailActivated false');
    }
  } catch (err) {
    console.error('Error lambda:', err);
    throw new Error('Error lambda');
  }
  return 'email sent';
};
