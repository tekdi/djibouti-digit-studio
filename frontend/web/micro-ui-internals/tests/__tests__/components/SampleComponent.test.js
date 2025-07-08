import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Sample component for testing
const SampleComponent = ({ title = 'Default Title', onClick }) => {
    const [count, setCount] = React.useState(0);

    return (
        <div>
            <h1>{title}</h1>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
            {onClick && (
                <button onClick={onClick} data-testid="custom-button">
                    Custom Action
                </button>
            )}
        </div>
    );
};

describe('SampleComponent', () => {
    test('renders with default title', () => {
        render(<SampleComponent />);

        expect(screen.getByText('Default Title')).toBeInTheDocument();
        expect(screen.getByText('Count: 0')).toBeInTheDocument();
    });

    test('renders with custom title', () => {
        render(<SampleComponent title="Custom Title" />);

        expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    test('increments count when button is clicked', () => {
        render(<SampleComponent />);

        const incrementButton = screen.getByText('Increment');

        expect(screen.getByText('Count: 0')).toBeInTheDocument();

        fireEvent.click(incrementButton);
        expect(screen.getByText('Count: 1')).toBeInTheDocument();

        fireEvent.click(incrementButton);
        expect(screen.getByText('Count: 2')).toBeInTheDocument();
    });

    test('calls onClick handler when custom button is clicked', () => {
        const mockOnClick = jest.fn();
        render(<SampleComponent onClick={mockOnClick} />);

        const customButton = screen.getByTestId('custom-button');
        fireEvent.click(customButton);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test('does not render custom button when onClick is not provided', () => {
        render(<SampleComponent />);

        expect(screen.queryByTestId('custom-button')).not.toBeInTheDocument();
    });
}); 