import React from 'react';
import './LandingPage.css';
import mobileNotification from '../../public/assets/mobile-notification.jpg'

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Esquela Electrónica</h1>
          <p className="hero-subtitle">
            El servicio que ayuda a las funerarias a notificar a los seres
            queridos del fallecido de manera sencilla, rápida y respetuosa.
          </p>
          <a href="mailto:info@esquelaelectronica.com" className="cta-button">
          <strong>Solicita información</strong>
          </a>
          <a href="/app/users" className="cta-button">
            <strong>Iniciar sesión</strong>
          </a>
        </div>
      </header>

      <section className="about-section">
        <div className="about-content">
          <div className="about-image">
            <img src={mobileNotification} alt="Servicio funerario" />
          </div>
          <div className="about-text">
            <h2>¿Qué es Esquela Electrónica?</h2>
            <p>
              Esquela Electrónica es una plataforma diseñada para funerarias,
              que permite gestionar a los usuarios y sus contactos, notificando
              automáticamente a los seres queridos del fallecido sobre los
              detalles del funeral, velatorio, y más.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Características principales</h2>
        <div className="features-container">
          <div className="feature">
            <h3>Gestión de contactos</h3>
            <p>
              Mantén un registro detallado de los contactos de los usuarios para
              facilitar la comunicación en el momento necesario.
            </p>
          </div>
          <div className="feature">
            <h3>Notificaciones automatizadas</h3>
            <p>
              Envía correos electrónicos automáticos a los contactos del
              fallecido con detalles importantes, como la fecha y el lugar del
              funeral.
            </p>
          </div>
          <div className="feature">
            <h3>Información precisa</h3>
            <p>
              Asegúrate de que todos reciban la información correcta y a tiempo
              sobre el velatorio, funeral, y cualquier otro detalle relevante.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>Beneficios para tu funeraria</h2>
        <div className="benefits-container">
          <div className="benefit">
            <h3>Ahorra tiempo</h3>
            <p>
              Automatiza las notificaciones y simplifica los procesos
              administrativos, permitiendo que tu equipo se enfoque en lo que
              realmente importa.
            </p>
          </div>
          <div className="benefit">
            <h3>Ofrece un servicio premium</h3>
            <p>
              Mejora la experiencia de tus clientes brindándoles una solución
              tecnológica que gestiona la comunicación con los seres queridos
              del fallecido.
            </p>
          </div>
          <div className="benefit">
            <h3>Fácil de usar</h3>
            <p>
              Nuestra plataforma es intuitiva y sencilla, lo que permite a las
              funerarias gestionar todo de manera rápida y eficiente.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Empieza a usar Esquela Electrónica hoy mismo</h2>
        <p>
          Simplifica la comunicación en los momentos más delicados y ofrece un
          servicio respetuoso y eficiente a tus clientes. Da el siguiente paso
          para modernizar los servicios funerarios. <br />
          Si tienes preguntas o quieres saber más sobre nuestros servicios, no
          dudes en contactarnos.
        </p>
        <p>
          Escríbenos a:{' '}
          <a href="mailto:info@esquelaelectronica.com" style={{ color: 'blue' }}>
            info@esquelaelectronica.com
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          &copy; 2024 Esquela Electrónica. Todos los derechos reservados.{' '}
          <a href="/legal">Avisos legales</a>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
