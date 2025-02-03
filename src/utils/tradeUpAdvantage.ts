import {DealerInfo} from '../../@types';
export const tradeUpAdvantageProgram = (
  dealer: DealerInfo | null | undefined,
  isHawaii: boolean,
): boolean | undefined => {
  return (
    /** https://github.com/SubaruOfAmerica/tb2c-mysubaru-blob/7026a19f08e285b5600dd88b94d777ea19c45abd/www/pages/homePage.js#83 **/
    //MGA-2000 :Removing check for gen0 ,as in legacy can see checks only for hawaii and dealer flags

    !isHawaii &&
    dealer?.flags?.some(
      f => f.dealerFlagCode == 'EQUITY' && f.dealerFlagSubCode == 'TRADEUP',
    )
  );
};
