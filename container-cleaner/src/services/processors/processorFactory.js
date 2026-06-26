import { processONE } from "./oneProcessor";
import { processMGI } from "./mgiProcessor";
import { SHIPPING_LINES } from "../../utils/mgiConstants";

export const getProcessor = (shippingLine) => {
  switch (shippingLine) {
    case SHIPPING_LINES.ONE:
      return processONE;
    case SHIPPING_LINES.MGI:
      return processMGI;
    default:
      throw new Error(`Unsupported shipping line: ${shippingLine}`);
  }
};
