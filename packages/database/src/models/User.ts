// /11/backend/src/models/User.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
    id: string;
    username: string;
    password: string;
    role: 'user' | 'admin' | 'nikita';
    created_at: Date;
    updated_at: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    // Используем declare для полей модели
    declare id: string;
    declare username: string;
    declare password: string;
    declare role: 'user' | 'admin' | 'nikita';
    declare readonly created_at: Date;
    declare readonly updated_at: Date;

    // Метод для проверки пароля
    public async validatePassword(password: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (error) {
            console.error('Password validation error:', error);
            return false;
        }
    }

    // Переопределяем toJSON с модификатором override
    public override toJSON(): UserAttributes {
        const values = super.toJSON() as UserAttributes;
        return {
            id: values.id,
            username: values.username,
            password: values.password,
            role: values.role,
            created_at: values.created_at,
            updated_at: values.updated_at
        };
    }
}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 50]
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 255]
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'nikita'),
        allowNull: false,
        defaultValue: 'user'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    tableName: 'users',
    underscored: true,
    hooks: {
        beforeCreate: async (user: User) => {
            const username = user.getDataValue('username').toLowerCase();

            console.log('@@@@@@@@@@@@@ username @@@@@@@@@@@@', username)
            // Определяем роль по имени пользователя
            if (username === 'admin') {
                user.setDataValue('role', 'admin');
            } else if (username === 'никита') {
                user.setDataValue('role', 'nikita');
            }

            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(user.getDataValue('password'), 12);
            user.setDataValue('password', hashedPassword);
        },
        beforeUpdate: async (user: User) => {
            if (user.changed('password')) {
                const hashedPassword = await bcrypt.hash(user.getDataValue('password'), 12);
                user.setDataValue('password', hashedPassword);
            }
        }
    }
});