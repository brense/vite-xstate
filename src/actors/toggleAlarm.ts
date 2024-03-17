import { fromPromise } from "xstate";

export const toggleAlarm = fromPromise<
  unknown,
  { teasecSiteId: string; action: "ARM" | "DISARM" }
>(({ input: { action, teasecSiteId } }) => {
  return new Promise<void>((resolve, reject) => {
    try {
      console.log(action, teasecSiteId);
      setTimeout(() => {
        resolve();
      }, 1000);
    } catch (e) {
      reject({ action });
    }
  });
});
