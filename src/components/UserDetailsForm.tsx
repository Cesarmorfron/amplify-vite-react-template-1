import React, { useState } from 'react';
import { Flex, Input, Button } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import type { Schema } from "../../amplify/data/resource";

interface UserDetailsFormProps {
  user: Schema["User"]["type"] | null;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ user }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    city: user?.city || '',
    birthDate: user?.birthDate || '',
    email: user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para actualizar la información del usuario...
    navigate('/');  // Volver a la tabla después de guardar los cambios
  };

  return (
    <Flex direction="column" gap="small" as="form" onSubmit={handleSubmit}>
      <Input
        id="name"
        value={formData.name}
        onChange={handleChange}
        isRequired
      />
      <Input
        id="lastName"
        value={formData.lastName}
        onChange={handleChange}
        isRequired
      />
      <Input
        id="city"
        value={formData.city}
        onChange={handleChange}
        isRequired
      />
      <Input
        id="birthDate"
        type="date"
        value={formData.birthDate}
        onChange={handleChange}
        isRequired
      />
      <Input
        id="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        isRequired
      />
      <Button type="submit">Update</Button>
    </Flex>
  );
};

export default UserDetailsForm;
