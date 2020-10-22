import { Application } from "express";

import { registerChangeAvatarEndpoint } from "./ChangeAvatar";
import { registerChangePasswordEndpoint } from "./ChangePassword";
import { registerCreateAccountEndpoint } from "./CreateAccount";
import { registerForgotPasswordEndpoint } from "./ForgotPassword";
import { registerForgotPasswordMail } from "./ForgotPasswordMail";
import { registerAllUsersEndpoint } from "./AllUsers";
import { registerLoginEndpoints } from "./Login";
import { registerProfileEndpoint } from "./Profile";
import { registerVerifyMailEndpoint } from "./VerifyMail";
import { registerVerifyTokenEndpoint } from "./VerifyToken";
import { registerUserAdminEndpoints } from "./UserAdminPage";

export function registerUserEndpoints(app: Application): void {
    registerChangeAvatarEndpoint(app);
    registerChangePasswordEndpoint(app);
    registerCreateAccountEndpoint(app);
    registerForgotPasswordEndpoint(app);
    registerForgotPasswordMail(app);
    registerAllUsersEndpoint(app);
    registerLoginEndpoints(app);
    registerProfileEndpoint(app);
    registerVerifyMailEndpoint(app);
    registerVerifyTokenEndpoint(app);
    registerUserAdminEndpoints(app);
}
