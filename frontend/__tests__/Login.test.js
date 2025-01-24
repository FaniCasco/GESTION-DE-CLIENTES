import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../src/components/Login';
import api from '../src/api/api';
import { BrowserRouter } from 'react-router-dom';

// Mockear la API
jest.mock('../src/api/api'); 


beforeEach(() => {
  api.post.mockResolvedValue({ data: { success: true } });
});

it('llama a la API correctamente con credenciales válidas', async () => {
  const usernameInput = screen.getByLabelText(/nombre de usuario/i);
  const passwordInput = screen.getByLabelText(/contraseña/i);

  userEvent.type(usernameInput, 'usuarioValido');
  userEvent.type(passwordInput, 'contraseñaValida');

  const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
  userEvent.click(submitButton);

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      username: 'usuarioValido',
      password: 'contraseñaValida',
    });
  });
});




describe('Login Component', () => {
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

  it('actualiza los valores de los campos al escribir', async () => {
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
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Credenciales inválidas. Inténtalo de nuevo.' } },
    });
    

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/nombre de usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    userEvent.type(usernameInput, 'usuarioIncorrecto');
    userEvent.type(passwordInput, 'contraseñaIncorrecta');
    userEvent.click(submitButton);

    // Esperar al mensaje de error
    const errorMessage = await screen.findByText(/credenciales inválidas\. inténtalo de nuevo\./i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('llama a la API correctamente con credenciales válidas', async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });


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
    userEvent.click(submitButton);

    // Verificar que se llama a la API con los datos correctos
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'usuarioValido',
        password: 'contraseñaValida',
      });
    });
  });
});
