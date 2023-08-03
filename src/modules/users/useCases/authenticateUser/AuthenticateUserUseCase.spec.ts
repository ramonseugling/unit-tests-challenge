import "reflect-metadata";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to authenticate a user and return a token", async () => {
    await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123",
    });

    const userAndToken = await authenticateUserUseCase.execute({
      email: "johndoe@example.com",
      password: "123",
    });

    expect(userAndToken).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-existent user", async () => {
    expect(async () => {
      const user = {
        email: "non-existent-user@example.com",
        password: "123",
      };

      await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate a user with wrong credentials", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123",
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
