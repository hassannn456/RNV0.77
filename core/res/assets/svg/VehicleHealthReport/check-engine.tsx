import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const CheckEngine = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <G  />
    <Path d="M21.3,36.6L21.3,36.6c-2.1-0.4-2.9-1.9-3-3.8c-0.1-2.4-0.2-4.8,0-7.2c0.2-2.8,2.1-4.2,5-3.6   c1.9,0.4,3,1.9,2.6,3.9c-0.5,0-1,0-1.5,0c0-0.3-0.1-0.6-0.1-0.9c-0.2-1-0.7-1.5-1.6-1.6c-1.2-0.1-2,0.2-2.4,1.1   c-0.2,0.5-0.4,1.1-0.4,1.6c0,2.2,0,4.3,0.1,6.5c0,0.1,0,0.2,0,0.3c0.3,2.1,2.3,3,4.2,1.7c0.1-0.1,0.2-0.2,0.2-0.3   c0-1.3,0-2.7,0-4.1c-0.8,0-1.5,0-2.2,0c0-0.5,0-1,0-1.5c1.2,0,2.5,0,3.7,0c0,0.1,0,0.2,0,0.3c0,2,0,4.1,0,6.1   c0,0.3-0.1,0.5-0.4,0.6c-0.8,0.3-1.5,0.5-2.3,0.8c-0.1,0-0.2,0.1-0.3,0.1C22.3,36.6,21.8,36.6,21.3,36.6z" />
    <Path d="M0.5,22.2c2.1,0,4.2,0,6.4,0c0,0.5,0,1,0,1.5c-1.6,0-3.1,0-4.7,0c0,1.6,0,3.1,0,4.6c1.5,0,2.9,0,4.4,0   c0,0.5,0,1,0,1.5c-1.5,0-2.9,0-4.4,0c0,1.7,0,3.3,0,5c1.6,0,3.2,0,4.8,0c0,0.5,0,1,0,1.6c-2.2,0-4.3,0-6.5,0   C0.5,31.6,0.5,26.9,0.5,22.2z" />
    <Path d="M17.9,5c0.6,0,1.2,0,1.8,0c0,4.7,0,9.3,0,14c-0.6,0-1.2,0-1.8,0c0-2.1,0-4.2,0-6.4c-1.7,0-3.4,0-5.1,0   c0,2.1,0,4.2,0,6.4c-0.6,0-1.1,0-1.6,0c-0.1,0-0.2-0.2-0.3-0.3c0-0.1,0-0.2,0-0.3c0-4.3,0-8.5,0-12.8c0-0.2,0-0.4,0-0.6   c0.6,0,1.2,0,1.8,0c0,2,0,4,0,6c1.7,0,3.4,0,5.1,0C17.9,9.1,17.9,7.1,17.9,5z" />
    <Path d="M9.4,36.3c-0.5,0-0.9,0-1.3,0c0-4.7,0-9.4,0-14.1c0.7,0,1.3,0,2,0c0.1,0,0.3,0.3,0.4,0.5   c1.5,3.6,2.9,7.3,4.3,10.9c0.1,0.2,0.2,0.4,0.3,0.5c0-3.9,0-7.9,0-11.9c0.5,0,0.9,0,1.3,0c0,4.7,0,9.3,0,14.1c-0.6,0-1.3,0-1.9,0   c-0.1,0-0.3-0.2-0.3-0.4c-1.4-3.4-2.7-6.9-4.1-10.3c-0.2-0.5-0.4-0.9-0.6-1.4H9.4C9.4,28.2,9.4,32.2,9.4,36.3z" />
    <Path d="M31.4,22.2c0.7,0,1.3,0,1.9,0c0.1,0,0.3,0.2,0.4,0.4c1.3,3.1,2.5,6.3,3.8,9.4c0.3,0.7,0.6,1.4,0.8,2.1h0.1   c0-0.2,0-0.4,0-0.6c0-3.5,0-7.1,0-10.6c0-0.9-0.1-0.8,0.8-0.8c0.2,0,0.3,0,0.5,0c0,4.7,0,9.4,0,14.1c-0.6,0-1.3,0-1.9,0   c-0.1,0-0.3-0.2-0.3-0.4c-1.3-3.3-2.6-6.5-3.9-9.8c-0.2-0.6-0.5-1.2-0.8-1.9h-0.1c0,4,0,8,0,12c-0.5,0-0.9,0-1.3,0   C31.4,31.6,31.4,26.9,31.4,22.2z" />
    <Path d="M42.3,11.9c0,2.4,0,4.8,0,7.2c-0.6,0-1.2,0-1.8,0c0-4.7,0-9.3,0-14c0.6,0,1.1,0,1.8,0c0,2,0,4.1,0,6.1h0.1   c0.1-0.2,0.3-0.3,0.4-0.5c1.4-1.8,2.9-3.5,4.3-5.3C47.3,5.1,47.6,5,47.9,5c0.5,0,1,0,1.5,0c-1.8,2.2-3.5,4.3-5.3,6.4   c1.8,2.6,3.7,5.1,5.6,7.7c-0.8,0-1.5,0-2.2,0c-0.1,0-0.3-0.2-0.4-0.4c-1.5-2.2-3-4.3-4.5-6.5C42.5,12.1,42.4,11.9,42.3,11.9   C42.4,11.8,42.4,11.8,42.3,11.9z" />
    <Path d="M29.3,5c0.2,1.5,0.2,1.5-1.3,1.5c-1.2,0-2.5,0-3.7,0c-0.2,0-0.4,0-0.6,0c0,1.5,0,3,0,4.6c1.7,0,3.4,0,5.2,0   c0,0.5,0,1,0,1.6c-1.7,0-3.4,0-5.2,0c0,1.7,0,3.3,0,4.9c1.9,0,3.8,0,5.8,0c0,0.5,0,0.9,0,1.2c0,0.1-0.2,0.3-0.3,0.3   c-2.4,0-4.8,0-7.2,0c0,0,0,0-0.1,0c0-4.6,0-9.3,0-14C24.3,5,26.8,5,29.3,5z" />
    <Path d="M38.9,8.9c-0.7,0-1.2,0-1.8,0c0-0.2,0-0.4,0-0.6c0-1.4-0.7-2-2-2c-1.4-0.1-2.4,0.6-2.5,2   c-0.3,2.6-0.4,5.2,0,7.8c0.2,1.6,1.3,2.2,3,1.9c0.9-0.2,1.5-1.1,1.7-2.2c0-0.2,0-0.4,0.1-0.6c0.6,0,1.2,0,1.8,0   c0.3,2.3-0.9,4.1-3.2,4.3c-0.8,0.1-1.6,0-2.3-0.1c-1.2-0.2-2.2-0.9-2.5-2.1c-0.3-0.9-0.5-1.9-0.6-2.9c-0.1-1.9,0-3.8,0.1-5.6   c0-0.5,0.2-1.1,0.4-1.6c0.4-1.1,1.1-1.8,2.2-2.1c1.2-0.3,2.3-0.4,3.5-0.1c1.4,0.3,2.2,1.3,2.3,2.7C38.9,8,38.9,8.4,38.9,8.9z" />
    <Path d="M7.6,15c0.6,0,1.2,0,1.8,0c0.4,2.4-1.2,4.3-3.5,4.4c-0.7,0-1.3,0-2-0.1c-1.2-0.2-2.1-0.9-2.5-2.1   c-0.3-0.8-0.5-1.7-0.5-2.5c-0.1-1.9,0-3.7,0-5.6C0.9,8.6,1,8,1.1,7.5c0.4-1.6,1.5-2.6,3.2-2.7C5.2,4.7,6,4.7,6.9,4.9   c1.4,0.3,2.2,1.2,2.3,2.6c0.1,0.4,0.1,0.9,0.1,1.4c-0.6,0-1.2,0-1.9,0c0-0.2-0.1-0.5-0.1-0.8C7.2,6.8,6.6,6.2,5,6.2   C3.6,6.2,2.8,7,2.7,8.3c-0.1,2.5-0.1,5,0,7.5c0.1,1.4,0.9,2,2.1,2.1c1.5,0.1,2.4-0.6,2.7-2.1C7.6,15.5,7.6,15.3,7.6,15z" />
    <Path d="M43.1,29.8c0,0.6,0,1.1,0,1.5c0,0.9,0,1.9,0,2.8c0,0.5,0.2,0.6,0.6,0.6c1.2,0,2.4,0,3.6,0c0.7,0,0.7,0,0.7,0.7   c0,0.3,0,0.5,0,0.8c-2.2,0-4.3,0-6.4,0c0-4.7,0-9.3,0-14c2.1,0,4.2,0,6.3,0c0,0.5,0,0.9,0,1.5c-1.6,0-3.2,0-4.8,0c0,0.5,0,1,0,1.5   c0,0.8,0,1.7,0,2.5c0,0.4,0.1,0.6,0.6,0.6c1.3,0,2.6,0,3.9,0c0,0.5,0,1,0,1.5C46.1,29.8,44.7,29.8,43.1,29.8z" />
    <Path d="M27.9,22.2c0.5,0,1,0,1.5,0c0,4.7,0,9.4,0,14c-0.5,0-1,0-1.5,0C27.9,31.6,27.9,26.9,27.9,22.2z" />
  </Svg>
);

export default CheckEngine;
