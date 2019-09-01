import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId
} from "typeorm";
import { Study } from "./study";
import { Edit } from "./edit";
import { IUser } from "../../../../cshub-shared/src/entities/user";
import { Question } from "./practice/question";
import { Exclude, Expose } from "class-transformer";
import {EmailDomain} from "./emaildomain";
import {Topic} from "./topic";

@Exclude()
@Entity({
    name: "users"
})
export class User implements IUser {
    @Expose()
    @PrimaryGeneratedColumn()
    id!: number;

    @Expose()
    @Column({
        type: "text"
    })
    email!: string;

    @Expose()
    @Column({
        type: "blob",
        nullable: true
    })
    avatar!: string;

    @Expose()
    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    admin!: boolean;

    @Expose()
    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    blocked!: boolean;

    @Expose()
    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    verified!: boolean;

    @Expose()
    @Column({
        type: "text"
    })
    firstname!: string;

    @Expose()
    @Column({
        type: "text"
    })
    lastname!: string;

    @Expose()
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

    @Expose()
    @ManyToOne(type => EmailDomain, domain => domain.users, {
        nullable: false
    })
    @JoinColumn()
    domain!: EmailDomain;

    @RelationId((user: User) => user.domain)
    domainId!: number;
}
