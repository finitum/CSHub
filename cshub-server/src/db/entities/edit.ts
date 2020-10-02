import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Post } from "./post";
import { IEdit } from "../../../../cshub-shared/src/entities/edit";

import Delta from "quill-delta";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity({
    name: "edits",
})
export class Edit implements IEdit {
    @Expose()
    @PrimaryGeneratedColumn()
    id!: number;

    @Expose()
    @ManyToMany((type) => User, (user) => user.edits)
    @JoinTable({ name: "editusers" })
    editusers!: User[];

    @Expose()
    @Column({
        type: "longtext",
    })
    content!: Delta;

    @Expose()
    @Column({
        type: "int", // Otherwise it overrides the value
        default: false,
    })
    approved!: boolean;

    @Expose()
    @Column({
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP",
    })
    @Index()
    datetime!: Date;

    @Expose()
    @Column({
        type: "longtext",
        nullable: true,
    })
    htmlContent!: string;

    // Not sent to client
    @ManyToOne((type) => Post, (post) => post.id)
    @JoinColumn({ name: "post" })
    @Index()
    post?: Post;

    @Column({
        type: "longtext",
        nullable: true,
    })
    indexwords?: string;
}
