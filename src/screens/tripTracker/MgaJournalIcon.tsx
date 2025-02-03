/* eslint-disable eqeqeq */
import React from 'react';
import { Journal } from '../../../@types';
import CsfAppIcon from '../../components/CsfAppIcon';

const MgaJournalIcon: React.FC<{ journal: Journal }> = ({ journal }) => {
  return (
    <CsfAppIcon
      icon={journal.journalCategory == 'BUSINESS' ? 'Business' : 'Home'}
    />
  );
};

export default MgaJournalIcon;
