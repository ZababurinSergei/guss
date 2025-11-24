import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface RoundAttributes {
    id: string;
    start_date: Date;
    end_date: Date;
    total_score: number;
    status: 'cooldown' | 'active' | 'finished';
    created_at: Date;
    updated_at: Date;
}

export interface RoundCreationAttributes extends Optional<RoundAttributes, 'id' | 'total_score' | 'status' | 'created_at' | 'updated_at'> {}

export class Round extends Model<RoundAttributes, RoundCreationAttributes> implements RoundAttributes {
    public id!: string;
    public start_date!: Date;
    public end_date!: Date;
    public total_score!: number;
    public status!: 'cooldown' | 'active' | 'finished';
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public isActive(): boolean {
        const now = new Date();
        return now >= this.start_date && now <= this.end_date;
    }

    // Обновленный метод для определения статуса
    public determineStatus(): 'cooldown' | 'active' | 'finished' {
        const now = new Date();

        if (now < this.dataValues.start_date) {
            return 'cooldown';
        } else if (now > this.dataValues.end_date) {
            return 'finished';
        } else {
            return 'active';
        }
    }

    // Метод для обновления и сохранения статуса
    public async updateAndSaveStatus(): Promise<void> {
        const newStatus = this.determineStatus();
        if (this.dataValues.status !== newStatus) {
            this.setDataValue('status', newStatus);
            await this.save();

            console.log('@@@@@@@@@@@@@ updateAndSaveStatus @@@@@@@@@@@@@@@', this.dataValues.status, newStatus)
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
        beforeSave: (round: Round) => {
            // Автоматически обновляем статус перед сохранением
            round.status = round.determineStatus();
        }
    }
});