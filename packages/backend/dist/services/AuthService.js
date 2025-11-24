import jwt from 'jsonwebtoken';
import { User } from 'the-last-of-guss-database';
export class AuthService {
    static JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
    static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    static async login(loginData) {
        const { username, password } = loginData;
        const user = await User.findOne({ where: { username } });
        if (!user) {
            console.log('------------- СОЗДАЕМ НОВОГО ПОЛЬЗОВАТЕЛЯ -------------');
            const newUser = await User.create({
                username,
                password,
                role: 'user'
            });
            const token = this.generateToken(newUser);
            return {
                user: this.sanitizeUser(newUser.toJSON()),
                token
            };
        }
        console.log('🔐 Validating password for user:', user.username);
        let isValidPassword = false;
        try {
            isValidPassword = await user.validatePassword(password);
        }
        catch (error) {
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
    static async validateToken(token) {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET);
            if (!decoded.id || !decoded.username) {
                throw new Error('Invalid token payload');
            }
            return decoded;
        }
        catch (error) {
            console.error('Token validation error:', error);
            throw new Error('Invalid token');
        }
    }
    static generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN
        });
    }
    static sanitizeUser(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    static async getUserById(userId) {
        try {
            const user = await User.findByPk(userId, {
                attributes: ['id', 'username', 'role', 'created_at']
            });
            return user;
        }
        catch (error) {
            console.error('Error getting user by ID:', error);
            return null;
        }
    }
}
