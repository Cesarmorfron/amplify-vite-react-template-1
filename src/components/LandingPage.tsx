import React from 'react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Esquela Electrónica</h1>
          <p className="hero-subtitle">
            <strong>
              Olvídate de las esquelas en periódicos que nadie lee.
            </strong>{' '}
            Con Esquela Electrónica, los avisos llegan{' '}
            <strong>directamente</strong> a quienes importan.
          </p>
          <a href="mailto:informacion@esquelaelectronica.com" className="cta-button">
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
            <div className="responsive-video">
              <iframe
                src="https://www.youtube.com/embed/huFaLi6BOPY"
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="about-text">
            <h2>¿Qué es Esquela Electrónica?</h2>
            <p>
              Esquela Electrónica es una plataforma diseñada para{' '}
              <strong>modernizar y agilizar la comunicación funeraria</strong>.
              Permite a las funerarias gestionar los contactos de los clientes y
              enviar <strong>avisos automáticos por email y SMS</strong> con los
              detalles del funeral.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>
          <strong>💼 Características principales</strong>
        </h2>
        <div className="features-container">
          <div className="feature">
            <h3>✅ Gestión de contactos</h3>
            <p>
              Mantén un registro detallado de los contactos de los usuarios para
              facilitar la comunicación en el momento necesario.
            </p>
          </div>
          <div className="feature">
            <h3>✅ Notificaciones automatizadas</h3>
            <p>
              Envía <strong>correos electrónicos</strong> automáticos con
              información clave del funeral.
            </p>
          </div>
          <div className="feature">
            <h3>✅ Información precisa</h3>
            <p>
              Asegúrate de que todos reciban la{' '}
              <strong>información correcta y a tiempo</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2>🎯 Beneficios para tu funeraria</h2>
        <div className="benefits-container">
          <div className="benefit">
            <h3>⏳ Ahorra tiempo</h3>
            <p>
              Automatiza las notificaciones y simplifica procesos
              administrativos.
            </p>
          </div>
          <div className="benefit">
            <h3>💼 Ofrece un servicio premium</h3>
            <p>
              Brinda una solución <strong>tecnológica e innovadora</strong> para
              la comunicación funeraria.
            </p>
          </div>
          <div className="benefit">
            <h3>✅ Fácil de usar</h3>
            <p>Interfaz intuitiva para una gestión rápida y eficiente.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Empieza a usar Esquela Electrónica hoy mismo</h2>
        <p>
          Simplifica la comunicación en momentos delicados y moderniza los
          servicios funerarios. Si tienes preguntas,{' '}
          <strong>contáctanos</strong>.
        </p>
        <p>
          Escríbenos a{' '}
          <a
            href="mailto:informacion@esquelaelectronica.com"
            style={{ color: 'blue' }}
          >
            informacion@esquelaelectronica.com
          </a>{' '}
          o llámanos al{' '}
          <a href="tel:+34686092421" style={{ color: 'blue' }}>
            686 09 24 21
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
