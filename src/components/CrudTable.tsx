import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Flex, Label } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { useNavigate } from 'react-router-dom';
import './CrudTable.css';
interface CrudTableProps {
  onRowClick: (user: Schema['User']['type']) => void;
}

const client = generateClient<Schema>();

const CrudTable: React.FC<CrudTableProps> = ({ onRowClick }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Schema['User']['type'][]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    city: '',
    birthDate: '',
    email: '',
  });
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleRowClick = (item: Schema['User']['type']) => {
    onRowClick(item);
    navigate('/edit');
  };

  useEffect(() => {
    // const user = {
    //   name: 'name',
    //   lastName: 'name',
    //   city: 'name',
    //   birthDate: 'name',
    //   email: 'name',
    // };
    // setItems([user, user, user, user, user]);

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

  const filteredItems = items.filter((item) =>
    item.email!.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="crud-container">
      <Flex direction="column" gap="small">
        <Flex className="search-container">
          <Button onClick={() => setIsFormVisible(true)} className="add-button">
            Crear Usuario
          </Button>
          <Input
            placeholder="Busqueda por email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </Flex>

        <div className="table-container">
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Ciudad</th>
                <th>Fecha nacimiento</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.lastName}</td>
                  <td>{item.city}</td>
                  <td>{item.birthDate}</td>
                  <td>{item.email}</td>
                  <td>
                    <div className="buttonsActions">
                      <Button onClick={() => handleRowClick(item)}>
                        Perfil
                      </Button>
                      <Button onClick={() => deleteItem(item.id)}>
                        Eliminar
                      </Button>
                    </div>
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
              <h3>Añadir nuevo usuario</h3>
              <button className="close-button" onClick={() => setIsFormVisible(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="lastName">Apellidos</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
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
