import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const Doors = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Path d="M19,14h-3v2h3V14z M22,21H3V11l8-8h10c0.2652,0,0.5196,0.1054,0.7071,0.2929C21.8946,3.4804,22,3.7348,22,4V21z M11.83,5  l-6,6H20V5H11.83z" />
  </Svg>
);

export default Doors;
