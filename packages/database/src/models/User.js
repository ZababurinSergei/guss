import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';
export class User extends Model {
    async validatePassword(password) {
        try {
            return await bcrypt.compare(password, this.password);
        }
        catch (error) {
            console.error('Password validation error:', error);
            return false;
        }
    }
    toJSON() {
        const values = super.toJSON();
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
        beforeCreate: async (user) => {
            const username = user.getDataValue('username').toLowerCase();
            console.log('@@@@@@@@@@@@@ username @@@@@@@@@@@@', username);
            if (username === 'admin') {
                user.setDataValue('role', 'admin');
            }
            else if (username === 'никита') {
                user.setDataValue('role', 'nikita');
            }
            const hashedPassword = await bcrypt.hash(user.getDataValue('password'), 12);
            user.setDataValue('password', hashedPassword);
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const hashedPassword = await bcrypt.hash(user.getDataValue('password'), 12);
                user.setDataValue('password', hashedPassword);
            }
        }
    }
});
