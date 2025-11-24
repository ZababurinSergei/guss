import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './User.js';
import { Round } from './Round.js';
export class Participant extends Model {
    id;
    user_id;
    round_id;
    tap_count;
    score;
    created_at;
    updated_at;
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
User.hasMany(Participant, { foreignKey: 'user_id' });
Participant.belongsTo(User, { foreignKey: 'user_id' });
Round.hasMany(Participant, { foreignKey: 'round_id' });
Participant.belongsTo(Round, { foreignKey: 'round_id' });
//# sourceMappingURL=Participant.js.map