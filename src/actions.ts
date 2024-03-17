export function createRegisterLogEntry() {
  console.log("REGISTERED ENTRY");
}

export function createUnregisterLogEntry() {
  console.log("UNREGISTERED ENTRY");
}

export function createContactPersonLogEntry() {
  console.log("BECAME_CONTACT_PERSON ENTRY");
}

export function endSession({
  context: { session },
}: {
  context: { session: unknown };
}) {
  console.log("ending session", session);
  // TODO: session.endSession()
}

export function abortTransaction({
  context: { session },
}: {
  context: { session: unknown };
}) {
  console.log("aborting transaction", session);
  // TODO: session.abortTransaction()
}
