import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { SvgProps } from 'react-native-svg';
const WarningIcon = (props: SvgProps) => <Svg width="100pt" height="100pt" viewBox="0 0 100 100" {...props}><Path d="M98.332 93.332H1.668c-.59 0-1.148-.316-1.441-.832-.301-.516-.301-1.148 0-1.668L48.559 7.5c.3-.516.851-.832 1.441-.832s1.14.316 1.441.832l48.332 83.332c.301.516.301 1.148 0 1.668-.3.516-.851.832-1.441.832M4.559 90h90.883L50.001 11.66z" /><Path d="M50 71.668c-.918 0-1.668-.75-1.668-1.668V30c0-.918.75-1.668 1.668-1.668s1.668.75 1.668 1.668v40c0 .918-.75 1.668-1.668 1.668M52.668 81c0 3.555-5.336 3.555-5.336 0s5.336-3.555 5.336 0" /></Svg>;
export default WarningIcon;