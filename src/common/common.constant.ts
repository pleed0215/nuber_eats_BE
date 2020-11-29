export const SERVER_HOST =
  process.env.NODE_ENV === 'dev'
    ? 'http://localhost:3000'
    : 'http://localhost:3000';

export const PUB_SUB = 'PUB_SUB';
export const TRIGGER_NEW_PENDING_ORDER = 'NewPendingOrder';
export const TRIGGER_NEW_COOKED_ORDER = 'NewCookedOrder';
export const TRIGGER_ORDER_UPDATE = 'NewOrderUpdate';
