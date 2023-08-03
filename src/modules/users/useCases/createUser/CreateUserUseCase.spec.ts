import "reflect-metadata";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a new user with an existent email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123",
      });

      await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
