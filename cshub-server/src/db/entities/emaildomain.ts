import { Exclude, Expose } from "class-transformer";
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import { IEmailDomain } from "../../../../cshub-shared/src/entities/emaildomains";

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
}
