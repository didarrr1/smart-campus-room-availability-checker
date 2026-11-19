// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import App from '@/App';
import { MAX_DURATION } from '@/domain/availability';

it('keeps the shown result tied to the room that was checked', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /Seminar Room 12/ }));
  fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '11:00' } });
  fireEvent.change(screen.getByLabelText('End time'), { target: { value: '12:00' } });
  fireEvent.change(screen.getByLabelText('Current time'), { target: { value: '09:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Check Availability' }));

  expect(screen.getByText('Seminar Room 12 — Available')).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: /Computer Lab 3/ }));

  expect(screen.queryByText('Computer Lab 3 — Available')).toBeNull();
});

afterEach(() => {
  cleanup();
});

it('shows the maximum booking duration from the domain rule', () => {
  render(<App />);

  expect(screen.getByText(`Max booking duration is ${MAX_DURATION} minutes`, { exact: false })).toBeTruthy();
});

it('hides rooms that are too small for the attendee count', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText('Attendees'), { target: { value: '50' } });

  expect(screen.queryByRole('button', { name: /Seminar Room 12/ })).toBeNull();
  expect(screen.getByRole('button', { name: /Lecture Hall A/ })).toBeTruthy();
});

it('shows an empty-state message when no room matches the requirements', () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText('Attendees'), { target: { value: '1000' } });

  expect(
    screen.getByText('No rooms match your requirements. Lower the number of attendees or remove some equipment.'),
  ).toBeTruthy();
});

it('clears the result and selection when a filter hides the checked room', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /Seminar Room 12/ }));
  fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '11:00' } });
  fireEvent.change(screen.getByLabelText('End time'), { target: { value: '12:00' } });
  fireEvent.change(screen.getByLabelText('Current time'), { target: { value: '09:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Check Availability' }));

  expect(screen.getByText('Seminar Room 12 — Available')).toBeTruthy();

  fireEvent.click(screen.getByLabelText('computers'));

  expect(screen.queryByRole('button', { name: /Seminar Room 12/ })).toBeNull();
  expect(screen.queryByText('Seminar Room 12 — Available')).toBeNull();
});

it('keeps the decision text unchanged after asking for an explanation', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /Seminar Room 12/ }));
  fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '11:00' } });
  fireEvent.change(screen.getByLabelText('End time'), { target: { value: '12:00' } });
  fireEvent.change(screen.getByLabelText('Current time'), { target: { value: '09:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Check Availability' }));

  expect(screen.getByText('Seminar Room 12 — Available')).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Explain availability' }));

  expect(await screen.findByRole('status')).toBeTruthy();
  expect(screen.getByText('Seminar Room 12 — Available')).toBeTruthy();
});

it('clears the explanation whenever the result is cleared', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /Seminar Room 12/ }));
  fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '11:00' } });
  fireEvent.change(screen.getByLabelText('End time'), { target: { value: '12:00' } });
  fireEvent.change(screen.getByLabelText('Current time'), { target: { value: '09:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Check Availability' }));
  fireEvent.click(screen.getByRole('button', { name: 'Explain availability' }));

  expect(await screen.findByRole('status')).toBeTruthy();

  fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '11:30' } });

  expect(screen.queryByRole('status')).toBeNull();
});

it('shows a validation error and no explanation box for an over-long question', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /Seminar Room 12/ }));
  fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '11:00' } });
  fireEvent.change(screen.getByLabelText('End time'), { target: { value: '12:00' } });
  fireEvent.change(screen.getByLabelText('Current time'), { target: { value: '09:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Check Availability' }));

  expect(screen.getByText('Seminar Room 12 — Available')).toBeTruthy();

  fireEvent.change(screen.getByLabelText('Your question (optional)'), {
    target: { value: 'x'.repeat(201) },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Explain availability' }));

  expect(await screen.findByText('Question must be at most 200 characters.')).toBeTruthy();
  expect(screen.queryByRole('status')).toBeNull();
});

it('sends the typed question to the explain service', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /Seminar Room 12/ }));
  fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '11:00' } });
  fireEvent.change(screen.getByLabelText('End time'), { target: { value: '12:00' } });
  fireEvent.change(screen.getByLabelText('Current time'), { target: { value: '09:00' } });
  fireEvent.click(screen.getByRole('button', { name: 'Check Availability' }));

  fireEvent.change(screen.getByLabelText('Your question (optional)'), {
    target: { value: 'Can I use it for a club meeting?' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Explain availability' }));

  expect(await screen.findByRole('status')).toBeTruthy();
  expect(screen.getByText('AI explanation (mock) — not a booking confirmation')).toBeTruthy();
});
