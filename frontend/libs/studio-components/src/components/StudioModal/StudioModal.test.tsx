import React, { ReactNode, createRef, useRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudioModal, StudioModalProps } from './StudioModal';
import { textMock } from '../../../../../testing/mocks/i18nMock';

const MockHeader: ReactNode = (
  <div>
    <h2>Title</h2>
  </div>
);

const MockContent: ReactNode = (
  <div>
    <p>Modal test</p>
  </div>
);

const mockOnClose = jest.fn();

const defaultProps: StudioModalProps = {
  onClose: mockOnClose,
  header: MockHeader,
  content: MockContent,
};

describe('StudioModal', () => {
  afterEach(jest.clearAllMocks);

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<StudioModal {...defaultProps} />);

    const closeButton = screen.getByRole('button'); //, { name: 'close' });
    await act(() => user.click(closeButton));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not show content when modal is closed', () => {
    render(<StudioModal {...defaultProps} ref={undefined} />);

    const closeButton = screen.queryByRole('button', { name: textMock('modal.close_icon') });
    expect(closeButton).not.toBeInTheDocument();
  });

  it('shows the header and content components correctly', async () => {
    const ref = createRef<HTMLDialogElement>();
    render(<StudioModal ref={ref} {...defaultProps} />);
  });

  it('does not show the footer when it is not present', () => {});
});

/*
const mockRef = createRef<HTMLDialogElement>();

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: () => mockRef,
}));

const test = () => {
  render(
    <>
      <button onClick={() => mockRef.current?.showModal()}>Button</button>
      <StudioModal ref={mockRef} {...defaultProps} />
    </>,
  );
};
*/
