import { Model, Optional } from 'sequelize';
export interface RoundAttributes {
    id: string;
    start_date: Date;
    end_date: Date;
    total_score: number;
    status: 'cooldown' | 'active' | 'finished';
    created_at: Date;
    updated_at: Date;
}
export interface RoundCreationAttributes extends Optional<RoundAttributes, 'id' | 'total_score' | 'status' | 'created_at' | 'updated_at'> {
}
export declare class Round extends Model<RoundAttributes, RoundCreationAttributes> implements RoundAttributes {
    id: string;
    start_date: Date;
    end_date: Date;
    total_score: number;
    status: 'cooldown' | 'active' | 'finished';
    readonly created_at: Date;
    readonly updated_at: Date;
    isActive(): boolean;
    determineStatus(): 'cooldown' | 'active' | 'finished';
    updateAndSaveStatus(): Promise<void>;
}
//# sourceMappingURL=Round.d.ts.map