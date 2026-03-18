import user from "@models/user";
import { NotFoundError, UnauthorizedError } from "@infra/errors";
import passwordModel from "@models/password";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const userRecord = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, userRecord.password);
    return userRecord;
  } catch (e) {
    if (e instanceof UnauthorizedError)
      throw new UnauthorizedError({
        message: "Dados de autenticação incorretos.",
        action: "Verifique os dados de autenticação e tente novamente.",
      });
    throw e;
  }

  async function findUserByEmail(email) {
    let userRecord;
    try {
      userRecord = await user.findOneByEmail(email);
    } catch (e) {
      if (e instanceof NotFoundError)
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se esse dado está correto.",
        });
      throw e;
    }
    return userRecord;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const passwordMatch = await passwordModel.compare(
      providedPassword,
      storedPassword,
    );
    if (!passwordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se esse dado está correto.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
