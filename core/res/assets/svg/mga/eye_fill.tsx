/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import Svg, { Path, G } from 'react-native-svg';

const EyeFill = (props) => (
  <Svg
    style={{ width: '100%', height: '20px' }}
    {...props}
  >
    <G />
    <Path d="M18.2846069,6.4028931C16.3936157,5.1342773,14.2982178,4.5,11.9985962,4.5   c-2.2995605,0-4.3944702,0.6342773-6.2845459,1.9028931C3.8239136,7.6714478,2.4320679,9.3704834,1.5385132,11.5   c0.8935547,2.1295166,2.2858887,3.8284912,4.1768799,5.0971069C7.6064453,17.8657227,9.7017822,18.5,12.0014038,18.5   s4.3944092-0.6342773,6.2844849-1.9028931c1.8901978-1.2686157,3.2819824-2.9675903,4.1755981-5.0971069   C21.5678711,9.3704834,20.1755981,7.6714478,18.2846069,6.4028931z M14.8894043,14.387085   c-0.791687,0.7932129-1.7540283,1.1898193-2.887085,1.1898193c-1.1331177,0-2.0963135-0.3959351-2.8894653-1.1875   c-0.7931519-0.791687-1.1897583-1.7540894-1.1897583-2.887085c0-1.1331177,0.395813-2.0963135,1.1875-2.8895264   c0.791687-0.7931519,1.7540283-1.1896973,2.887085-1.1896973c1.1331177,0,2.0963135,0.395813,2.8894043,1.1875   c0.7932129,0.791626,1.1898193,1.7540283,1.1898193,2.887085C16.0769043,12.6307983,15.6810913,13.5938721,14.8894043,14.387085z" />
    <Path d="M12,8.7999878c-0.75,0-1.3875122,0.2625122-1.9124756,0.7874756C9.5625,10.1124878,9.2999878,10.75,9.2999878,11.5   s0.2625122,1.3875122,0.7875366,1.9124756C10.6124878,13.9375,11.25,14.2000122,12,14.2000122   s1.3875122-0.2625122,1.9124756-0.7875366C14.4375,12.8875122,14.7000122,12.25,14.7000122,11.5   S14.4375,10.1124878,13.9124756,9.5874634C13.3875122,9.0625,12.75,8.7999878,12,8.7999878z" />
  </Svg>
);

export default EyeFill;
