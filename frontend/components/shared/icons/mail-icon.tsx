import Svg, { Path, SvgProps } from 'react-native-svg';

const MailIcon = (props: SvgProps) => (
  <Svg width='24' height='24' viewBox='0 0 24 24' fill='none' {...props}>
    <Path
      d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'
      stroke='currentColor'
      strokeWidth='1'
      fill='none'
    />
    <Path
      d='m22 6-10 7L2 6'
      stroke='currentColor'
      strokeWidth='1.5'
      fill='none'
    />
  </Svg>
);

export default MailIcon;
