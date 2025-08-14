import database from "@infra/database";
import { NotFoundError, ValidationError } from "@infra/errors";

async function findOneByUsername(username) {
  return await runSelectQuery(username);

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
        SELECT
              *
        FROM
              users
        WHERE 
            lower(username) = lower($1)
        LIMIT 
            1
              ;`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado.",
        action: "Verifique se username informado foi digitado corretamente.",
      });
    }

    return result.rows[0];
  }
}

async function create(userInputValues) {
  await validateEmail(userInputValues.email);
  await validateUsername(userInputValues.username);
  return await insertUser(userInputValues);

  async function validateEmail(email) {
    const result = await database.query({
      text: `
        SELECT
              email
        FROM
              users
        WHERE 
            lower(email) = lower($1)
              ;`,
      values: [email],
    });
    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "Esse email já está cadastrado.",
        action: "Use um email diferente no cadastro.",
      });
    }
  }

  async function validateUsername(username) {
    const result = await database.query({
      text: `
        SELECT
              username
        FROM
              users
        WHERE 
            lower(username) = lower($1)
              ;`,
      values: [username],
    });
    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "Esse username já está cadastrado.",
        action: "Use um username diferente no cadastro.",
      });
    }
  }

  async function insertUser(userInputValues) {
    const result = await database.query({
      text: `INSERT INTO
          users (username, email, password) 
      VALUES 
          ($1, $2, $3)
      RETURNING 
          *
      ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
