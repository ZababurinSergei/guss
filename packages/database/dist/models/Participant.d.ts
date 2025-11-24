import { Model, Optional } from 'sequelize';
export interface ParticipantAttributes {
    id: string;
    user_id: string;
    round_id: string;
    tap_count: number;
    score: number;
    created_at: Date;
    updated_at: Date;
}
export interface ParticipantCreationAttributes extends Optional<ParticipantAttributes, 'id' | 'tap_count' | 'score' | 'created_at' | 'updated_at'> {
}
export declare class Participant extends Model<ParticipantAttributes, ParticipantCreationAttributes> implements ParticipantAttributes {
    id: string;
    user_id: string;
    round_id: string;
    tap_count: number;
    score: number;
    readonly created_at: Date;
    readonly updated_at: Date;
}
//# sourceMappingURL=Participant.d.ts.map