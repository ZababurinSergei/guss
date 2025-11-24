import jwt from 'jsonwebtoken';
import { AuthUser, LoginRequest, LoginResponse } from '../types';
import { User, UserAttributes } from 'the-last-of-guss-database';

export class AuthService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
    private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

    static async login(loginData: LoginRequest): Promise<LoginResponse> {
        const { username, password } = loginData;

        // Находим пользователя как экземпляр модели
        const user = await User.findOne({ where: { username } });

        if (!user) {
            console.log('------------- СОЗДАЕМ НОВОГО ПОЛЬЗОВАТЕЛЯ -------------');

            // Создаем нового пользователя
            const newUser = await User.create({
                username,
                password,
                role: 'user'
            } as any);

            const token = this.generateToken(newUser);

            return {
                user: this.sanitizeUser(newUser.toJSON()),
                token
            };
        }

        // Проверяем пароль существующего пользователя
        console.log('🔐 Validating password for user:', user.username);

        // Используем метод validatePassword экземпляра User
        let isValidPassword = false;
        try {
            isValidPassword = await user.validatePassword(password);
        } catch (error) {
            console.error('Password validation error:', error);
            throw new Error('Authentication failed');
        }

        if (!isValidPassword) {
            throw new Error('Invalid password');
        }

        const token = this.generateToken(user);

        console.log('✅ Login successful for user:', user.username);

        return {
            user: this.sanitizeUser(user.toJSON()),
            token
        };
    }

    static async validateToken(token: string): Promise<AuthUser> {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as AuthUser;

            // Проверяем что есть необходимые поля
            if (!decoded.id || !decoded.username) {
                throw new Error('Invalid token payload');
            }

            return decoded;
        } catch (error) {
            console.error('Token validation error:', error);
            throw new Error('Invalid token');
        }
    }

    private static generateToken(user: User): string {
        const payload: AuthUser = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN
        } as jwt.SignOptions);
    }

    private static sanitizeUser(user: UserAttributes): Omit<UserAttributes, 'password'> {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async getUserById(userId: string): Promise<User | null> {
        try {
            const user = await User.findByPk(userId, {
                attributes: ['id', 'username', 'role', 'created_at']
            });
            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            return null;
        }
    }
}