import React from 'react';

import { DealerInfo } from '../../../@types';
import { testID } from '../../components/utils/testID';
import CsfView from '../../components/CsfView';
import MgaAddress, { getServiceAddressFromDealer } from '../../components/MgaAddress';

/**
 * Paragraph view containing dealer name and address
 *
 * Used in various scheduler screens
 **/
const MgaDealerInfo: React.FC<{
  dealer: DealerInfo | null | undefined
}> = ({ dealer }) => {
  const serviceAddress = getServiceAddressFromDealer(dealer);
  const address = serviceAddress || dealer;
  const id = testID('DealerInfo');
  return (
    dealer && (
      <CsfView align="center">
        <MgaAddress
          {...address}
          testID={id('address')}
          textAlign="center"
          textVariant="body2"
          title={dealer.name}
        />
      </CsfView>
    )
  );
};

export default MgaDealerInfo;
