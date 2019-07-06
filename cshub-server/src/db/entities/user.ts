import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Post} from "./post";
import {EditUser} from "./edituser";

@Entity({
    name: "users"
})
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "text"
    })
    email: string;

    @Column({
        type: "text"
    })
    password: string;

    @Column({
        type: "blob",
        nullable: true
    })
    avatar: string;

    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    admin: boolean;

    @Column({
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP"
    })
    created: Date;

    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    blocked: boolean;

    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    verified: boolean;

    @Column({
        type: "text"
    })
    firstname: string;

    @Column({
        type: "text"
    })
    lastname: string;

    @Column({
        nullable: true
    })
    verifyhash: number;

    @Column({
        nullable: true
    })
    passresethash: number;

    @OneToMany(type => Post, post => post.author)
    posts: Post[];

    @OneToMany(type => EditUser, edituser => edituser.user)
    edits: EditUser[];
}
