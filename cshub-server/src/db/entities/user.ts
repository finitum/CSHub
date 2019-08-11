import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./post";
import { Study } from "./study";
import { Edit } from "./edit";
import { IUser } from "../../../../cshub-shared/src/entities/user";
import { Question } from "./question";

@Entity({
    name: "users"
})
export class User implements IUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "text"
    })
    email!: string;

    @Column({
        type: "blob",
        nullable: true
    })
    avatar!: string;

    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    admin!: boolean;

    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    blocked!: boolean;

    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    verified!: boolean;

    @Column({
        type: "text"
    })
    firstname!: string;

    @Column({
        type: "text"
    })
    lastname!: string;

    @ManyToMany(type => Study, study => study.admins)
    studies!: Study[];

    // Not sent to client
    @Column({
        type: "text"
    })
    password!: string;

    @Column({
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP"
    })
    created!: Date;

    @Column({
        nullable: true
    })
    verifyhash?: number;

    @Column({
        nullable: true
    })
    passresethash?: number;

    // Just to make the model complete
    @ManyToMany(type => Edit, edit => edit.editusers)
    edits?: Edit[];

    @ManyToOne(type => Edit, edit => edit.approvedBy)
    approvedEdits?: Edit[];

    @ManyToOne(type => Question, question => question.approvedBy)
    approvedQuestions?: Edit[];
}
