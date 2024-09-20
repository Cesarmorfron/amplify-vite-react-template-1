import type { Schema } from '../../data/resource';

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

  // Obtener el asunto del correo
  const subject = record.mail.commonHeaders.subject;
  console.log(`Subject: ${subject}`);

  // Obtener el cuerpo del mensaje MIME (formato raw)
  const message = record.mail;
  console.log('Raw email message:', message);

  // Aquí podrías parsear el mensaje MIME si es necesario
  // ...

  // Si el asunto o cuerpo del correo contiene "baja", procesarlo
  if (message.toLowerCase().includes('baja')) {
    console.log(`Processing unsubscribe request from: ${from}`);
    // Aquí podrías eliminar al usuario de la base de datos
  }

  return 'success';
};
