import ITax from "./tax.js";
import IUser from "./user.js";
import { WithId } from "mongodb";
import IProduct from "./product.js";
import ICustomer from "./customer.js";
import IShipping from "./shipping.js";
import ISupplier from "./supplier.js";

export type TCollections =
    | WithId<ITax>
    | WithId<IUser>
    | WithId<IProduct>
    | WithId<ICustomer>
    | WithId<IShipping>
    | WithId<ISupplier>;

export { ICustomer, IProduct, IShipping, ISupplier, ITax, IUser };
