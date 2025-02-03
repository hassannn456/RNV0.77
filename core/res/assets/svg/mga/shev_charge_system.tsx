import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const ShevChargeSystem = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Path d="M24.12,9v-1.5h-4v1.5h-8.25v-1.5h-4v1.5H3.5v15.5h25v-15.5h-4.38ZM27,23H5v-12.5h22v12.5Z" />
    <Rect x="7.38" y="14.75" width="5" height="1.5" />
    <Polygon points="21.38 18 22.88 18 22.88 16.25 24.62 16.25 24.62 14.75 22.88 14.75 22.88 13 21.38 13 21.38 14.75 19.62 14.75 19.62 16.25 21.38 16.25 21.38 18" />
  </Svg>
);

export default ShevChargeSystem;
