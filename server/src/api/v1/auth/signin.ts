import { set, z } from "zod";
import bycrpt from "bcrypt";
import database from "../../../database/db.js";
import { roles } from "../../../settings/global.js";
import { publicProcedure } from "../../../trpc.js";
import {
    setAccessToken,
    setRefreshToken,
} from "../../../middlewares/setToken.js";
import { valEmail, valPassword } from "../../../middlewares/validateInput.js";

const db = database.getDB();
const users = db.collection("users");

export const signin = publicProcedure
    .input(
        z.object({
            email: z.string(),
            password: z.string(),
        })
    )
    .query(async (opts) => {
        const { email, password } = opts.input;

        if (!email || !password) return null;
        if (!valEmail(email) || !valPassword(password)) return null;

        const user = await users.findOne({ email });
        if (!user) return null;
        if (!bycrpt.compareSync(password, user.password)) return null;

        const permissions = (
            roles.find((role) => role.role === user.role) || {}
        ).permissions;
        if (!permissions) return null;
        const tokenData = {
            id: user._id,
            permissions: permissions,
        };

        setAccessToken(tokenData, opts.ctx.res);
        setRefreshToken(tokenData.id, opts.ctx.res);

        return { message: "Signin successfully" };
    });
