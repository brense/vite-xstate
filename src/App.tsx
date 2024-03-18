import { createBrowserInspector } from "@statelyai/inspect";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { stationAttendeeMachine } from "./machines/stationAttendeeMachine";
import { Actor, createActor } from "xstate";
import { users } from "./actors/fetchCurrentStationAndGuests";
import { stations } from "./actors/fetchStationAndAttendees";

const inspector = createBrowserInspector({
  autoStart: false,
  iframe: document.getElementById("inspector-iframe") as HTMLIFrameElement,
});

const ActorContext = createContext<Actor<typeof stationAttendeeMachine> | null>(
  null
);

function Component() {
  const actor = useContext(ActorContext);
  const [state, setState] = useState<unknown>("loading");
  const [output, setOutput] = useState<unknown>();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (actor) {
      const unsub = actor.subscribe((snapshot) => {
        setState(snapshot.value);
        if (snapshot.status === "done") {
          console.log(snapshot);
          setDone(true);
          setOutput(snapshot.output);
        }
      });
      return () => {
        unsub.unsubscribe();
        setOutput(undefined);
        setDone(false)
      };
    }
  }, [actor]);

  const handleRegister = useCallback(() => {
    actor?.send({ type: "register" });
  }, [actor]);

  const handleUnregister = useCallback(() => {
    actor?.send({ type: "unregister" });
  }, [actor]);

  return (
    <>
      <button disabled={state !== "ready"} onClick={handleRegister}>
        register
      </button>
      <button disabled={state !== "ready"} onClick={handleUnregister}>
        unregister
      </button>
      <hr />
      <pre>{done ? JSON.stringify(output, null, 2) : (state as string)}</pre>
    </>
  );
}

function App() {
  const [actor, setActor] = useState<Actor<
    typeof stationAttendeeMachine
  > | null>(null);

  useEffect(() => {
    inspector.start();
  }, []);

  const handleCreateActor = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const { attendeeUserId, stationId, executorType } = e.currentTarget
        .elements as unknown as Record<string, { value: string }>;
      console.log(attendeeUserId.value, stationId.value, executorType.value);
      const actor = createActor(stationAttendeeMachine, {
        input: {
          attendee: {
            userId:
              executorType.value === "SELF" ? attendeeUserId.value : "guest",
          },
          executor: {
            userId: attendeeUserId.value,
            executorType: executorType.value as "SELF",
          },
          stationId: stationId.value,
        },
        inspect: inspector.inspect,
      });
      setActor(actor);
      actor.start();
    },
    []
  );
  return (
    <ActorContext.Provider value={actor}>
      <form onSubmit={handleCreateActor}>
        <div style={{ display: "flex" }}>
          <fieldset>
            <legend>Select attendee:</legend>
            {Object.keys(users).map((k) => (
              <div key={k}>
                <input
                  type="radio"
                  id={k}
                  name="attendeeUserId"
                  value={k}
                  defaultChecked={k === "new-attendee"}
                />
                <label html-for={k}>{k}</label>
              </div>
            ))}
          </fieldset>
          <fieldset>
            <legend>Select station:</legend>
            {Object.keys(stations).map((k) => (
              <div key={k}>
                <input
                  type="radio"
                  id={k}
                  name="stationId"
                  value={k}
                  defaultChecked={k === "empty-station-with-alarm"}
                />
                <label html-for={k}>{k}</label>
              </div>
            ))}
          </fieldset>
          <fieldset>
            <legend>Executor type:</legend>
            {["SELF", "GUESTS_HOST", "OPERATOR"].map((k) => (
              <div key={k}>
                <input
                  type="radio"
                  id={k}
                  name="executorType"
                  value={k}
                  defaultChecked={k === "SELF"}
                />
                <label html-for={k}>{k}</label>
              </div>
            ))}
          </fieldset>
        </div>
        <button type="submit">create actor</button>
      </form>
      <Component />
    </ActorContext.Provider>
  );
}

export default App;
