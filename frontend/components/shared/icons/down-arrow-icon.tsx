import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

const DownArrowIcon = (props: SvgProps) => (
  <Svg width="1200pt" height="1200pt" viewBox="0 0 1200 1200" {...props}>
    <Path d="m1133.1 313.57-533.08 533.08-533.08-533.08c-7.332-7.332-19.18-7.332-26.512 0s-7.332 19.18 0 26.512l546.34 546.34c3.6562 3.6562 8.457 5.4922 13.258 5.4922s9.6016-1.8359 13.258-5.4922l546.34-546.34c7.332-7.332 7.332-19.18 0-26.512s-19.18-7.332-26.512 0z" />
  </Svg>
);
export default DownArrowIcon;
