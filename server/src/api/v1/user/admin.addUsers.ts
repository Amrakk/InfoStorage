import { ZodError, z } from "zod";
import { userRegex } from "../../../configs/regex.js";
import { adminProcedure } from "../../../trpc.js";
import IUser from "../../../interfaces/collections/user.js";

const userSchema = z.object({
    name: z.string().regex(userRegex.name),
    email: z.string().email(),
    password: z.string().regex(userRegex.password),
    phone: z.string().regex(userRegex.phone),
    role: z.enum(["admin", "manager", "employee"]),
    isValid: z.boolean().default(false),
});

const inputSchema = z.array(userSchema);
type TInput = z.infer<typeof inputSchema>;

export const addUsers = adminProcedure
    .input((input) => {
        const inputArray = input as unknown as unknown[]; // Cast input to an array of unknown

        const modifiedInput = inputArray.map((item) => {
            const result = userSchema.safeParse(
                item as unknown as Record<string, unknown>
            );
            if (result.success) {
                // Modify the isValid property as needed
                return { ...result.data, isValid: true };
            } else {
                // Item is invalid, you can choose to handle it as desired
                return item as unknown as Record<string, unknown>;
            }
        });

        return { input: modifiedInput as unknown as (typeof inputSchema)[] };
    })
    .mutation(async ({ input }) => {});
