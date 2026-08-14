// Minimal React Native mock for Jest (only needed if business logic imports RN)
export default {};
export const Platform = { OS: 'android', select: (spec: any) => spec.android };
export const Alert = { alert: jest.fn() };
