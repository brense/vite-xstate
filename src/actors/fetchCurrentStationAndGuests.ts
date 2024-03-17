import { fromPromise } from "xstate";

export const fetchCurrentStationAndGuests = fromPromise<
  {
    currentStation: { stationId: string; isContactPerson: boolean } | null;
    guests: Array<{ name: string }>;
  },
  { userId: string }
>(({ input: { userId } }) => {
  return new Promise((resolve) => {
    console.log("fetching current station and guests for", userId);
    setTimeout(() => {
      resolve({ currentStation: null, guests: [] });
    }, 500);
  });
});
