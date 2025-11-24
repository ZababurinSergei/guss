import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/AuthService';
import { LoginRequest } from '../types';

export class AuthController {
    static async login(request: FastifyRequest, reply: FastifyReply) {
        try {
            const loginData = request.body as LoginRequest;

            if (!loginData.username || !loginData.password) {
                return reply.status(400).send({ error: 'Username and password are required' });
            }

            console.log('@@@@@@@@@@@@@@ ***rfe @@@@@@@@@@@@', loginData)
            const result = await AuthService.login(loginData);

            // Устанавливаем токен в куки
            reply.setCookie('token', result.token, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 // 7 дней
            });

            return reply.send(result);
        } catch (error) {
            console.error('Login error:', error);
            return reply.status(401).send({ error: 'Authentication failed' });
        }
    }

    static async logout(_request: FastifyRequest, reply: FastifyReply) {
        console.log('$$$$$$$$$ ----- !!! ----- $$$$$$$$$$$$$$$$$$$$$$$')
        reply.clearCookie('token');
        return reply.send({ message: 'Logged out successfully' });
    }

    static async getProfile(request: FastifyRequest, reply: FastifyReply) {
        return reply.send({ user: request.user });
    }
}