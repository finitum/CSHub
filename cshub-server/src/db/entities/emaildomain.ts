import { Exclude, Expose } from "class-transformer";
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { IEmailDomain } from "../../../../cshub-shared/src/entities/emaildomains";
import {User} from "./user";

@Exclude()
@Entity({
    name: "emaildomains"
})
export class EmailDomain implements IEmailDomain {
    @Expose()
    @PrimaryGeneratedColumn()
    id!: number;

    @Expose()
    @Column({
        type: "varchar",
        length: 64,
        unique: true
    })
    domain!: string;

    @OneToMany(type => User, user => user.domain)
    users?: User[];
}
