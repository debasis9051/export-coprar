import { SHIPPING_LINES } from "../../utils/mgiConstants";
import { validateExcelAOne } from "./oneValidator";
import { validateExcelAMGI } from "./mgiValidator";

export const getExcelAValidator = (shippingLine) => {
  switch (shippingLine) {
    case SHIPPING_LINES.ONE:
      return validateExcelAOne;
    case SHIPPING_LINES.MGI:
      return validateExcelAMGI;
    default:
      throw new Error(`Unsupported shipping line: ${shippingLine}`);
  }
};
