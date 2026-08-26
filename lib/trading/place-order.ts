// Execution lives in ./core/place-order because the strategy runner on the VPS
// has to take the exact same path — risk gates included. A second engine that
// only the bot uses is how a bot ends up trading past a limit the screen shows.
import 'server-only';

export { quoteOrder, placeOrder } from '../core/place-order';

export type { PlaceOrderInput, PlaceOrderResult, QuotePreview } from '../core/place-order';
