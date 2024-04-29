import { assign, setup } from "xstate";
import { Attendee, ErrorStates, ExecutedBy } from "../types";
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
      executedBy: ExecutedBy;
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
      executedBy: ExecutedBy;
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
        executedBy: { executorType },
      },
    }) =>
      executorType === "GUESTS_HOST" &&
      Boolean(currentStation?.stationId !== stationId),
    isFirstAtStation: ({ context: { attendees } }) => attendees.length === 0,
    stationHasAlarm: ({ context: { teasecSiteId } }) => Boolean(teasecSiteId),
    hasErrors: ({ context: { error } }) => error !== "NONE",
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwC4EMUEsD2A7AgiimLhGGAHQA22aEmuUAxBHpahu+lnocaeWq16jANoAGALqJQAB2yxMPXDJAAPRAEZtAZgo6AnACYDANiMAWC0dPaDAGhABPRBe0UzADgDsp8bcNTHUsAXxDHDmU+EjJKGjoGKAoAMzAUAGMAC0SAYQBXACcCkhQAZW4cAlIAcTy4FFghBMYWNgoGADdsAGsuDErogTjhRJS0rNzC4twyit4autRG+JEoBE7sdP68CUld1XlFZVUNBABWbyMKM5tPcU8bn28DT0cXBCMdbwpNA1-ve6mM4WYKmbxhCJzAhEGKCFajVIZbKMfJFErlbZVCC1erLEYtMBFbAFCiyKgYZLEgC2FEiAxhQyaqzGSMmaJmGKiC1xTMS61wXS2yl2+yQIEOSkqJy0un0xjMlmstl+b0Qnk0FHE3k0IKM4h0nnVmiMZwhIDpvAZsV5jBZE0YnPp-FieOazFYuEoG16tKhg2t8NtiPtUEdlud5Fdq35gsxIqkBwUkrw0vOLw8Z2BJk0Zx09wMDmciFzBmu4isdyMvi1YLNFuhEeGbrtyNDfqtkZtzEJBWJpPJKEpBRp9f9cPxSWDrbDDdhcC7Mc2cakorkSeOYtO-1VCF+Z1L1k85nERgeOgsngMdfbjYoxToTiYxSgmFQhNX4vXUs3WmM308Rg5gBAIAqYPg7kYkEUKYfwGCBliXN4ubXpiY6UPeECPs+r7EAUoiaNIYoShuoBbsYeiaDB6oPJcTymDuAFnBQl7eOeFiZoxXwoVEHboWAD5PmAL5vnhRiEWuRzfqRv7eDumjnuImqaN4l7iOI8mmGBpjcU6c53vxmFMHkuDYSJH7EVJ6gyXJIJMSal5gjcx5BDp4Z6Rhj7GaZuH4eJn6SSmP67nBEEWOY0EwTBvgXJo6qubOjIeUZJlCTh75iYmAUqEFvynj8VGxRcp7eL4O6ZhYmrlhYzzAn86nguE5o3u5BmeSlwk+TofkWYF0nBXllEvIVtElfRRYIAY7EUKN6omup8lavFaH6R1hKJEw5lfr1VkfGctjQWcvwGDo5gWMd1U7jBpbPOpLyaepgFXo1o68StaUFOtvmZcm2V9Sa+1AkdJ2WOdsnjZ41j6Cafy+ECtgmEtr0AEZgOk2BUrkeDoOkKAAAqErAeAbQmRFbb9O3buNymAWWansfqPhWIjt5ealImfSTEk-am-0aoDBbA2d55g+8mZMWcVXPLYk3AjozN6WjVIY0QiQACoFGguCwGgOOVLArSeu0Ao9H0PG3orytYIw6ua9rut4LAi5CpU8bdWTqY5pYlUGP4e0gmBylyUaFBWKY1WnsCVj6vLjIW0oVtQDbWs68o+sel6xs+i95vo5basa8n9ta07y57AR30kRTNylmpPtw-76oi7+uYeABvyFQLOox9accq9bBd26nTA9n2ZIUtSvqoa9vcJ0ng96yXworpz-nczl1fe77YcnY3ckXJ4cqnuRYKQQjz3NYyKDYFAUBUIk+DksOBsZ10WcX9aV833fjAP2gw6Ly7Zebsso8yrKYEOvxPA6ECFAmwTddyMWgnNdiDxzCgW7oIT+t976PypMPIkJIx6DgntnPSWDv5QF-v-DYzsdhAIrpZU4kFfAQJeNArwoJ4HKWgfoKBXgLxWANBgyguBsBYGSE4da6cjav1NrpRkojxGSMYAAuhewV49XJlubQGpZp+CGnBAwe0IIQw1DmQqJo3CZlisIigijMASKkW0b0ci3IKLEQ45RawaGly+qTEBOVND3EPgqKwNg7AmMNJqO41gSqGhzNpc+U9bz2McQSAh-Zx7DknmbPSqSvGqNwK7Bh21tHyRCadJUETxpVgvB4IJJVDpRV+GERqoiyDwDFKQoYJStFaHuDuAAtF7E8nwTQmiCepe4pokm5MZIGKAvSPbGPGkETUZ0glgh8OqeqtiFktjZNMWYqFuRLCWUFPUFg96KWNOIXMhobDmC7rM+RAYJwHJRFMdEfpTkNC7Ocv6NxQoHkzCdHQwJfCGhOns95U5DnfJOdiRYfzFZkjSGAAFO0fCKTCiCACJ1Dogh0BBC4+hjQSweJeI8LkXluLec2OFDp36RkxUwvazEYqVnkmFLU8D2JXCJeWfFlwgQzMhMkvS+zGVtglUMKMiRWWIDzBVGisUTzcr8CVMqh1ppbMuEYqBwQLAwoZeMaczL5yoqoOixVCBsUh23viwGRLtWlnMBLNValDrllsR5W1ykdUlWqpRM4Dxyw2B3G4RSYFlWsTYuIF4vq2a4QVf4tef1Tx6CgUCKZth1JhwYieZi0N5KWDDtw2xKNFaYxmCnfGBRCbk00TzZ4FUghuAvJcfU5hLreAqmFHwJ9Yl7QauKuZ1pWarQ+owW1zDwFuDYTAzhZU8weGgUKz4Iqbi2JnvnW2Kc9b+p1HoG4lhzx-FlpmOSJUs1IXLICE0eZEljteZg6+2Cf64NnepA+Wp2KjTQeea9R5mJ3o7ZcCZYqmqyutPk1NXNK6nBuOLbllEDRhWNGNd4p5KLXBiYBHMx0aUvrpYIK16KID+o3rXLeDdA7jTzKGssPt9T6mqs+6D47BDJDQJga1lG02Ia0NRhNtGd70ewwWcBMF7i-AHYeVpIQgA */
  id: "stationAttendee",
  context: ({ input: { executedBy, attendee, stationId } }) => ({
    executedBy,
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
