import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const RightArrowCircle = (props: SvgProps) => (
  <Svg width="100pt" height="100pt" viewBox="0 0 100 100" {...props}>
    <Path d="m50 76c14.301 0 26-11.699 26-26s-11.699-26-26-26-26 11.699-26 26 11.699 26 26 26zm0-50c13.199 0 24 10.801 24 24s-10.801 24-24 24-24-10.801-24-24 10.801-24 24-24z" />
    <Path d="m50.102 57.199 1.3984 1.4023 8.6016-8.6016-8.6016-8.6016-1.3984 1.4023 6.1992 6.1992h-15v2h15z" />
  </Svg>
);
export default RightArrowCircle;
