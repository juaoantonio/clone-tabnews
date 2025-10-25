import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "@models/user";

const router = createRouter();
router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const username = req.query.username;
  const result = await user.findOneByUsername(username);
  return res.status(200).json(result);
}

async function patchHandler(req, res) {
  const username = req.query.username;
  const userPatchData = req.body;
  const result = await user.updateByUsername(username, userPatchData);
  return res.status(200).json(result);
}
