import { fromPromise } from "xstate";

export const sendNotifications = fromPromise(() => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});
