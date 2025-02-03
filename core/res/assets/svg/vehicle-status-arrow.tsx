import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const VehicleStatusArrow = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <G transform="translate(168.337 -93.352)" />
    <Path class="fill-warning" d="M-167.7 101.4c-0.2 0-0.3-0.1-0.5-0.2 -0.3-0.3-0.3-0.7 0-0.9l2.9-2.9 -2.9-2.9c-0.3-0.3-0.3-0.7 0-0.9 0.3-0.3 0.7-0.3 0.9 0 0 0 0 0 0 0l3.3 3.3c0.1 0.1 0.2 0.3 0.2 0.5 0 0.2-0.1 0.3-0.2 0.5l-3.3 3.3C-167.3 101.3-167.5 101.4-167.7 101.4z" />
  </Svg>
);

export default VehicleStatusArrow;
