import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Round } from './Round';

export interface ParticipantAttributes {
    id: string;
    user_id: string;
    round_id: string;
    tap_count: number;
    score: number;
    created_at: Date;
    updated_at: Date;
}

export interface ParticipantCreationAttributes extends Optional<ParticipantAttributes, 'id' | 'tap_count' | 'score' | 'created_at' | 'updated_at'> {}

export class Participant extends Model<ParticipantAttributes, ParticipantCreationAttributes> implements ParticipantAttributes {
    public id!: string;
    public user_id!: string;
    public round_id!: string;
    public tap_count!: number;
    public score!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Participant.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    round_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'rounds',
            key: 'id'
        }
    },
    tap_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    tableName: 'participants',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'round_id']
        }
    ]
});

// Ассоциации
User.hasMany(Participant, { foreignKey: 'user_id' });
Participant.belongsTo(User, { foreignKey: 'user_id' });

Round.hasMany(Participant, { foreignKey: 'round_id' });
Participant.belongsTo(Round, { foreignKey: 'round_id' });