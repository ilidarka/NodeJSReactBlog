import { body} from "express-validator";

export const registerValidation = [
    body("email", "Incorrect email format").isEmail(),
    body("password", "Password is not long enough").isLength({min: 5}),
    body("fullName", "Full name must be min 3 symbols length").isLength({min: 3}),
    body("avatarUrl", "Wrong avatar link").optional().isURL(),
];