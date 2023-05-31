import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { validationResult } from "express-validator";

import { registerValidation } from "./validations/auth.js";

import UserModel from "./models/User.js";
import checkAuth from "./utils/CheckAuth.js";

mongoose
.connect("mongodb+srv://ilidarka:root@cluster0.pchevmn.mongodb.net/blog?retryWrites=true&w=majority")
.then(() => {
    console.log("DB ok");
})
.catch((err) => {
    console.log("DB error", err);
});

const app = express();

app.use(express.json());

app.post("/auth/login", async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email });
        if(!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if(!isValidPass) {
            return res.status(400).json({
                message: "Wrong password or login",
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            "secret123",
            {
                expiresIn: "30d",
            },
        );

        const {passwordHash, ...userData} = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "auth failed",
        });
    }
});

app.post("/auth/register", registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }
    
        //Шифруем пароль
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
    
        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
        });
    
        const user = await doc.save();
    
        //генерируем токен и шифруем в него id пользователя
        const token = jwt.sign({
                _id: user._id,
            }, 
            "secret123",
            {
                expiresIn: "30d",
            }
        );

        const {passwordHash, ...userData} = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Register failed",
        });
    }
});

app.get("/auth/me", checkAuth, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);

        if(!user) {
            return res.status(404).json({
                message: "user not found",
            });
        }

        const {passwordHash, ...userData} = user._doc;

        res.json(userData);
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Access restricted",
        });
    }
});

app.listen(3000, (err) => {
    if(err) {
        return console.log(err);
    } 
    console.log("Server started");
});