import * as React from "react";
import Svg, { Path } from "react-native-svg";
const PlusIcon = (props) => (
  <Svg
    width="100pt"
    height="100pt"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path d="m77.5 48.75h-26.25v-26.25h-2.5v26.25h-26.25v2.5h26.25v26.25h2.5v-26.25h26.25z" />
  </Svg>
);
export default PlusIcon;
