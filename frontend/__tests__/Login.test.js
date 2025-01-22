import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../src/components/Login';
import api from '../src/api/api';
import { BrowserRouter } from 'react-router-dom';

// Mockear la API
jest.mock('../src/api/api', () => ({
  post: jest.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza correctamente el formulario de login', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Verificar elementos básicos
    expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('actualiza los valores de los campos al escribir', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/nombre de usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    userEvent.type(usernameInput, 'usuarioPrueba');
    userEvent.type(passwordInput, 'contraseñaPrueba');

    expect(usernameInput).toHaveValue('usuarioPrueba');
    expect(passwordInput).toHaveValue('contraseñaPrueba');
  });

  it('muestra un mensaje de error si las credenciales son incorrectas', async () => {
    api.post.mockRejectedValueOnce(new Error('Credenciales inválidas'));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/nombre de usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    userEvent.type(usernameInput, 'usuarioInvalido');
    userEvent.type(passwordInput, 'contraseñaInvalida');

    fireEvent.click(submitButton);

    // Esperar al mensaje de error
    await screen.findByText(/credenciales inválidas\. inténtalo de nuevo\./i);
  });

  it('llama a la API correctamente con credenciales válidas', async () => {
    api.post.mockResolvedValueOnce({ data: { token: 'mockToken' } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/nombre de usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    userEvent.type(usernameInput, 'usuarioValido');
    userEvent.type(passwordInput, 'contraseñaValida');

    fireEvent.click(submitButton);

    // Verificar que se llama a la API con los datos correctos
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'usuarioValido',
        password: 'contraseñaValida',
      });
    });

    // Verificar almacenamiento del token
    expect(localStorage.getItem('token')).toBe('mockToken');
  });
});
