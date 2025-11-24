import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
export class Round extends Model {
    id;
    start_date;
    end_date;
    total_score;
    status;
    created_at;
    updated_at;
    isActive() {
        const now = new Date();
        return now >= this.start_date && now <= this.end_date;
    }
    determineStatus() {
        const now = new Date();
        if (now < this.dataValues.start_date) {
            return 'cooldown';
        }
        else if (now > this.dataValues.end_date) {
            return 'finished';
        }
        else {
            return 'active';
        }
    }
    async updateAndSaveStatus() {
        const newStatus = this.determineStatus();
        if (this.dataValues.status !== newStatus) {
            this.setDataValue('status', newStatus);
            await this.save();
            console.log('@@@@@@@@@@@@@ updateAndSaveStatus @@@@@@@@@@@@@@@', this.dataValues.status, newStatus);
        }
    }
}
Round.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total_score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('cooldown', 'active', 'finished'),
        allowNull: false,
        defaultValue: 'cooldown'
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
    tableName: 'rounds',
    underscored: true,
    hooks: {
        beforeSave: (round) => {
            round.status = round.determineStatus();
        }
    }
});
//# sourceMappingURL=Round.js.map