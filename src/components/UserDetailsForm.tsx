import React, { useEffect, useState } from 'react';
import { Flex, Input, Button, Grid, Table, Label } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import './UserDetailsForm.css';
import { StorageManager } from '@aws-amplify/ui-react-storage';

interface UserDetailsFormProps {
  user: Schema['User']['type'] | null;
}

const client = generateClient<Schema>();

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ user }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isFormStorageManagerVisible, setIsFormStorageManagerVisible] =
    useState(false);
  const [isEditInfoFormVisible, setEditInfoFormVisible] = useState(false);

  const [items, setItems] = useState<Schema['Contact']['type'][]>([]);
  const [isDialogDeadOpen, setIsDialogDeadOpen] = useState(false);
  const [isDeleteContactDialogOpen, setIsDeleteContactDialogOpen] =
    useState(false);
  const [contactToDelete, setContactToDelete] = useState('');

  const [formData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    lastName: user?.lastName || '',
    city: user?.city || '',
    birthDate: user?.birthDate || '',
    email: user?.email || '',
  });

  const [formEditData, setFormEditData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    lastName: user?.lastName || '',
    city: user?.city || '',
    birthDate: user?.birthDate || '',
    email: user?.email || '',
  });

  const [contactFormData, setContactFormData] = useState({
    emailContact: '',
    name: '',
    lastName: '',
  });

  useEffect(() => {
    // Función para obtener los contactos filtrados
    const fetchContacts = async () => {
      try {
        const { data: contacts, errors } = await client.models.Contact.list({
          filter: {
            idUser: {
              eq: user?.id
            }
          }
        });

        if (errors) {
          console.error(errors);
        } else {
          setItems([...contacts]);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();

    // const sub = client.models.Contact.observeQuery().subscribe({
    //   next: ({ items }) => {
    //     setItems([...items]);
    //   },
    // });

    // // Cleanup para la suscripción
    // return () => sub.unsubscribe();
  }, [user?.id]);

  // useEffect(() => {
  //   // const contact = {id: 'name',emailContact: 'name',name: 'name',lastName: 'name',idUser: 'name',}; setItems([contact, contact, contact, contact, contact]);

  //   const sub = client.models.Contact.observeQuery().subscribe({next: ({ items }) => {  setItems([...items]);},}); return () => sub.unsubscribe();
    
  // }, []);

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
    console.log(id);
    await client.models.Contact.delete({ id });
    setIsDeleteContactDialogOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormEditData({
      ...formEditData,
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

  const handleUpdateUserInfoSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
  
      await client.models.User.update({
        id: user!.id,
        name: formEditData.name,
        lastName: formEditData.lastName,
        city: formEditData.city,
        birthDate: formEditData.birthDate,
        email: formEditData.email,
      });
      formData.name = formEditData.name
      formData.lastName = formEditData.lastName
      formData.city = formEditData.city
      formData.birthDate = formEditData.birthDate
      formData.email = formEditData.email
  
      // Hide modal after submission
      setEditInfoFormVisible(false);
    }catch(error) {
      console.log(error)
      throw error
    }
  };

  const closeEditInfoForm = () => {
    formEditData.name = formData.name
    formEditData.lastName = formData.lastName
    formEditData.city = formData.city
    formEditData.birthDate = formData.birthDate
    formEditData.email = formData.email

    console.log(3)
    setEditInfoFormVisible(false);
  }

  const handleCreateContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await client.models.Contact.create({
      emailContact: contactFormData.emailContact,
      name: contactFormData.name,
      lastName: contactFormData.lastName,
      idUser: user?.id,
    });

    // Clear form data
    setContactFormData({
      emailContact: '',
      name: '',
      lastName: '',
    });

    // Hide modal after submission
    setIsFormVisible(false);
  };

  const handleNotifyClick = () => {
    setIsDialogDeadOpen(true);
  };

  const handleConfirm = () => {
    // Aquí va la lógica para notificar el fallecimiento
    console.log('Fallecimiento notificado');
    setIsDialogDeadOpen(false);
    // Aquí puedes añadir cualquier otra lógica después de la confirmación
  };

  const handleCancel = () => {
    setIsDialogDeadOpen(false);
  };

  const handleBackToTable = () => {
    navigate('/');
  };

  // const deleteItem = async (id: string) => {
  //   await client.models.Contact.delete({ id });
  // };

  const filteredItems = items.filter((item) =>
    item.emailContact!.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Flex className="notification-container">
        <Button onClick={handleBackToTable} className="back-button">
          &#x2190; {/* Flecha hacia la izquierda */}
        </Button>

        <Button onClick={handleNotifyClick} className="notify-button">
          Notificar fallecimiento
        </Button>
      </Flex>

      {isDialogDeadOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header-confirmation">
              <div className="header-content">
                <h3>¿Notificar fallecimiento?</h3>
                <p>
                  Todos los contactos de este usuario recibirán una
                  notificación.
                </p>
                <button onClick={() => setIsDialogDeadOpen(false)}>
                  &times;
                </button>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={handleCreateContactSubmit}>
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

      <form className="user-form">
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap="small"
          className="grid-container"
        >
          <div className="form-group">
            <label className="form-label">Name</label>
            <p className="form-input">{formData.name}</p>
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <p className="form-input">{formData.lastName}</p>
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <p className="form-input">{formData.city}</p>
          </div>

          <div className="form-group">
            <label className="form-label">Birth Date</label>
            <p className="form-input">{formData.birthDate}</p>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <p className="form-input">{formData.email}</p>
          </div>
        </Grid>

        <Flex justifyContent="center" marginTop="small">
          <Button
            onClick={() => setEditInfoFormVisible(true)}
            className="add-button"
          >
            Editar informacion
          </Button>
        </Flex>
      </form>

      {isEditInfoFormVisible && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header-confirmation">
              <div className="modal-header">
                <h3>Editar usuario</h3>
                <button onClick={() => closeEditInfoForm()}>
                  &times;
                </button>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateUserInfoSubmit}>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  value={formEditData.name}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="lastName">Apellidos</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formEditData.lastName}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  type="text"
                  value={formEditData.city}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formEditData.birthDate}
                  onChange={handleChange}
                  isRequired
                />
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEditData.email}
                  onChange={handleChange}
                  isRequired
                />
                <Flex justifyContent="space-between" marginTop="medium">
                  <Button type="button" onClick={() => closeEditInfoForm()}>
                    Cancelar
                  </Button>
                  <Button type="submit">Editar</Button>
                </Flex>
              </form>
            </div>
          </div>
        </div>
      )}

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
            <Button
              onClick={() => setIsFormStorageManagerVisible(true)}
              className="add-button"
            >
              Importar archivo
            </Button>
          </Flex>

          <div className="table-container">
            <Table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  //   <tr key={item.id} onClick={() => handleRowClick(item)}>
                  <tr key={item.id}>
                    <td className="table-ellipsis">{item.emailContact}</td>
                    <td className="table-ellipsis">{item.name}</td>
                    <td className="table-ellipsis">{item.lastName}</td>
                    <td>
                      <div className="buttonsActions">
                        {/* <Button onClick={() => deleteItem(item.id!)}> */}
                        <Button
                          onClick={() =>
                            handleNotifyDeleteContactClick(item.id!)
                          }
                        >
                          &#x1F5D1;
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Flex>

        {isFormStorageManagerVisible && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header-confirmation">
                <div className="header-content">
                  <h3>Importar contactos</h3>
                  <p>
                    Suba un archivo csv. Ponga como titulo de la columna nombre,
                    apellidos y email
                  </p>
                </div>
                <button onClick={() => setIsFormStorageManagerVisible(false)}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <StorageManager
                  acceptedFileTypes={['.csv']}
                  path="public/"
                  autoUpload={false}
                  maxFileCount={1}
                  isResumable
                  displayText={{
                    // some text are plain strings
                    dropFilesText: 'Suelta los archivos .csv aqui',
                    browseFilesText: 'Selecciona el archivo',
                  }}
                />
              </div>
            </div>
          </div>
        )}

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
                    handleDeleteContactConfirm(contactToDelete);
                  }}
                >
                  <Flex justifyContent="space-between" marginTop="medium">
                    <Button
                      type="button"
                      onClick={() =>
                        handleDeleteContactConfirm(contactToDelete)
                      }
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
              <div className="modal-header-confirmation">
                <div className="modal-header">
                  <h3>Añadir nuevo contacto</h3>
                  <button onClick={() => setIsFormVisible(false)}>
                    &times;
                  </button>
                </div>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateContactSubmit}>
                  <Label htmlFor="emailContact">Email de contacto</Label>
                  <Input
                    id="emailContact"
                    type="text"
                    value={contactFormData.emailContact}
                    onChange={contactHandleChange}
                    isRequired
                  />
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    type="text"
                    value={contactFormData.name}
                    onChange={contactHandleChange}
                    isRequired
                  />
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={contactFormData.lastName}
                    onChange={contactHandleChange}
                    isRequired
                  />
                  <Flex justifyContent="space-between" marginTop="medium">
                    <Button
                      type="button"
                      onClick={() => setIsFormVisible(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar</Button>
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
