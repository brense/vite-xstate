import { fromPromise } from "xstate";
import { Station } from "../types";

const stations = {
  "empty-station": {
    stationId: "empty-station",
    attendees: []
  },
  "empty-station-with-alarm": {
    stationId: "empty-station-with-alarm",
    teasecSiteId: "ABC",
    attendees: []
  },
  "station-with-attendees": {
    stationId: "station-with-attendees",
    teasecSiteId: "123",
    attendees: [{ userId: "cpos" }, { userId: "someone" }]
  },
  "station-with-contact-person": {
    stationId: "station-with-contact-person",
    teasecSiteId: "123",
    attendees: [{ userId: "cpos" }]
  }
}

export const fetchStationAndAttendees = fromPromise<
  Station,
  { stationId: string }
>(({ input: { stationId } }) => {
  return new Promise((resolve) => {
    console.log("fetching attendees for station", stationId);
    const station = stations[stationId as keyof typeof stations]
    setTimeout(() => {
      resolve(station || {
        stationId,
        teasecSiteId: "AAA",
        attendees: [{ userId: "234" }],
      });
    }, 500);
  });
});
