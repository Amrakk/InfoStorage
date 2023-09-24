import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "../../trpc.js";
import { contextRules } from "../../middlewares/mailHandlers/settings.js";
import { CollectionNames, rolePermissions } from "../../configs/default.js";
import { getDataFromDB } from "../../middlewares/collectionHandlers/dataHandlers.js";
import { exportDataViaMail } from "../../middlewares/mailHandlers/sendDataViaMail.js";
import { getErrorMessage } from "../../middlewares/errorHandlers/getErrorMessage.js";
import {
    TSheet,
    generateExcelFile,
    generateExcelSheet,
} from "../../middlewares/excelHandlers/excelGenerators.js";

const inputSchema = z.object({
    type: z.nativeEnum(CollectionNames),
    dataIDs: z.array(z.string()).optional(),
});

export const exportData = verifiedProcedure
    .input(inputSchema)
    .query(async ({ ctx, input }) => {
        const { user } = ctx;
        const { type, dataIDs } = input;

        try {
            if (!rolePermissions[user.role].includes(type))
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "You don't have permission to access this resource",
                });

            let sheet: TSheet;
            if (dataIDs) {
                const data = await getDataFromDB(type, dataIDs);
                sheet = await generateExcelSheet(type, data);
            } else sheet = await generateExcelSheet(type);

            const workbook = generateExcelFile([sheet]);
            const text = `Dear user,\n\nYou have requested to export data from InfoStorage included ${type}.\nThe file is attached to this email.\n\nBest regards,\nInfoStorage team`;

            const mailInfo = {
                to: [user.email],
                text,
                data: workbook,
            };
            await exportDataViaMail(mailInfo, contextRules.export);

            return { message: "File exported via email successfully" };
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: getErrorMessage(err),
            });
        }
    });
