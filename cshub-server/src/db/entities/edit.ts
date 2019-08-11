import {
    Column,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./user";
import {Post} from "./post";
import {IEdit} from "../../../../cshub-shared/src/entities/edit";

// @ts-ignore
import Delta from "quill-delta";

@Entity({
    name: "edits"
})
export class Edit implements IEdit {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToMany(type => User, user => user.edits)
    @JoinTable({name: "editusers"})
    editusers!: User[];

    @Column({
        type: "longtext"
    })
    content!: Delta;

    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    approved!: boolean;

    @Column({
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP"
    })
    @Index()
    datetime!: Date;

    @Column({
        type: "longtext",
        nullable: true
    })
    htmlContent!: string;

    // Not sent to client
    @ManyToOne(type => Post, post => post.id)
    @JoinColumn({name: "post"})
    @Index()
    post?: Post;

    @Column({
        type: "longtext",
        nullable: true
    })
    indexwords?: string;

    // Just for statistics
    @ManyToOne(type => User, user => user.approvedEdits, {
        nullable: true
    })
    @JoinColumn({name: "approvedBy"})
    approvedBy?: User;
}
