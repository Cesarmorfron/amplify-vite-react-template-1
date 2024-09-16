import type { Schema } from "../../data/resource"
import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler: Schema["sayHello"]["functionHandler"] = async (event) => {
 // Extraer el idUser desde los argumentos
 const { idUser } = event.arguments;
 console.log('idUser:', idUser);
 
 // Parámetros de escaneo completo de la tabla
 const params = {
   TableName: 'Contact-xlznjcoayzddxlockvuufrw5vi-NONE',
 };

 try {
   // Ejecutar el escaneo completo de la tabla
   const data = await dynamoDB.scan(params).promise();
   console.log('Escaneo exitoso:', data);
   
   // Filtrar los resultados por idUser
  //  const filteredItems = data.Items.filter(item => item.idUser === idUser);
   
   // Retornar los elementos filtrados
  //  return filteredItems;
  return `Hello, ${idUser}!`

 } catch (err) {
   console.error('Error al escanear DynamoDB:', err);
   
   // Retornar un error en caso de fallo
   throw new Error('Error al escanear la tabla Contact');
 }
}