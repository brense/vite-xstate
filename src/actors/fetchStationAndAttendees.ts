import { fromPromise } from "xstate";
import { Station } from "../types";

export const fetchStationAndAttendees = fromPromise<
  Station,
  { stationId: string }
>(({ input: { stationId } }) => {
  return new Promise((resolve) => {
    console.log("fetching attendees for station", stationId);
    setTimeout(() => {
      resolve({
        stationId,
        teasecSiteId: "AAA",
        attendees: [{ userId: "234" }],
      });
    }, 500);
  });
});
