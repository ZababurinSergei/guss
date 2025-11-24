import { Model, Optional } from 'sequelize';
export interface UserAttributes {
    id: string;
    username: string;
    password: string;
    role: 'user' | 'admin' | 'nikita';
    created_at: Date;
    updated_at: Date;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: string;
    username: string;
    password: string;
    role: 'user' | 'admin' | 'nikita';
    readonly created_at: Date;
    readonly updated_at: Date;
    validatePassword(password: string): Promise<boolean>;
    toJSON(): UserAttributes;
}
//# sourceMappingURL=User.d.ts.map