import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Tasks from '../pages/Tasks';
import authReducer from '../store/slices/authSlice';
import taskReducer from '../store/slices/taskSlice';

const createMockStore = (authState = {}, taskState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      tasks: taskReducer,
    },
    preloadedState: {
      auth: {
        user: { id: '1', username: 'testuser' },
        token: 'mock-token',
        isLoading: false,
        error: null,
        isAuthenticated: true,
        ...authState,
      },
      tasks: {
        tasks: [],
        isLoading: false,
        error: null,
        ...taskState,
      },
    },
  });
};

const renderWithProviders = (ui: React.ReactElement, authState = {}, taskState = {}) => {
  const store = createMockStore(authState, taskState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>
    ),
    store,
  };
};

describe('Tasks Component', () => {
  it('renders tasks page with header', () => {
    renderWithProviders(<Tasks />);
    expect(screen.getByText(/task management/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome, testuser/i)).toBeInTheDocument();
  });

  it('shows create task button when no form is visible', () => {
    renderWithProviders(<Tasks />);
    expect(screen.getByRole('button', { name: /create new task/i })).toBeInTheDocument();
  });

  it('displays empty state when no tasks', () => {
    renderWithProviders(<Tasks />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('displays tasks list', () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Test Task 1',
        description: 'Description 1',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Test Task 2',
        description: null,
        status: 'completed' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    renderWithProviders(<Tasks />, {}, { tasks: mockTasks });
    expect(screen.getByText(/test task 1/i)).toBeInTheDocument();
    expect(screen.getByText(/test task 2/i)).toBeInTheDocument();
  });
});

