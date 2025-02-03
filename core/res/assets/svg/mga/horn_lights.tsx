import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const HornLights = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <G />
    <Rect x="11.25" y="2.6346436" width="1.5" height="2.8076782" />
    <Polygon points="5.0923462,5.0076904 4.0385132,6.0923462 6.034668,8.0576782 7.0884399,7.0038452  " />
    <Polygon points="18.9077148,5.0385132 16.911499,7.0038452 17.9960938,8.0576782 19.9614868,6.0923462  " />
    <Path d="M6.5,13.7883911l3,3V21.5h5v-4.7116089l3-3V9.5h-11V13.7883911z M8,11h8v2.1654053l-3,3V20h-2v-3.8345947l-3-3V11z" />
  </Svg>
);

export default HornLights;
