import { router } from "../trpc.js";
import { searchByName } from "../api/services/searchByName.js";
import * as addressHandlers from "../api/services/addressHandlers.js";

export const serviceRouter = router({
    ...addressHandlers,

    searchByName,
});
