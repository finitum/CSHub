import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user";
import {Post} from "./post";
import {EditUser} from "./edituser";

@Entity({
    name: "edits"
})
export class Edit {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Post, post => post.id)
    @JoinColumn({name: "post"})
    @Index()
    post: Post;

    @OneToMany(type => EditUser, edituser => edituser.edit)
    editusers: EditUser[];

    @Column({
        type: "longtext"
    })
    content: string;

    @Column({
        default: false
    })
    approved: boolean;

    @ManyToOne(type => User, user => user.id, {
        nullable: true
    })
    @JoinColumn({name: "approvedBy"})
    approvedBy: User;

    @Column({
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP"
    })
    @Index()
    datetime: Date;

    @Column({
        type: "longtext",
        nullable: true
    })
    htmlContent: string;

    @Column({
        type: "longtext",
        nullable: true
    })
    indexwords: string;
}
