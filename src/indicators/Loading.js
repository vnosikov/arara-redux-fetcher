import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const element = () => (
  <div style={{ fontSize: '96px' }}>
    <FontAwesomeIcon icon={faSpinner} pulse />
  </div>
);

export default element;
