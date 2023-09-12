import { router } from "../trpc.js";
import { searchByName } from "../api/services/searchByName.js";
import * as addressHandlers from "../api/services/addressHandlers.js";
import * as defaultHandlers from "../api/services/defaultHandlers.js";

export const serviceRouter = router({
    ...addressHandlers,
    ...defaultHandlers,

    searchByName,
});
