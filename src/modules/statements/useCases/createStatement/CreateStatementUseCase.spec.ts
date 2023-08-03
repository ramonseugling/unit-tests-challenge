import "reflect-metadata";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { GetStatementOperationUseCase } from "../getStatementOperation/GetStatementOperationUseCase";
import { AppError } from "../../../../shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get statement operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create a statement with deposit type", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123",
    });

    if (!user.id) {
      throw new CreateStatementError.UserNotFound();
    }

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit Test",
    });

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toEqual(200);
  });

  it("should be able to create a statement with withdraw type", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123",
    });

    if (!user.id) {
      throw new CreateStatementError.UserNotFound();
    }

    await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit Test",
    });

    const withdrawStatement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdraw Test",
    });

    expect(withdrawStatement).toHaveProperty("id");
    expect(withdrawStatement.amount).toEqual(100);
  });

  it("should be able to throw an AppError if none user was found by an user_id", async () => {
    expect(async () => {
      const nonExistentUserId = "non_existent_user_id";

      await createStatementUseCase.execute({
        user_id: nonExistentUserId,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Withdraw Test",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to throw an AppError if statement is a withdraw and there is insufficient funds", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123",
      });

      if (!user.id) {
        throw new CreateStatementError.UserNotFound();
      }

      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 200,
        description: "Deposit Test",
      });

      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 300,
        description: "Withdraw Test",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
