import Logistics from "../models/logistics/logisticsModel.js";
import Store from "../models/stores/sellerModel.js";
import User from "../models/buyer/userModel.js";
import Farm from "../models/farms/farmerModel.js";

import AppError from "./error.js";

export const db = {
  user: User,
  store: Store,
  logistics: Logistics,
  farm: Farm,
};

export const userTypes = ["farm", "user", "store"];

export const checkUserType = (type, req, next) => {
  if (!type || !userTypes.includes(type))
    return next(
      new AppError(
        "Please provide a valid  user type [either farm, store or logistics]",
        401
      )
    );
};
