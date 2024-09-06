import React, { useEffect, useState } from 'react';
import { Flex, Input, Button, Grid, Table, Label } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

interface UserDetailsFormProps {
  user: Schema['User']['type'] | null;
}

const client = generateClient<Schema>();

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ user }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [items, setItems] = useState<Schema['Contact']['type'][]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteContactDialogOpen, setIsDeleteContactDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState('');

  const [formData, setFormData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    lastName: user?.lastName || '',
    city: user?.city || '',
    birthDate: user?.birthDate || '',
    email: user?.email || '',
  });

  const [contactFormData, setContactFormData] = useState({
    emailContact: '',
    aka: '',
  });

  useEffect(() => {
    const contact = {
      id: 'name',
      emailContact: 'name',
      aka: 'name',
      idUser: 'name',
    };
    setItems([contact, contact, contact, contact, contact]);

    // const sub = client.models.Contact.observeQuery().subscribe({
    //   next: ({ items }) => {
    //     setItems([...items]);
    //   },
    // });

    // return () => sub.unsubscribe();
  }, []);

  const handleNotifyDeleteContactClick = (id: string) => {
    setContactToDelete(id);
    setIsDeleteContactDialogOpen(true);
  };

  const handleDeleteContactCancel = () => {
    setIsDeleteContactDialogOpen(false);
  };

    // TODO: probar: borrado y como se pone a cero luego el id
    const handleDeleteContactConfirm = async (id: string) => {
      console.log('Fallecimiento notificado');
      await client.models.User.delete({ id });
      setIsDeleteContactDialogOpen(false);
    };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const contactHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setContactFormData({
      ...contactFormData,
      [id]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await client.models.Contact.create({
      emailContact: contactFormData.emailContact,
      aka: contactFormData.aka,
      idUser: user?.id,
    });

    // Clear form data
    setContactFormData({
      emailContact: '',
      aka: '',
    });

    // Hide modal after submission
    setIsFormVisible(false);
  };

  const handleNotifyClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    // Aquí va la lógica para notificar el fallecimiento
    console.log('Fallecimiento notificado');
    setIsDialogOpen(false);
    // Aquí puedes añadir cualquier otra lógica después de la confirmación
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleBackToTable = () => {
    navigate('/');
  };

  const deleteItem = async (id: string) => {
    await client.models.Contact.delete({ id });
  };

  const filteredItems = items.filter((item) =>
    item.emailContact!.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Flex
        direction="row"
        gap="small"
        justifyContent="space-between"
        marginTop="small"
      >
        <Button onClick={handleBackToTable}>Volver al inicio</Button>
        <Button onClick={handleNotifyClick}>Notificar fallecimiento</Button>
      </Flex>

      {isDialogOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>¿Notificar el fallecimiento?</h3>
              <p>
                Todos los contactos de este usuario recibirán una notificación
                de que ha fallecido.
              </p>
              <button onClick={() => setIsDialogOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <Flex justifyContent="space-between" marginTop="medium">
                  <Button type="button" onClick={() => handleConfirm()}>
                    Sí, estoy seguro
                  </Button>
                  <Button type="button" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </Flex>
              </form>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Grid templateColumns="repeat(3, 1fr)" gap="small">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px' }}>
              <label
                htmlFor="id"
                style={{
                  fontSize: '14px',
                  display: 'inline-block',
                  width: '100px',
                }}
              >
                ID
              </label>
              <Input
                id="id"
                value={formData.id}
                onChange={handleChange}
                size="small"
                isRequired
                style={{ width: 'calc(100% - 110px)' }}
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label
                htmlFor="name"
                style={{
                  fontSize: '14px',
                  display: 'inline-block',
                  width: '100px',
                }}
              >
                Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                size="small"
                isRequired
                style={{ width: 'calc(100% - 110px)' }}
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label
                htmlFor="lastName"
                style={{
                  fontSize: '14px',
                  display: 'inline-block',
                  width: '100px',
                }}
              >
                Last Name
              </label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                size="small"
                isRequired
                style={{ width: 'calc(100% - 110px)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px' }}>
              <label
                htmlFor="city"
                style={{
                  fontSize: '14px',
                  display: 'inline-block',
                  width: '100px',
                }}
              >
                City
              </label>
              <Input
                id="city"
                value={formData.city}
                onChange={handleChange}
                size="small"
                isRequired
                style={{ width: 'calc(100% - 110px)' }}
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label
                htmlFor="birthDate"
                style={{
                  fontSize: '14px',
                  display: 'inline-block',
                  width: '100px',
                }}
              >
                Birth Date
              </label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                size="small"
                isRequired
                style={{ width: 'calc(100% - 110px)' }}
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: '14px',
                  display: 'inline-block',
                  width: '100px',
                }}
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                size="small"
                isRequired
                style={{ width: 'calc(100% - 110px)' }}
              />
            </div>
          </div>
        </Grid>

        <Flex
          direction="row"
          gap="small"
          justifyContent="space-between"
          marginTop="small"
        >
          <Button type="submit">Update</Button>
        </Flex>
      </form>

      <div className="crud-container">
        <Flex direction="column" gap="small">
          <Flex className="search-container">
            <Button
              onClick={() => setIsFormVisible(true)}
              className="add-button"
            >
              Añadir contacto
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
                  <th>Email</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  //   <tr key={item.id} onClick={() => handleRowClick(item)}>
                  <tr key={item.id}>
                    <td className="table-ellipsis">{item.emailContact}</td>
                    <td>
                      {/* <Button onClick={() => deleteItem(item.id!)}> */}
                      <Button onClick={() => handleNotifyDeleteContactClick(item.id!)}>
                        &#x1F5D1;
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Flex>

        {isDeleteContactDialogOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header-confirmation">
              <div className="header-content">
                <h3>¿Eliminar contacto?</h3>
                <p>El contacto será eliminado del sistema</p>
              </div>
              <button onClick={() => setIsDeleteContactDialogOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeleteContactConfirm(contactToDelete); // Usa userToDelete aquí
                }}
              >
                <Flex justifyContent="space-between" marginTop="medium">
                  <Button
                    type="button"
                    onClick={() => handleDeleteContactConfirm(contactToDelete)}
                  >
                    Sí, estoy seguro
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      handleDeleteContactCancel();
                      setContactToDelete(''); // Limpia el ID cuando se cancela
                    }}
                  >
                    Cancelar
                  </Button>
                </Flex>
              </form>
            </div>
          </div>
        </div>
      )}

        {isFormVisible && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Añadir nuevo contacto</h3>
                <button onClick={() => setIsFormVisible(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <Label htmlFor="emailContact">Email de contacto</Label>
                  <Input
                    id="emailContact"
                    type="text"
                    value={contactFormData.emailContact}
                    onChange={contactHandleChange}
                    isRequired
                  />
                  <Label htmlFor="aka">Alias</Label>
                  <Input
                    id="aka"
                    type="text"
                    value={contactFormData.aka}
                    onChange={contactHandleChange}
                    isRequired
                  />
                  <Flex justifyContent="space-between" marginTop="medium">
                    <Button
                      type="button"
                      onClick={() => setIsFormVisible(false)}
                    >
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
    </div>
  );
};

export default UserDetailsForm;
