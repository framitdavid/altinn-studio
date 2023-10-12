import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimePicker } from './TimePicker';
import { TextfieldProps } from '@digdir/design-system-react';

const mockTimeString: string = '09:48';
const mockTimeStringNew: string = '10:48';

const mockOnChange = jest.fn();
const mockLabel: string = 'Test label';

const defaultProps: TextfieldProps = {
  value: mockTimeString,
  onChange: mockOnChange,
  label: mockLabel,
};

describe('TimePicker', () => {
  afterEach(jest.clearAllMocks);

  it('calls "onChange" when time is changed', () => {
    render(<TimePicker {...defaultProps} />);

    const input = screen.getByLabelText(mockLabel);
    expect(input).toHaveValue(mockTimeString);

    fireEvent.change(input, { target: { value: mockTimeStringNew } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
