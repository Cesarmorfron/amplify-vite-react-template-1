import React, { useEffect, useState } from 'react';
import { Flex, Input, Button, Grid, Table, Label } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import './UserDetailsForm.css';
import { StorageManager } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';

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
  const [isDialogDeceasedOpen, setIsDialogDeceasedOpen] = useState(false);
  const [isInfoDeceasedShowed, setIsInfoDeceasedShowed] = useState(false);

  const [isDeleteContactDialogOpen, setIsDeleteContactDialogOpen] =
    useState(false);
  const [contactToDelete, setContactToDelete] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    lastName: user?.lastName || '',
    city: user?.city || '',
    birthDate: user?.birthDate || '',
    email: user?.email || '',
    deceased: user?.deceased,
    vigil: user?.vigil || '',
    funeral: user?.funeral || '',
    dateDeceased: user?.dateDeceased || '',
  });

  const [formEditData, setFormEditData] = useState({
    id: user?.id || '',
    name: user?.name || '',
    lastName: user?.lastName || '',
    city: user?.city || '',
    birthDate: user?.birthDate || '',
    email: user?.email || '',
    vigil: user?.vigil || '',
    funeral: user?.funeral || '',
    dateDeceased: user?.dateDeceased || '',
  });

  const [contactFormData, setContactFormData] = useState({
    emailContact: '',
    name: '',
    lastName: '',
    mobile: '',
  });
  const today = new Date().toISOString().split('T')[0];

  const fetchContacts = async () => {
    try {
      const { data, errors } = await client.models.Contact.listContactByIdUser({
        idUser: user!.id!,
      });

      if (errors) {
        console.error(errors);
      } else {
        setItems([...data]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    if (user?.deceased) {
      setIsInfoDeceasedShowed(true);
    } else {
      setIsInfoDeceasedShowed(false);
    }

    fetchContacts();

    // const sub = client.models.Contact.observeQuery().subscribe({
    //   next: ({ items }) => {
    //     const filteredItems = items.filter(
    //       (contact) => contact.idUser === user?.id
    //     );

    //     // const sortedItems = [...filteredItems].sort((a, b) => {
    //     //   if (a.emailContact! < b.emailContact!) return -1;
    //     //   if (a.emailContact! > b.emailContact!) return 1;
    //     //   return 0;
    //     // });

    //     setItems(filteredItems);
    //   },
    // });

    // // Cleanup para la suscripción
    // return () => sub.unsubscribe();
  }, [user?.id]);

//   useEffect(() => {
//     const contact = {
//       id: 'name',
//       emailContact: 'name',
//       name: 'name',
//       lastName: 'name',
//       idUser: 'name',
//     };
//     setItems([contact, contact, contact, contact, contact]);

//   // const sub = client.models.Contact.observeQuery().subscribe({next: ({ items }) => {  setItems([...items]);},}); return () => sub.unsubscribe();
// }, []);

  const handleNotifyDeleteContactClick = async (id: string) => {
    if (!user?.deceased) {
      setContactToDelete(id);
      setIsDeleteContactDialogOpen(true);
    }
  };

  const handleDeleteContactCancel = () => {
    setIsDeleteContactDialogOpen(false);
  };

  // TODO: probar: borrado y como se pone a cero luego el id
  const handleDeleteContactConfirm = async (id: string) => {
    try {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      await client.models.Contact.delete({ id });
      setIsDeleteContactDialogOpen(false);
      await fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
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
        deceased: user?.deceased,
        vigil: formEditData.vigil,
        funeral: formEditData.funeral,
        dateDeceased: formEditData.dateDeceased,
        company: user!.company,
      });
      formData.name = formEditData.name;
      formData.lastName = formEditData.lastName;
      formData.city = formEditData.city;
      formData.birthDate = formEditData.birthDate;
      formData.email = formEditData.email;
      formData.deceased = user!.deceased;
      formData.vigil = formEditData.vigil;
      formData.funeral = formEditData.funeral;
      formData.dateDeceased = formEditData.dateDeceased;

      // Hide modal after submission
      setEditInfoFormVisible(false);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const closeEditInfoForm = () => {
    formEditData.name = formData.name;
    formEditData.lastName = formData.lastName;
    formEditData.city = formData.city;
    formEditData.birthDate = formData.birthDate;
    formEditData.email = formData.email;

    setEditInfoFormVisible(false);
  };

  const validateMobileNumber = (mobile: string) => {
    const isValid = /^\+?[0-9]+$/.test(mobile);
    return isValid;
  };

  const handleCreateContactSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);

      if (!contactFormData.emailContact && !contactFormData.mobile) {
        alert('El contacto necesita un email o un movil.');
        return;
      }

      if (contactFormData.emailContact) {
        const emailExists = items.some(
          (item) => item.emailContact === contactFormData.emailContact
        );

        if (emailExists) {
          alert('Este email ya está registrado.');
          return;
        }

        const { data: dataBlack } = await client.models.BlacklistContact.get({
          id: contactFormData.emailContact,
        });

        if (dataBlack) {
          alert(
            'Este email no quiere recibir notificaciones de esquela electronica.'
          );
          return;
        }

        const { data: dataWhite } = await client.models.WhitelistContact.get({
          id: contactFormData.emailContact,
        });

        if (!dataWhite) {
          await Promise.all([
            client.models.WhitelistContact.create({
              id: contactFormData.emailContact,
            }),
            client.queries.newContact({
              emailContact: contactFormData.emailContact,
              emailUser: formEditData.email,
              nameUser: formEditData.name,
              lastName: formEditData.lastName,
            }),
          ]);
        }
      }

      if (!validateMobileNumber(contactFormData.mobile)) {
        alert('El número de móvil no es válido. Puede comenzar con "+" seguido de números o solo ser números.');
        return;
      }

      await client.models.Contact.create({
        emailContact: contactFormData.emailContact,
        mobile:
          contactFormData.mobile !== '' &&
          contactFormData.mobile.charAt(0) !== '+'
            ? '+34' + contactFormData.mobile
            : contactFormData.mobile,
        name: contactFormData.name,
        lastName: contactFormData.lastName,
        idUser: user?.id,
      });

      // Clear form data
      setContactFormData({
        emailContact: '',
        name: '',
        lastName: '',
        mobile: '',
      });

      // Hide modal after submission
      setIsFormVisible(false);
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Hubo un error al crear el contacto.');
    } finally {
      await fetchContacts();

      setLoading(false);
    }
  };

  const handleNotifyClick = () => {
    if (!isInfoDeceasedShowed) setIsDialogDeceasedOpen(true);
  };

  const handleEditInfoClick = () => {
    if (!isInfoDeceasedShowed) setEditInfoFormVisible(true);
  };

  const handleFormVisibleClick = () => {
    if (!isInfoDeceasedShowed) setIsFormVisible(true);
  };

  const handleFormStorageManagerClick = () => {
    if (!isInfoDeceasedShowed) setIsFormStorageManagerVisible(true);
  };

  const uploadContactsFlagUserToFalse = async () => {
    try {
      await client.models.User.update({
        ...user,
        id: user!.id,
        flagUploadCsv: false,
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleFormStorageManagerCancel = async () => {
    setLoading(true);

    let contatsLoaded = false;
    while (!contatsLoaded) {
      const { data: dataUser } = await client.models.User.get({
        id: user!.id,
      });

      if (dataUser?.flagUploadCsv) {
        contatsLoaded = true;
      } else {
        await sleep(500);
      }
    }

    await fetchContacts();
    setIsFormStorageManagerVisible(false);
    setLoading(false);
  };

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const handleNotifyDeceased = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);

      const currentDate = new Date();
      const isoDate = currentDate.toISOString();

      await Promise.all([
        client.models.DeceasedNotified.create({
          date: isoDate,
          company: user!.company,
        }),
        client.models.User.update({
          id: user!.id,
          name: formEditData.name,
          lastName: formEditData.lastName,
          city: formEditData.city,
          birthDate: formEditData.birthDate,
          email: formEditData.email,
          deceased: true,
          vigil: formEditData.vigil,
          funeral: formEditData.funeral,
          dateDeceased: formEditData.dateDeceased,
          company: user!.company,
        }),
        client.queries.sayHello({
          idUser: user!.id,
          email: formEditData!.email,
          name: formEditData!.name,
          lastName: formEditData!.lastName,
          vigil: formEditData.vigil,
          funeral: formEditData.funeral,
          dateDeceased: formEditData.dateDeceased,
          company: user!.company,
        }),
      ]);

      formData.name = formEditData.name;
      formData.lastName = formEditData.lastName;
      formData.city = formEditData.city;
      formData.birthDate = formEditData.birthDate;
      formData.email = formEditData.email;
      formData.deceased = true;
      formData.vigil = formEditData.vigil;
      formData.funeral = formEditData.funeral;
      formData.dateDeceased = formEditData.dateDeceased;

      setIsDialogDeceasedOpen(false);
      setIsInfoDeceasedShowed(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDialogDeceased = () => {
    formEditData.vigil = '';
    formEditData.funeral = '';
    formEditData.dateDeceased = '';
    setIsDialogDeceasedOpen(false);
  };

  const handleCancelFormAddNewContact = () => {
    contactFormData.emailContact = '';
    contactFormData.name = '';
    contactFormData.lastName = '';
    contactFormData.mobile = '';
    setIsFormVisible(false);
  };

  const handleBackToTable = () => {
    navigate('/app/users');
  };

  const customFileName = () => {
    const timestamp = new Date().toISOString();
    return `${user?.id}|${timestamp}.`;
  };

  const filteredItems = items.filter((item) =>
    item.emailContact!.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Flex className="notification-container">
        <Button onClick={handleBackToTable} className="back-button">
          &#x2190; {/* Flecha hacia la izquierda */}
        </Button>
        <Button
          onClick={handleNotifyClick}
          className={`notify-button ${isInfoDeceasedShowed ? 'disabled' : ''}`}
        >
          Notificar defuncion
        </Button>
      </Flex>

      {loading && (
        <div className="loading-screen">
          <div className="spinner"></div>
        </div>
      )}

      {isDialogDeceasedOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header-confirmation">
              <div className="header-content">
                <h3>¿Notificar defuncion?</h3>
                <p>
                  Todos los contactos de este usuario recibirán una
                  notificación.
                </p>
                <button onClick={handleCancelDialogDeceased}>&times;</button>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={handleNotifyDeceased}>
                <Label htmlFor="vigil">Velatorio</Label>
                <Input
                  id="vigil"
                  type="text"
                  value={formEditData.vigil}
                  onChange={handleChange}
                />
                <Label htmlFor="funeral">Funeral</Label>
                <Input
                  id="funeral"
                  type="text"
                  value={formEditData.funeral}
                  onChange={handleChange}
                />
                <Label htmlFor="dateDeceased">Fecha defuncion</Label>
                <Input
                  id="dateDeceased"
                  type="date"
                  value={formEditData.dateDeceased}
                  onChange={handleChange}
                  isRequired
                  max={today}
                />

                <Flex justifyContent="space-between" marginTop="medium">
                  <Button type="button" onClick={handleCancelDialogDeceased}>
                    Cancelar
                  </Button>
                  <Button type="submit">Sí, estoy seguro</Button>
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

          {isInfoDeceasedShowed && (
            <>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <p className="form-input">
                  {formData.deceased ? 'Fallecido' : 'Vivo'}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Fecha defuncion</label>
                <p className="form-input">{formData.dateDeceased}</p>
              </div>

              <div className="form-group">
                <label className="form-label">Velatorio</label>
                <p className="form-input">{formData.vigil}</p>
              </div>

              <div className="form-group">
                <label className="form-label">Funeral</label>
                <p className="form-input">{formData.funeral}</p>
              </div>
            </>
          )}
        </Grid>

        <Flex justifyContent="center" marginTop="small">
          <Button
            onClick={handleEditInfoClick}
            className={`add-button ${isInfoDeceasedShowed ? 'disabled' : ''}`}
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
                <button onClick={() => closeEditInfoForm()}>&times;</button>
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
                  max={today}
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
              onClick={handleFormVisibleClick}
              className={`add-button ${isInfoDeceasedShowed ? 'disabled' : ''}`}
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
              onClick={handleFormStorageManagerClick}
              className={`add-button ${isInfoDeceasedShowed ? 'disabled' : ''}`}
            >
              Importar archivo
            </Button>
          </Flex>
          <div className="table-container">
            <Table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Movil</th>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  {!isInfoDeceasedShowed && <th>Eliminar</th>}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="table-ellipsis">{item.emailContact}</td>
                    <td className="table-ellipsis">{item.mobile}</td>
                    <td className="table-ellipsis">{item.name}</td>
                    <td className="table-ellipsis">{item.lastName}</td>
                    {!isInfoDeceasedShowed && (
                      <td>
                        <div className="buttonsActions">
                          <Button
                            onClick={() =>
                              handleNotifyDeleteContactClick(item.id!)
                            }
                          >
                            &#x1F5D1;
                          </Button>
                        </div>
                      </td>
                    )}
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
                  <a href="https://esquelaelectronica.com/assets/plantilla.csv" download style={{ color: 'blue' }}>
                    Descargar plantilla de ejemplo
                  </a>
                </div>
                <button onClick={handleFormStorageManagerCancel}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <StorageManager
                  acceptedFileTypes={['.csv']}
                  path={`csvs-esquela/${customFileName()}`}
                  autoUpload={true}
                  maxFileCount={1}
                  isResumable
                  displayText={{
                    // some text are plain strings
                    dropFilesText: 'Suelta los archivos .csv aqui',
                    browseFilesText: 'Selecciona el archivo',
                  }}
                  onUploadSuccess={() => {
                    uploadContactsFlagUserToFalse();
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
                      onClick={() => {
                        handleDeleteContactCancel();
                        setContactToDelete(''); // Limpia el ID cuando se cancela
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={() =>
                        handleDeleteContactConfirm(contactToDelete)
                      }
                    >
                      Sí, estoy seguro
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
                  <button onClick={handleCancelFormAddNewContact}>
                    &times;
                  </button>
                </div>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateContactSubmit}>
                  <Label htmlFor="emailContact">Email de contacto</Label>
                  <Input
                    id="emailContact"
                    placeholder="email@test.com"
                    type="email"
                    value={contactFormData.emailContact}
                    onChange={contactHandleChange}
                  />
                  <Label htmlFor="mobile">Numero de movil</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Prefijo +34 añadido automaticamente"
                    value={contactFormData.mobile}
                    onChange={contactHandleChange}
                  />
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Nombre"
                    type="text"
                    value={contactFormData.name}
                    onChange={contactHandleChange}
                  />
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input
                    id="lastName"
                    placeholder="Apellidos"
                    type="text"
                    value={contactFormData.lastName}
                    onChange={contactHandleChange}
                  />
                  <Flex justifyContent="space-between" marginTop="medium">
                    <Button
                      type="button"
                      onClick={handleCancelFormAddNewContact}
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
