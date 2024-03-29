import { assign, setup } from "xstate";
import { Attendee, ErrorStates, Executor } from "../types";
import { fetchCurrentStationAndGuests } from "../actors/fetchCurrentStationAndGuests";
import { fetchStationAndAttendees } from "../actors/fetchStationAndAttendees";
import { toggleAlarm } from "../actors/toggleAlarm";
import { sendNotifications } from "../actors/sendNotifications";
import { commitTransactions } from "../actors/commitTransactions";
import {
  createContactPersonLogEntry,
  createRegisterLogEntry,
  createUnregisterLogEntry,
  endSession,
  abortTransaction,
} from "../actions";

export const stationAttendeeMachine = setup({
  types: {
    context: {} as {
      attendee: Attendee;
      executor: Executor;
      stationId: string;
      teasecSiteId?: string;
      error: ErrorStates;
      session: unknown;
      currentStation: { stationId: string; isContactPerson: boolean } | null;
      guests: Array<{ name: string }>;
      attendees: Attendee[];
      becameContactPerson: boolean;
    },
    input: {} as {
      attendee: Attendee;
      executor: Executor;
      stationId: string;
    },
    output: {} as {
      becameContactPerson: boolean;
      error: ErrorStates;
    },
  },
  actors: {
    fetchCurrentStationAndGuests,
    fetchStationAndAttendees,
    toggleAlarm,
    sendNotifications,
    commitTransactions,
  },
  actions: {
    setError: assign((_, { error }: { error: ErrorStates }) => ({ error })),
    createRegisterLogEntry,
    createContactPersonLogEntry: assign(() => {
      createContactPersonLogEntry();
      return { becameContactPerson: true };
    }),
    createUnregisterLogEntry,
    endSession,
    abortTransaction,
  },
  guards: {
    isAlreadyRegistered: ({ context: { currentStation } }) =>
      currentStation !== null,
    isNotRegisteredAtStation: ({ context: { currentStation, stationId } }) =>
      currentStation?.stationId !== stationId,
    hasGuests: ({ context: { guests } }) => guests.length > 0,
    isContactPersonAndStationNotEmpty: ({
      context: { currentStation, attendees },
    }) => attendees.length > 0 && Boolean(currentStation?.isContactPerson),
    isHostNotRegisteredAtStation: ({
      context: {
        stationId,
        currentStation,
        executor: { executorType },
      },
    }) =>
      executorType === "GUESTS_HOST" &&
      Boolean(currentStation?.stationId !== stationId),
    isFirstAtStation: ({ context: { attendees } }) => attendees.length === 0,
    stationHasAlarm: ({ context: { teasecSiteId } }) => Boolean(teasecSiteId),
    hasErrors: ({ context: { error } }) => error !== "NONE",
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwC4EMUEsD2A7AgiimLhGGAHQA22aEmuUAxBHpahu+lnocaeWq16jANoAGALqJQAB2yxMPXDJAAPRAGYA7ACYKAVl0A2bcYAcARmO7tAFl2WANCACeWg5sMmz5gJzaln4GDgYAvmEuHMp8JGSUNHQMzGAATqnYqRSyVBgAZpkAthTROAREcYKJIlAIDABu2ADGGGUSku2q8orKqhoIOvpGphbWtg7ObohWFOKBdprimnaWy+Z24ZEgpbwVAgnCyUxpGVk5+UUl3GWx+0JJjHW4jS3KopYdUl0KSmV9WnpvCMrDZ7I4XO4EJZtF5NJZdHZzIFLIiln4IlFrrt+PEKKkwHRXEx8VBMKg0p0kCBur88P8EOYdBQ-OZHDoDIFFjoIVoUczNItLAYDOIhXDjMYMdsseUcYJ8YTiWBSeTUu9pFSab0qf1GdpmazVtoOasltoeQg-AjDDZhbpxLZxDZ0VsdrLKpQFRAiSSycQ1boNXIftrQLqmSy2cbOWaLStxBRoXZxOYJdpzCm-BspW7brivUSAK64X2qynBnp-HXTCOG9kx7lTBAigwUFZGNlLSziIw5mV5+UE71MYul-3q76VunVhm1qMmrnmpvGcQJ4wGZ0I7R+CVwvutbEevFDosl5V+imBye0lQzvUG+cNpeQszGCjrVkOCyLczC-cxPZ8xPEczxVcdNCDakQyrMMa31SMjQXWMm3hbR9WMHd10WYwhSsf8bkAwcwLSI5yygqdb1gqENzfPw-G7YVtFFDD7Atej9GMZZRRTPQ0N-fDDzuMcSMYJgJ01aDpyooUJWZeiew5ZiAjsC0GNbaxlN0cwMzMIUBPdO4ACMwCabBCmSABhPB0CaFAAAU0lgPAxK+CSKPpe1AQlAJNH8OxjDsQK2MsSx30ZLMnQMELdF0fSB0oUdz1VUjXIrG96Rk2j5MYpTWKbXwKDWHwBV0HddE2TEDwM3FTMKcyiGSAAVVI0FwWA0FsspYBYNgKAabAAGsuCq+KKFq+qsEYZrWvazq8FgJ4Xiq9oyK1GD1EQBFNCGQKJWsDlSs0C1-DXaxVgFTQMJCOLCMocalEmqBprajrlG61hcEofqhquEbbrGsyJqalqXrmtrFuaZapHEtLQw2hAtp2-ycPXPQ-COlCnTsA1TCdTQNzsMwbrlO7AYe4GZterrjnSTJslyFAClSYpc3++6GqmkHZreiHXjaaHUvI9KZ0RwxdpRg70dUo1DF0uEkQC8RAuJo8UGwKAoCoMB8FyZmes+vrnkG4aAJJig1Y1rWdbQZneahz5ILWqT4cWGLDEje0WTQvLISzN8HV0XzlmNOxgnMFW7gtzXtd1woadOemLmZ37TdV9Xo+t23+r5vAVsFp3KJdgP3dZT2kTQlSm1-Lx03hLMAlrlEI9xXBsCwPJXCOD6vqNn7WbN1v287x5s-t1bJML-plmFCgfEZQOHERZ9EDo7GBXR9YV1WEwKulP6B7bzAO673rvpNgiD6H5I7beaGPmvOGp42Vs5+25YESRVSldCkwMy5TitLrmboIQeR9h4pFpmcBmTMWb9n+qA4+I8jY51wHnR2E96TTxfqYee78l5sQdLMSMO5uyXQcBELYrcyDwCpP3D0D91r9AALTGAtCw2Yq5OFcK4doYBBwHhQAYc7foDg2JeCtPGAw6N4SMl7K6OBZsCxCMnogbyiYER0VTH-UUFp8b6ARN2Qmop0acj4ceYiqRkjKIylpPwiZjRGAzCyN+BDQqhxCimVMopVh2DMcZWqllrKvQcqkJyhcC4ZWNHYnyMUQqWHWOmAwx0kSFXhJ4IUBighmMShYqxblhbSS0qFY0-hVhGEukiXQFp7A1zMNuYIZ18bh3kfvI87NHrPW5l1axItrD6niQ4gw6xxB+CVsk-UcJypwiMCsLJLTU6R3TlbWOPSqJFLfExTwX4RTlT8MdWSStCYxRsDoTQO4zEIPAasl29pWyjOhBYLSMVFhJKbFaNxIplJrFDrYMxtUchgGIBAa5U9WStm0r5CuG5PasMxr5CgMJA5zGsBmDYmgzF5DQJgLWwL8mPy0GCsKkL7DQpGbCyERg7HwjTPYH5hyKFhCAA */
  id: "stationAttendee",
  context: ({ input: { executor, attendee, stationId } }) => ({
    executor,
    attendee,
    stationId,
    error: "NONE",
    becameContactPerson: false,
    currentStation: null,
    guests: [],
    attendees: [],
    session: {}, // mongoose.startSession => session.startTransaction
  }),
  initial: "loading",
  states: {
    loading: {
      type: "parallel",
      states: {
        fetchingCurrentStationAndGuests: {
          initial: "loading",
          states: {
            loading: {
              invoke: {
                src: "fetchCurrentStationAndGuests",
                input: ({
                  context: {
                    attendee: { userId },
                  },
                }) => ({ userId }),
                onDone: {
                  target: "complete",
                  actions: assign(
                    ({
                      event: {
                        output: { currentStation, guests },
                      },
                    }) => ({ currentStation, guests })
                  ),
                },
                onError: {
                  target: "#stationAttendee.failed",
                  actions: {
                    type: "setError",
                    params: { error: "FETCH_CURRENT_STATION_FAILED" },
                  },
                },
              },
            },
            complete: {
              type: "final",
            },
          },
        },
        fetchingStationAttendees: {
          initial: "loading",
          states: {
            loading: {
              invoke: {
                src: "fetchStationAndAttendees",
                input: ({ context: { stationId } }) => ({ stationId }),
                onDone: {
                  target: "complete",
                  actions: assign(
                    ({
                      event: {
                        output: { attendees, teasecSiteId },
                      },
                    }) => ({ attendees, teasecSiteId })
                  ),
                },
                onError: {
                  target: "#stationAttendee.failed",
                  actions: {
                    type: "setError",
                    params: { error: "FETCH_ATTENDEES_FAILED" },
                  },
                },
              },
            },
            complete: { type: "final" },
          },
        },
      },
      onDone: { target: "ready" },
    },
    ready: {
      on: {
        register: [
          {
            guard: "isHostNotRegisteredAtStation",
            target: "failed",
            actions: {
              type: "setError",
              params: { error: "HOST_NOT_AT_STATION" },
            },
          },
          { guard: "isNotRegisteredAtStation", target: "registering" },
          {
            target: "failed",
            actions: {
              type: "setError",
              params: { error: "ALREADY_REGISTERED" },
            },
          },
        ],
        unregister: [
          {
            guard: "hasGuests",
            target: "failed",
            actions: {
              type: "setError",
              params: { error: "HAS_GUESTS" },
            },
          },
          {
            guard: "isContactPersonAndStationNotEmpty",
            target: "failed",
            actions: {
              type: "setError",
              params: { error: "STATION_NOT_EMPTY" },
            },
          },
          { guard: "isAlreadyRegistered", target: "unregistering" },
          {
            target: "failed",
            actions: {
              type: "setError",
              params: { error: "NOT_REGISTERED" },
            },
          },
        ],
      },
    },
    registering: {
      entry: { type: "createRegisterLogEntry" },
      always: [
        { guard: "isFirstAtStation", target: "becomingContactPerson" },
        { target: "committingTransactions" },
      ],
    },
    becomingContactPerson: {
      entry: { type: "createContactPersonLogEntry" },
      always: { target: "committingTransactions" },
    },
    unregistering: {
      entry: { type: "createUnregisterLogEntry" },
      always: { target: "committingTransactions" },
    },
    committingTransactions: {
      invoke: {
        src: "commitTransactions",
        input: ({ event }) => ({
          session: {},
          eventType: event.type as "register",
        }),
        onDone: [
          { guard: "stationHasAlarm", target: "togglingAlarm" },
          { target: "notifying" },
        ],
        onError: {
          target: "failed",
          actions: [
            {
              type: "setError",
              params: { error: "WRITING_LOG_ENTRIES_FAILED" },
            },
            { type: "abortTransaction" },
          ],
        },
      },
      exit: [{ type: "endSession" }],
    },
    togglingAlarm: {
      invoke: {
        src: "toggleAlarm",
        input: ({
          event: {
            output: { eventType },
          },
          context: { teasecSiteId = "" },
        }) => ({
          teasecSiteId,
          action:
            eventType === "register" ? ("DISARM" as const) : ("ARM" as const),
        }),
        onDone: { target: "notifying" },
        onError: {
          target: "notifying",
          actions: {
            type: "setError",
            params: ({ event }) => ({
              error:
                (event.error as { action: "DISARM" }).action === "DISARM"
                  ? "DISARM_ALARM_FAILED"
                  : "ARM_ALARM_FAILED",
            }),
          },
        },
      },
    },
    notifying: {
      invoke: {
        src: "sendNotifications",
        onDone: [
          { guard: "hasErrors", target: "failed" },
          { target: "completed" },
        ],
        onError: {
          target: "failed",
          actions: {
            type: "setError",
            params: { error: "SEND_NOTIFICATIONS_FAILED" },
          },
        },
      },
    },
    completed: { type: "final" },
    failed: { type: "final" },
  },
  output: ({ context: { becameContactPerson, error } }) => ({
    becameContactPerson,
    error,
  }),
});
