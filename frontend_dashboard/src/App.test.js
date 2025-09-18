import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Recruitment Dashboard header', () => {
  render(<App />);
  const header = screen.getByText(/Recruitment Dashboard/i);
  expect(header).toBeInTheDocument();
});
