import database from "@infra/database.js";
import password from "models/password.js";
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

async function findOneByEmail(email) {
  return await runSelectQuery(email);

  async function runSelectQuery(email) {
    const result = await database.query({
      text: `
        SELECT
              *
        FROM
              users
        WHERE 
            lower(email) = lower($1)
        LIMIT 
            1
              ;`,
      values: [email],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não encontrado.",
        action: "Verifique se email informado foi digitado corretamente.",
      });
    }

    return result.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);
  return await insertUser(userInputValues);

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

async function updateByUsername(username, userPatchData) {
  const currentUser = await findOneByUsername(username);
  if (
    "username" in userPatchData &&
    !compareCaseInsensitive(username, userPatchData.username)
  ) {
    await validateUniqueUsername(userPatchData.username);
  }
  if ("email" in userPatchData) {
    await validateEmail(userPatchData.email);
  }

  if ("password" in userPatchData) {
    await hashPasswordInObject(userPatchData);
  }

  const updatedUser = {
    ...currentUser,
    ...userPatchData,
  };

  const result = await database.query({
    text: `
      UPDATE 
        users 
      SET
        username=$2,
        email=$3,
        password=$4,
        updated_at=timezone('utc', now())
      WHERE 
          id = $1
      RETURNING
          *
      ;`,
    values: [
      updatedUser.id,
      updatedUser.username,
      updatedUser.email,
      updatedUser.password,
    ],
  });

  return result.rows[0];

  function compareCaseInsensitive(a, b) {
    return a.toLowerCase() === b.toLowerCase();
  }
}

async function validateUniqueUsername(username) {
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
      action: "Use um username diferente para essa ação.",
    });
  }
}

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
      action: "Use um email diferente para essa ação.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  userInputValues.password = await password.hash(userInputValues.password);
}

const user = {
  create,
  findOneByUsername,
  updateByUsername,
  findOneByEmail,
};

export default user;
