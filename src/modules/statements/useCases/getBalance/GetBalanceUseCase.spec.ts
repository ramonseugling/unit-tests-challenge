import "reflect-metadata";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { AppError } from "../../../../shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get user's balance", async () => {
    const { id } = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123",
    });

    if (!id) {
      throw new CreateStatementError.UserNotFound();
    }

    await createStatementUseCase.execute({
      user_id: id,
      type: OperationType.DEPOSIT,
      amount: 200.5,
      description: "Deposit Test",
    });

    await createStatementUseCase.execute({
      user_id: id,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdraw Test",
    });

    const balance = await getBalanceUseCase.execute({ user_id: id });

    expect(balance).toHaveProperty("balance");
    expect(balance.balance).toEqual(100.5);
  });

  it("should be able to throw an AppError if none user was found by an user_id ", async () => {
    expect(async () => {
      const { id } = await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123",
      });

      if (!id) {
        throw new CreateStatementError.UserNotFound();
      }

      await createStatementUseCase.execute({
        user_id: id,
        type: OperationType.DEPOSIT,
        amount: 200.5,
        description: "Deposit",
      });

      await createStatementUseCase.execute({
        user_id: id,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Withdraw",
      });

      const nonExistentUserId = "non_existent_user_id";

      await getBalanceUseCase.execute({ user_id: nonExistentUserId });
    }).rejects.toBeInstanceOf(AppError);
  });
});
