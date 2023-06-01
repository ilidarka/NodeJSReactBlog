import { body} from "express-validator";

export const loginValidation = [
    body("email", "Incorrect email format").isEmail(),
    body("password", "Password is not long enough").isLength({min: 5}),
];

export const registerValidation = [
    body("email", "Incorrect email format").isEmail(),
    body("password", "Password is not long enough").isLength({min: 5}),
    body("fullName", "Full name must be min 3 symbols length").isLength({min: 3}),
    body("avatarUrl", "Wrong avatar link").optional().isURL(),
];

export const postCreateValidation = [
    body("title", "Write post login").isLength({min: 3}).isString(),
    body("text", "Write post text").isLength({min: 3}).isString(),
    body("tags", "Wrong tag's format").optional().isString(),
    body("imageUrl", "Wrong avatar link").optional().isString(),
];