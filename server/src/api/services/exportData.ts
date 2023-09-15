import { z } from "zod";
import { verifiedProcedure } from "../../trpc.js";
import { CollectionNames } from "../../configs/default.js";

const inputSchema = z.object({
    collection: z.nativeEnum(CollectionNames),
    data: z.array(z.string()).optional(),
});

export const exportData = verifiedProcedure
    .input(inputSchema)
    .query(({ input, ctx }) => {});
