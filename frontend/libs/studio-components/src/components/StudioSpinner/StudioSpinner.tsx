import React, { forwardRef, useId, type HTMLAttributes } from 'react';
import { Paragraph, Spinner, type SpinnerProps } from '@digdir/design-system-react';
import classes from './StudioSpinner.module.css';

export type StudioSpinnerProps = {
  spinnerTitle: string;
  showSpinnerTitle?: boolean;
  size?: SpinnerProps['size'];
  variant?: SpinnerProps['variant'];
} & HTMLAttributes<HTMLDivElement>;

export const StudioSpinner = forwardRef<HTMLDivElement, StudioSpinnerProps>(
  (
    { spinnerTitle, showSpinnerTitle = false, size = 'medium', variant = 'interaction', ...rest },
    ref,
  ): JSX.Element => {
    const spinnerDescriptionId = useId();

    return (
      <div className={classes.spinnerWrapper} ref={ref} {...rest}>
        <Spinner
          title={!showSpinnerTitle && spinnerTitle}
          size={size}
          variant={variant}
          aria-describedby={showSpinnerTitle ? spinnerDescriptionId : null}
          data-testid='studio-spinner-test-id'
        />
        {showSpinnerTitle && <Paragraph id={spinnerDescriptionId}>{spinnerTitle}</Paragraph>}
      </div>
    );
  },
);

StudioSpinner.displayName = 'StudioSpinner';
