import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const BackArrow = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Path d="M16,21.7L6.3,12L16,2.3l1.4,1.4L9.2,12l8.2,8.2L16,21.7z" />
  </Svg>
);

export default BackArrow;
