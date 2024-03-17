import { fromPromise } from "xstate";

export const commitTransactions = fromPromise<
  { eventType: "register" | "unregister" },
  { session: unknown; eventType: "register" | "unregister" }
>(({ input: { eventType } }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ eventType });
    }, 1000);
  });
});
