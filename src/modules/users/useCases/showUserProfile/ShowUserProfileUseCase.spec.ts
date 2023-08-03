import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show a user's profile", async () => {
    const { id } = await createUserUseCase.execute({
      name: "John Doe",
      email: "john.doe@test.com",
      password: "123456",
    });

    if (!id) {
      throw new ShowUserProfileError();
    }

    const list = await showUserProfileUseCase.execute(id);

    expect(list).toHaveProperty("id");
    expect(list.email).toEqual("john.doe@test.com");
  });

  it("should be able to throw an AppError if the searched user does not exists", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("non-existent-user");
    }).rejects.toBeInstanceOf(AppError);
  });
});
