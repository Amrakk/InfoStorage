import { verifiedProcedure } from "../../trpc.js";

export const getAccToken = verifiedProcedure.query(async () => {
    return { message: "Get access token successfully" };
});
