export type Attendee = {
  userId: string;
};

export type ErrorStates =
  | "NONE"
  | "FETCH_CURRENT_STATION_FAILED"
  | "FETCH_ATTENDEES_FAILED"
  | "ALREADY_REGISTERED"
  | "NOT_REGISTERED"
  | "HAS_GUESTS"
  | "HOST_NOT_AT_STATION"
  | "STATION_NOT_EMPTY"
  | "WRITING_LOG_ENTRIES_FAILED"
  | "ARM_ALARM_FAILED"
  | "DISARM_ALARM_FAILED"
  | "SEND_NOTIFICATIONS_FAILED";

export type ExecutorType = "SELF" | "GUESTS_HOST" | "OPERATOR";

export type Executor = {
  userId: string;
  executorType: ExecutorType;
};

export type Station = {
  stationId: string;
  teasecSiteId?: string;
  attendees: Attendee[];
};
