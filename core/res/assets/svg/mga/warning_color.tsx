import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const WarningColor = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Rect x="11.25" y="10.6145" class="st0" width="1.5" height="5" />
    <Path class="st0" d="M11.4245,17.99762C11.57928,18.1524,11.77112,18.2298,12,18.2298c0.22882,0,0.42072-0.07739,0.5755-0.23218  c0.15479-0.15485,0.23218-0.34662,0.23218-0.57544c0-0.22888-0.07739-0.42065-0.23218-0.5755  C12.42072,16.69189,12.22882,16.6145,12,16.6145c-0.22888,0-0.42072,0.07739-0.5755,0.23218  c-0.15479,0.15485-0.23218,0.34662-0.23218,0.5755C11.19232,17.651,11.26971,17.84277,11.4245,17.99762z" />
    <Path class="st1" d="M12,3.42224L1.86548,20.92212h20.2691L12,3.42224z M11.25,10.6145h1.5v5h-1.5V10.6145z M11.4245,16.84668  C11.57928,16.69189,11.77112,16.6145,12,16.6145c0.22882,0,0.42072,0.07739,0.5755,0.23218  c0.15479,0.15485,0.23218,0.34662,0.23218,0.5755c0,0.22882-0.07739,0.42059-0.23218,0.57544  C12.42072,18.1524,12.22882,18.2298,12,18.2298c-0.22888,0-0.42072-0.07739-0.5755-0.23218  c-0.15479-0.15485-0.23218-0.34662-0.23218-0.57544C11.19232,17.1933,11.26971,17.00153,11.4245,16.84668z" />
  </Svg>
);

export default WarningColor;
