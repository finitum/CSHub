import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({
    name: "users"
})
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({
        type: "blob",
        nullable: true
    })
    avatar: string;

    @Column()
    admin: boolean;

    @Column({
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP"
    })
    created: Date;

    @Column()
    blocked: boolean;

    @Column()
    verified: boolean;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({
        nullable: true
    })
    verifyhash: number;

    @Column({
        nullable: true
    })
    passresethash: number;
}
