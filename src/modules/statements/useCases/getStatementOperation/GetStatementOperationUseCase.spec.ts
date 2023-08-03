import "reflect-metadata";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
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

  it("should be able to get a statement operation by id", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123",
    });

    if (!user.id) {
      throw new GetStatementOperationError.UserNotFound();
    }

    const { id } = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 200.5,
      description: "Deposit Test",
    });

    if (!id) {
      throw new GetStatementOperationError.StatementNotFound();
    }

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: id,
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation.amount).toEqual(200.5);
  });

  it("should be able to throw an AppError if none user was found by an user_id ", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123",
      });

      if (!user.id) {
        throw new GetStatementOperationError.UserNotFound();
      }

      const { id } = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 200.5,
        description: "Deposit Test",
      });

      if (!id) {
        throw new GetStatementOperationError.StatementNotFound();
      }

      const nonExistentUserId = "non_existent_user_id";

      await getStatementOperationUseCase.execute({
        user_id: nonExistentUserId,
        statement_id: id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
