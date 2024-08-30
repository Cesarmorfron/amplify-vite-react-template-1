import React, { useState } from 'react';
import { Flex, Input, Button, Grid } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import type { Schema } from "../../amplify/data/resource";

interface UserDetailsFormProps {
  user: Schema["User"]["type"] | null;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ user }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: user?.id || '',
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

  const handleBackToTable = () => {
    navigate('/');  
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid
        templateColumns="repeat(3, 1fr)"
        gap="small"
      >
        <label htmlFor="id" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>ID</label>
        <Input
          id="id"
          value={formData.id}
          onChange={handleChange}
          isRequired
        />
        <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Name</label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleChange}
          isRequired
        />
        <label htmlFor="lastName" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Last Name</label>
        <Input
          id="lastName"
          value={formData.lastName}
          onChange={handleChange}
          isRequired
        />
        <label htmlFor="city" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>City</label>        
        <Input
          id="city"
          value={formData.city}
          onChange={handleChange}
          isRequired
        />
        <label htmlFor="birthDate" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Birth Date</label>        
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          isRequired
        />
        <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Email</label>        
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          isRequired
        />
      </Grid>

      <Flex direction="row" gap="small" justifyContent="space-between" marginTop="small">
        <Button type="submit">Update</Button>
        <Button onClick={handleBackToTable} variation="link">
          Back to Home
        </Button>
      </Flex>
    </form>
  );
};

export default UserDetailsForm;
