import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const AtOilTemp = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <G  />
    <Path d="M31.7,1.6c0.2,0,0.4,0.1,0.7,0.1c2,0.4,3.1,1.8,3.2,4c0.1,2.1,0,4.1-0.1,6.2c0,0.4-0.1,0.8-0.2,1.2   c-0.5,1.8-1.8,2.6-3.6,2.7c-0.8,0-1.7,0-2.5-0.2c-1.7-0.4-2.6-1.7-2.7-3.3c-0.2-2.5-0.2-5,0-7.4c0.1-1.9,1.4-3.1,3.4-3.4   c0.1,0,0.2-0.1,0.3-0.1C30.7,1.6,31.2,1.6,31.7,1.6z M33.7,8.7L33.7,8.7c-0.1-1.1-0.1-2.1-0.1-3.2c-0.1-1.5-1.1-2.4-2.5-2.4   c-1.6-0.1-2.7,0.7-2.8,2.3c-0.1,2.3,0,4.6,0,6.8c0,0.8,0.3,1.5,1,2c1.7,1.1,3.9,0.2,4.1-1.8C33.7,11.2,33.7,9.9,33.7,8.7z" />
    <Path d="M0.3,15.6c0.1-0.2,0.2-0.3,0.2-0.5c1.4-4.3,2.9-8.5,4.3-12.8C4.9,2,5.1,1.8,5.4,1.9c0.5,0,1,0,1.5,0   c0.3,0,0.4,0.2,0.5,0.4c1.2,3.6,2.5,7.2,3.7,10.8c0.3,0.8,0.6,1.7,0.9,2.6c-0.7,0-1.3,0-2,0c-0.3-0.9-0.6-1.8-0.9-2.7   c-0.1-0.5-0.3-0.6-0.8-0.6c-1.5,0-3.1,0-4.6,0c-0.4,0-0.5,0.1-0.6,0.5c-0.3,0.8-0.5,1.6-0.8,2.5c-0.1,0.3-0.2,0.4-0.5,0.4   C1.3,15.7,0.8,15.7,0.3,15.6C0.3,15.7,0.3,15.6,0.3,15.6z M3.7,10.9c1.6,0,3.1,0,4.7,0C7.6,8.4,6.8,6,6.1,3.6H6   C5.2,6,4.5,8.4,3.7,10.9z" />
    <Path d="M35.2,19.1c0,4.6,0,9.2,0,13.8c-0.6,0-1.2,0-1.8,0c0-4,0-8,0-12.1h-0.1c-0.1,0.2-0.1,0.3-0.2,0.5   c-1.2,3.7-2.5,7.5-3.7,11.2c-0.1,0.4-0.3,0.5-0.7,0.5c-0.4,0-0.8,0-1.2,0c-1.3-4-2.6-8-4-12.1h-0.1c0,4,0,8,0,12   c-0.6,0-1.1,0-1.7,0c0-4.6,0-9.1,0-13.7c1,0,2,0,3,0c1.2,3.8,2.4,7.7,3.7,11.6c0.1-0.3,0.2-0.5,0.3-0.7c1.1-3.5,2.3-7,3.4-10.5   c0.1-0.4,0.3-0.5,0.7-0.5C33.5,19.2,34.3,19.1,35.2,19.1z" />
    <Path d="M37.5,19.1c1.2,0,2.4,0,3.6,0c0.5,0,1.1,0,1.6,0.1c2,0.3,3,1.4,3.1,3.5c0.2,2.5-1.4,4.1-4,4.2   c-0.8,0-1.7,0-2.5,0c0,2,0,4,0,6c-0.6,0-1.2,0-1.8,0C37.5,28.3,37.5,23.8,37.5,19.1z M39.3,25.3c0.9,0,1.7,0,2.6,0   c1.1-0.1,1.9-0.8,2-1.8c0.2-1.3-0.3-2.3-1.3-2.7c-1.1-0.4-2.2-0.1-3.3-0.2C39.3,22.2,39.3,23.7,39.3,25.3z" />
    <Path d="M14.7,25.1c1.8,0,3.5,0,5.2,0c0,0.5,0,1,0,1.5c-1.7,0-3.5,0-5.2,0c0,1.6,0,3.2,0,4.8c1.9,0,3.8,0,5.7,0   c0,0.5,0,1,0,1.5c-2.5,0-5,0-7.6,0c0-4.6,0-9.1,0-13.7c2.5,0,5,0,7.5,0c0,0.5,0,0.9,0,1.4c-1.9,0-3.7,0-5.6,0   C14.7,22.1,14.7,23.6,14.7,25.1z" />
    <Path d="M15.2,3.4c-1.3,0-2.5,0-3.8,0c0-0.5,0-1,0-1.4c3.1,0,6.3,0,9.5,0c0,0.5,0,0.9,0,1.4c-1.2,0-2.5,0-3.8,0   c0,4.1,0,8.2,0,12.3c-0.6,0-1.2,0-1.8,0C15.2,11.6,15.2,7.5,15.2,3.4z" />
    <Path d="M2.7,20.6c0-0.5,0-1,0-1.5c3.2,0,6.3,0,9.5,0c0,0.5,0,0.9,0,1.4c-0.2,0-0.3,0-0.5,0c-0.8,0-1.6,0-2.4,0   c-1,0-0.9-0.1-0.9,0.8c0,3.6,0,7.2,0,10.8c0,0.2,0,0.4,0,0.7c-0.6,0-1.2,0-1.8,0c0-0.2,0-0.4,0-0.6c0-3.7,0-7.3,0-11   c0-0.5-0.1-0.6-0.6-0.6C4.9,20.6,3.8,20.6,2.7,20.6z" />
    <Path d="M41.8,1.9c0.6,0,1.2,0,1.8,0c0,4.1,0,8.1,0,12.3c1.8,0,3.6,0,5.4,0c0,0.5,0,1,0,1.5c-2.4,0-4.8,0-7.2,0   C41.8,11.1,41.8,6.5,41.8,1.9z" />
    <Path d="M37.8,1.9c0.6,0,1.2,0,1.8,0c0,4.6,0,9.1,0,13.7c-0.6,0-1.2,0-1.8,0C37.8,11.1,37.8,6.5,37.8,1.9z" />
  </Svg>
);

export default AtOilTemp;
