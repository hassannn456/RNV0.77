import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const OutboundLink = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Path d="M5.3,20.5c-0.5,0-0.9-0.2-1.3-0.5s-0.5-0.8-0.5-1.3V5.3C3.5,4.8,3.7,4.4,4,4s0.8-0.5,1.3-0.5h6.3V5H5.3C5.2,5,5.2,5,5.1,5.1  C5,5.2,5,5.2,5,5.3v13.4c0,0.1,0,0.1,0.1,0.2C5.2,19,5.2,19,5.3,19h13.4c0.1,0,0.1,0,0.2-0.1c0.1-0.1,0.1-0.1,0.1-0.2v-6.3h1.5v6.3  c0,0.5-0.2,0.9-0.5,1.3s-0.8,0.5-1.3,0.5H5.3z M9.7,15.3l-1.1-1.1L17.9,5H14V3.5h6.5V10H19V6.1L9.7,15.3z" />
  </Svg>
);

export default OutboundLink;
