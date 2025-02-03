import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const Bolt = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Path d="M10.6,18.2l5.2-6.2h-4l0.7-5.7L7.8,13h3.5L10.6,18.2z M8.6,21.4l1-6.9H5l8.2-11.9h1.2l-1,7.9h5.5L9.8,21.4H8.6z" />
  </Svg>
);

export default Bolt;
