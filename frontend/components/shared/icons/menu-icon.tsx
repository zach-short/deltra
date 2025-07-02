import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const MenuIcon = (props: SvgProps) => (
  <Svg width="100pt" height="100pt" viewBox="0 0 100 100" {...props}>
    <Path d="m95 80h-90c-0.55078 0-1-0.44922-1-1s0.44922-1 1-1h90c0.55078 0 1 0.44922 1 1s-0.44922 1-1 1z" />
    <Path d="m95 55h-90c-0.55078 0-1-0.44922-1-1s0.44922-1 1-1h90c0.55078 0 1 0.44922 1 1s-0.44922 1-1 1z" />
    <Path d="m95 30h-90c-0.55078 0-1-0.44922-1-1s0.44922-1 1-1h90c0.55078 0 1 0.44922 1 1s-0.44922 1-1 1z" />
  </Svg>
);
export default MenuIcon;
