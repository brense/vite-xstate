import { fromPromise } from "xstate";
import { Station } from "../types";

export const stations = {
  "empty-station": {
    stationId: "empty-station",
    attendees: [],
  },
  "empty-station-with-alarm": {
    stationId: "empty-station-with-alarm",
    teasecSiteId: "ABC",
    attendees: [],
  },
  "station-with-cpos": {
    stationId: "station-with-cpos",
    teasecSiteId: "123",
    attendees: [{ userId: "contact-at-station" }],
  },
  "station-with-attendees": {
    stationId: "station-with-attendees",
    teasecSiteId: "BBB",
    attendees: [
      { userId: "contact-at-station" },
      { userId: "attendee-at-station" },
    ],
  },
};

export const fetchStationAndAttendees = fromPromise<
  Station,
  { stationId: string }
>(({ input: { stationId } }) => {
  return new Promise((resolve) => {
    console.log("fetching attendees for station", stationId);
    const station = stations[stationId as keyof typeof stations];
    setTimeout(() => {
      resolve(
        station || {
          stationId,
          teasecSiteId: "AAA",
          attendees: [{ userId: "234" }],
        }
      );
    }, 500);
  });
});
