import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const BoxGradientLight = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Rect width="800" height="800" fill="url(#gradient-fill)" />
  </Svg>
);

export default BoxGradientLight;
