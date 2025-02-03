import * as React from "react";
import Svg, { Path, G, Circle, Rect, Ellipse, Line, Polyline, Polygon } from "react-native-svg";

const CalendarFill = (props) => (
  <Svg
    viewBox="0 0 240 83"
    {...props}
  >
    <Path d="M5.3077,21.5001c-0.5051,0-0.9327-0.175-1.2827-0.525S3.5,20.1975,3.5,19.6924V6.3078c0-0.5051,0.175-0.9327,0.525-1.2827  c0.35-0.35,0.7776-0.525,1.2827-0.525h1.3846V2.3848h1.5384v2.1154h7.577V2.3848h1.4999v2.1154h1.3847  c0.5051,0,0.9327,0.175,1.2827,0.525c0.35,0.35,0.525,0.7776,0.525,1.2827v13.3846c0,0.5051-0.175,0.9327-0.525,1.2827  s-0.7776,0.525-1.2827,0.525H5.3077z M5.3077,20.0001h13.3846c0.0769,0,0.1474-0.032,0.2115-0.0961  C18.9679,19.8399,19,19.7693,19,19.6924v-9.3846H5v9.3846c0,0.0769,0.0321,0.1475,0.0961,0.2116  C5.1602,19.9681,5.2308,20.0001,5.3077,20.0001z" />
  </Svg>
);

export default CalendarFill;
