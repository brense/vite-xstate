import { fromPromise } from "xstate";

export const users = {
  "new-attendee": {
    currentStation: null,
    guests: []
  },
  "attendee-at-station": {
    currentStation: {
      stationId: "station-with-attendees",
      isContactPerson: false
    },
    guests: []
  },
  "contact-at-station": {
    currentStation: {
      stationId: "station-with-cpos",
      isContactPerson: true
    },
    guests: []
  },
  "attendee-with-guests": {
    currentStation: {
      stationId: "station-with-attendees",
      isContactPerson: false
    },
    guests: [
      { name: "Some guest" }
    ]
  }
}

export const fetchCurrentStationAndGuests = fromPromise<
  {
    currentStation: { stationId: string; isContactPerson: boolean } | null;
    guests: Array<{ name: string }>;
  },
  { userId: string }
>(({ input: { userId } }) => {
  return new Promise((resolve) => {
    console.log("fetching current station and guests for", userId);
    const user = users[userId as keyof typeof users]
    setTimeout(() => {
      resolve(user || { currentStation: null, guests: [] });
    }, 500);
  });
});
