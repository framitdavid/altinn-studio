import React from 'react';
import { SvgTemplate } from './SvgTemplate';
import type { IconProps } from '../types';

export const ReferenceIcon = (props: IconProps): JSX.Element => (
  <SvgTemplate viewBox='0 0 36 36' {...props}>
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='
        M 18.3981 17.6019
        C 17.4276 16.6313 15.854 16.6313 14.8834 17.6019
        L 9.44641 23.0389
        C 8.47585 24.0094 8.47585 25.583 9.44641 26.5536
        C 10.417 27.5242 11.9906 27.5242 12.9611 26.5536
        L 17.0389 22.4759
        L 18.9611 24.3981
        L 14.8834 28.4759
        C 12.8512 30.5081 9.55635 30.5081 7.52415 28.4759
        C 5.49195 26.4437 5.49195 23.1488 7.52415 21.1166
        L 12.9611 15.6796
        C 14.9933 13.6474 18.2882 13.6474 20.3204 15.6796
        L 21 16.3593
        L 19.0777 18.2815
        Z
      '
      fill='currentColor'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='
        M 21.1166 7.52415
        C 23.1488 5.49195 26.4437 5.49195 28.4759 7.52415
        C 30.508 9.55635 30.5081 12.8512 28.4759 14.8834
        L 23.0389 20.3204
        C 21.0067 22.3526 17.7118 22.3526 15.6796 20.3204
        L 15 19.6408
        L 16.9223 17.7185
        L 17.6019 18.3981
        C 18.5724 19.3687 20.146 19.3687 21.1166 18.3981
        L 26.5536 12.9611
        C 27.5242 11.9906 27.5241 10.417 26.5536 9.44641
        C 25.583 8.47585 24.0094 8.47585 23.0389 9.44641
        L 18.9611 13.5241
        L 17.0389 11.6019
        Z
      '
      fill='currentColor'
    />
  </SvgTemplate>
);
