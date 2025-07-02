import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { SvgProps } from "react-native-svg";
const CalendarIcon = (props: SvgProps) => (
  <Svg width="100pt" height="100pt" viewBox="0 0 100 100" {...props}>
    <Path
      fill="none"
      stroke="#000"
      strokeMiterlimit={10}
      d="M32 23.652a3 3 0 0 1-6 0v-6.5a3 3 0 0 1 6 0zM53 23.652a3 3 0 0 1-6 0v-6.5a3 3 0 0 1 6 0zM74 23.652a3 3 0 0 1-6 0v-6.5a3 3 0 0 1 6 0z"
    />
    <Path
      fill="none"
      stroke="#000"
      strokeMiterlimit={10}
      d="M26 20.098h-4.875c-2.21 0-4 1.79-4 4v57.75c0 2.21 1.79 4 4 4h57.75c2.21 0 4-1.79 4-4v-57.75c0-2.21-1.79-4-4-4H74M47 20.098H32M68 20.098H53M17.125 33.668h65.75"
    />
    <Path
      fill="none"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      d="M29.316 43.125h5.938v5.938h-5.938zM38.176 43.125h5.938v5.938h-5.938zM47.031 43.125h5.938v5.938H47.03zM55.891 43.125h5.938v5.938H55.89zM64.746 43.125h5.938v5.938h-5.938zM29.316 52.203h5.938v5.938h-5.938zM38.176 52.203h5.938v5.938h-5.938zM47.031 52.203h5.938v5.938H47.03zM55.891 52.203h5.938v5.938H55.89zM64.746 52.203h5.938v5.938h-5.938zM29.316 61.281h5.938v5.938h-5.938zM38.176 61.281h5.938v5.938h-5.938zM47.031 61.281h5.938v5.938H47.03zM55.891 61.281h5.938v5.938H55.89zM64.746 61.281h5.938v5.938h-5.938zM29.316 70.359h5.938v5.938h-5.938zM38.176 70.359h5.938v5.938h-5.938zM47.031 70.359h5.938v5.938H47.03zM55.891 70.359h5.938v5.938H55.89zM64.746 70.359h5.938v5.938h-5.938zm0 0"
    />
  </Svg>
);
export default CalendarIcon;
