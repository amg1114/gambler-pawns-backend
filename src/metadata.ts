/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./auth/dto/auth.dto"), { "SignUpDto": { nickname: { required: true, type: () => String, minLength: 3, maxLength: 20 }, email: { required: true, type: () => String }, password: { required: true, type: () => String }, countryCode: { required: true, type: () => String } }, "LoginDto": { nickname: { required: false, type: () => String, minLength: 3, maxLength: 20 }, email: { required: false, type: () => String }, password: { required: true, type: () => String } } }]], "controllers": [[import("./auth/auth.controller"), { "AuthController": { "signUp": {}, "login": {} } }]] } };
};