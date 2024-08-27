// // src/components/CrudTable.tsx
// import React, { useState, useEffect } from 'react';
// import { Table, Button, Input, Flex } from '@aws-amplify/ui-react';
// import { generateClient } from "aws-amplify/data";
// import type { Schema } from "../../amplify/data/resource";

// const client = generateClient<Schema>();

// const CrudTable: React.FC = () => {
//   const [items, setItems] = useState<Schema["User"]["type"][]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>('');

//   useEffect(() => {
//     const sub = client.models.User.observeQuery().subscribe({
//       next: ({ items }) => {
//         setItems([...items]);
//       },
//     });

//     return () => sub.unsubscribe();
//   }, []);

//   const addItem = async () => {
//     await client.models.User.create({
//       name: window.prompt("author content"),
//       lastName: 'false',
//       city: 'false',
//       birthDate: 'false',
//       email: 'false',
//     });
//   };

//   const deleteItem = async (id: string) => {
//     client.models.User.delete({ id })
//   };

//   const filteredItems = items.filter(item =>
//     item.name!.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div>
//       <Flex direction="row">
//         <Input
//           placeholder="Search"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <Button onClick={addItem}>Add Item</Button>
//       </Flex>
//       <Table>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredItems.map(item => (
//             <tr key={item.id}>
//               <td>{item.name}</td>
//               <td>
//                 <Button onClick={() => deleteItem(item.id)}>Delete</Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </div>
//   );
// };

// export default CrudTable;



import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Flex, Label } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

const CrudTable: React.FC = () => {
  const [items, setItems] = useState<Schema["User"]["type"][]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    city: '',
    birthDate: '',
    email: '',
  });
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const sub = client.models.User.observeQuery().subscribe({
      next: ({ items }) => {
        setItems([...items]);
      },
    });

    return () => sub.unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await client.models.User.create({
      name: formData.name,
      lastName: formData.lastName,
      city: formData.city,
      birthDate: formData.birthDate,
      email: formData.email,
    });

    // Clear form data
    setFormData({
      name: '',
      lastName: '',
      city: '',
      birthDate: '',
      email: '',
    });

    // Hide form after submission
    setIsFormVisible(false);
  };

  const deleteItem = async (id: string) => {
    await client.models.User.delete({ id });
  };

  const filteredItems = items.filter(item =>
    item.name!.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Flex direction="column" gap="small">
        <Flex direction="row" gap="small" marginBottom="small">
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => setIsFormVisible(!isFormVisible)}>
            {isFormVisible ? 'Cancel' : 'Add Item'}
          </Button>
        </Flex>

        {isFormVisible && (
          <Flex as="form" direction="column" width="20rem" onSubmit={handleSubmit} gap="small">
            <Flex direction="column" gap="small">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                isRequired
              />
            </Flex>
            <Flex direction="column" gap="small">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                isRequired
              />
            </Flex>
            <Flex direction="column" gap="small">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                isRequired
              />
            </Flex>
            <Flex direction="column" gap="small">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                isRequired
              />
            </Flex>
            <Flex direction="column" gap="small">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                isRequired
              />
            </Flex>
            <Button type="submit">Submit</Button>
          </Flex>
        )}

        <Table marginTop="small">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <Button onClick={() => deleteItem(item.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Flex>
    </div>
  );
};

export default CrudTable;
