// src/components/CrudTable.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Flex } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

const CrudTable: React.FC = () => {
  const [items, setItems] = useState<Schema["User"]["type"][]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data: items } = await client.models.User.list();
    setItems(items);
  };

  const addItem = async () => {
    await client.models.User.create({
      name: window.prompt("author content"),
      lastName: 'false',
      city: 'false',
      birthDate: 'false',
      email: 'false',
    });

    fetchItems();
  };

  const deleteItem = async (id: string) => {
    client.models.User.delete({ id })
  };

  const filteredItems = items.filter(item =>
    item.name!.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Flex direction="row">
        <Input
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={addItem}>Add Item</Button>
      </Flex>
      <Table>
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
    </div>
  );
};

export default CrudTable;
