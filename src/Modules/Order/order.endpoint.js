import { roles } from "../../Middleware/auth.middleware.js";

export const endpoint={
    create:[roles.User],
    cancel:[roles.User],
    changeStatusFromAdmin:[roles.Admin],
}