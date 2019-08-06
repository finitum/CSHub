import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user";
import {Post} from "./post";
import {EditUser} from "./edituser";
import {IEdit} from "../../../../cshub-shared/src/entities/edit";

@Entity({
    name: "edits"
})
export class Edit implements IEdit {

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
        type: "int", // Otherwise it overrides the value
        default: false
    })
    approved: boolean;

    @ManyToOne(type => User, user => user.approvedEdits, {
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
