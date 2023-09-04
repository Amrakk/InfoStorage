import { TRPCError } from "@trpc/server";
import database from "../../../database/db.js";
import { adminProcedure } from "../../../trpc.js";
import IUser from "../../../interfaces/collections/user.js";

export const getUsers = adminProcedure.query(async () => {
    const users = await getAllUsers();

    if (users === "INTERNAL_SERVER_ERROR")
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return users.map(({ password, ...user }) => user);
});

function getAllUsers() {
    try {
        const db = database.getDB();
        const users = db.collection<IUser>("users");

        return users.find().toArray();
    } catch (err) {
        return "INTERNAL_SERVER_ERROR";
    }
}
