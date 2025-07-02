import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { SvgProps } from "react-native-svg";

const RightArrowIcon = (props: SvgProps) => (
  <Svg width="100pt" height="100pt" viewBox="0 0 100 100" {...props}>
    <Path d="M34.559 81a1 1 0 0 0 .703-.281l30.891-30h-.004a1 1 0 0 0-1.387-1.43l-30.89 30a1.001 1.001 0 0 0 .699 1.723z" />
    <Path d="M65.441 51a1 1 0 0 0 .7-1.719l-30.892-30a1 1 0 0 0-1.36.07c-.362.376-.374.965-.03 1.36l30.89 30a1 1 0 0 0 .692.289" />
  </Svg>
);

export default RightArrowIcon;
