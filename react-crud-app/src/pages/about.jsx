import React from 'react';
import Card from '../components/Card';
import { Info, Target, Users } from 'lucide-react';

const About = () => {
  return (
    <main className="page-container">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Біз туралы
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
          Satu.kz – бұл заманауи сауда платформасы, мұнда сіз тауарларды оңай басқара аласыз және сауда жасай аласыз.
        </p>
      </div>

      <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <Card title="Біздің миссиямыз">
          <Info size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <p>Біздің мақсатымыз – саудагерлер мен сатып алушылар үшін ең ыңғайлы және қауіпсіз ортаны құру. Біз технологияларды қолдана отырып, сауданы жеңілдетеміз.</p>
        </Card>

        <Card title="Неліктен біз?">
          <Target size={32} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
          <p>Жоғары жылдамдық, қауіпсіздік және заманауи дизайн. Біз жыл сайын сервисімізді жетілдіріп, жаңа мүмкіндіктер қосамыз.</p>
        </Card>

        <Card title="Біздің команда">
          <Users size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <p>Біздің команда – өз ісінің мамандары. Біз әрқашан клиенттерімізге көмектесуге және сұрақтарыңызға жауап беруге дайынбыз.</p>
        </Card>
      </div>
    </main>
  );
};

export default About;
