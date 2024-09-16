import type { Schema } from "../../data/resource"
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

export const handler: Schema["sayHello"]["functionHandler"] = async (event) => {
   // arguments typed from `.arguments()`
   const { idUser } = event.arguments
   console.log('name')
   console.log(idUser)

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
      }
      else {
        console.log('contacts')
        console.log(contacts)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  fetchContacts();

   // return typed from `.returns()`
   return `Hello, ${idUser}!`
}