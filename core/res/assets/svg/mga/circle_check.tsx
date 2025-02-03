import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const CircleCheck = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#008000" stroke-width="1.8" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
    <Path d="M12.5 8.33337L9.16667 11.6667L7.5 10" stroke="#008000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  </Svg>
);

export default CircleCheck;
