import { Amplify } from 'aws-amplify';
import type { Schema } from "../../data/resource";
import outputs from '../../../amplify_outputs.json';

// Configurar Amplify
Amplify.configure(outputs);

// Generar el cliente con el esquema de Amplify
import { generateClient } from 'aws-amplify/data';
const client = generateClient<Schema>();

export const handler: Schema["sayHello"]["functionHandler"] = async (event) => {
  // Extraer idUser desde los argumentos
  const { idUser } = event.arguments;
  console.log('idUser:', idUser);

  const fetchContacts = async () => {
    try {
      const { data: contacts, errors } = await client.models.Contact.list({
        filter: {
          idUser: {
            eq: idUser!,
          },
        },
      });

      if (errors) {
        console.error(errors);
      } else {
        console.log('contacts:', contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  await fetchContacts();

  // Devolver respuesta
  return `Hello, ${idUser}!`;
};
