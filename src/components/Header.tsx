// src/components/Header.tsx
import React from 'react';
import { Heading } from '@aws-amplify/ui-react';

interface HeaderProps {
  title: React.ReactNode; // Cambiado de 'string' a 'React.ReactNode'
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header>
      <Heading level={1}>{title}</Heading>
    </header>
  );
};

export default Header;
