import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Flex, Label } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import './CrudTable.css'; // Asegúrate de importar el archivo CSS

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

    // Hide modal after submission
    setIsFormVisible(false);
  };

  const deleteItem = async (id: string) => {
    await client.models.User.delete({ id });
  };

  const filteredItems = items.filter(item =>
    item.email!.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="crud-container">
      <Flex direction="column" gap="small">
        <Flex direction="row" gap="small" marginBottom="small">
          <Input
            placeholder="Search by email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => setIsFormVisible(true)}>
            Add Item
          </Button>
        </Flex>

        <div className="table-container">
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Last Name</th>
                <th>city</th>
                <th>birthDate</th>
                <th>email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.lastName}</td>
                  <td>{item.city}</td>
                  <td>{item.birthDate}</td>
                  <td>{item.email}</td>
                  <td>
                    <Button onClick={() => deleteItem(item.id)}>Delete</Button>
                    <Button onClick={() => deleteItem(item.id)}>Notificar defuncion</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Flex>

      {isFormVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button onClick={() => setIsFormVisible(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  isRequired
                />
                <Flex justifyContent="space-between" marginTop="medium">
                  <Button type="button" onClick={() => setIsFormVisible(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit</Button>
                </Flex>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudTable;
