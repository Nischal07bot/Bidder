import { hashPassword } from "../utils/password.js";
import { CreateUserdata, UserRecord } from "../repositories/userRepositories.js";
import { userRepository } from "../repositories/userRepositories.js";

//so now here i need to register users as well with a  hashed password 

export  async function registerUser(input: CreateUserdata): Promise<UserRecord> {
    //now the function calling this function should put an await since here we are returning a promise and we need to wait for the promise to resolve before we can return the result to the caller
    const hashedPassword=await hashPassword(input.password);
    const result= await userRepository.createUser({
        email:input.email,
        username:input.username,
        password:hashedPassword
    })
    return result;
}