import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const AirbagIcon = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Circle cx="9.2" cy="9.8" r="8" />
    <Circle cx="26.6" cy="8.5" r="3.7" />
    <Path d="M21,19.4l1.9-3.9c0.6-1.4,2.2-2.1,3.6-1.5l0,0c1.4,0.6,2.1,2.2,1.5,3.6l-3.7,9.2L21,19.4z" />
    <Path d="M15.1,21.7c0,0-2.4-1-4.4-1c-1-0.2-2.1,0.3-2.6,1.2l-4.9,8.4C2.5,31.5,3,33,4.2,33.7l0,0  c1.2,0.7,2.8,0.3,3.4-0.9l3.8-6.5c0.6-0.3,1.3-0.3,1.9-0.1c2.2,0.7,3.7,1.3,3.7,1.3L15.1,21.7z" />
    <Polygon points="29.2,13.7 34.3,10.1 35.2,12.5 30.5,16 " />
    <Path d="M21.6,34.4h3.2l-5-13.4c-0.2-0.6-0.9-0.9-1.5-0.7c-0.1,0-0.2,0.1-0.2,0.1c-1.2,0.6-0.8,1.7-0.8,1.7L21.6,34.4z" />
  </Svg>
);

export default AirbagIcon;
