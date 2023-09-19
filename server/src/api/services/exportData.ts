import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "../../trpc.js";
import { CollectionNames, rolePermissions } from "../../configs/default.js";
import { getDataByID } from "../../middlewares/collectionHandlers/dataHandlers.js";
import {
    TSheet,
    generateExcelFile,
    generateExcelSheet,
} from "../../middlewares/excelHandlers/excelGenerators.js";
import { sendDataViaMail } from "../../middlewares/mailHandlers.ts/sendDataViaMail.js";

const inputSchema = z.object({
    type: z.nativeEnum(CollectionNames),
    dataIDs: z.array(z.string()).optional(),
});

const internalErr = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to send email",
});

export const exportData = verifiedProcedure
    .input(inputSchema)
    .query(async ({ ctx, input }) => {
        const { user } = ctx;
        const { type, dataIDs } = input;

        if (!rolePermissions[user.role].includes(type))
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You don't have permission to access this resource",
            });

        let sheet: TSheet | false;
        if (dataIDs) {
            const data = await getDataByID(type, dataIDs);
            sheet = await generateExcelSheet(type, data);
            if (!sheet) throw internalErr;
        } else {
            sheet = await generateExcelSheet(type);
            if (!sheet) throw internalErr;
        }

        const workbook = await generateExcelFile([sheet]);
        if (!workbook) throw internalErr;

        const mailInfo = {
            to: [user.email],
            types: [type],
            data: workbook,
        };

        const result = await sendDataViaMail(mailInfo);
        if (!result) throw internalErr;

        return { message: "File exported via email successfully" };
    });
