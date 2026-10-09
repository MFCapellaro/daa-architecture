import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'dealer' | 'participante';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_desarrollo';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }

    // AQUÍ: Conecta con tu base de datos o consulta de usuarios
    // const user = await findUserByEmail(email);
    
    // Ejemplo estructurado para ilustrar la validación:
    /*
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    */

    // Supongamos que recuperamos el usuario con su rol:
    const mockUser = {
      id: 'usr_123',
      name: 'Usuario Ejemplo',
      email,
      role: (req.body.role || 'participante') as UserRole, // 'admin' | 'dealer' | 'participante'
    };

    // Firmar JWT con el rol
    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, role: mockUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: mockUser,
    });
  } catch (error) {
    console.error('Error en AuthControllers.login:', error);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
};

export const getMe = async (req: Request & { user?: any }, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  return res.status(200).json({ user: req.user });
};