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

const input = {
  attendee: { userId: "new-attendee" },
  executor: { userId: "new-attendee", executorType: "SELF" as const },
  stationId: "empty-station-with-alarm",
};

const { inspect } = createBrowserInspector();

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
      return () => unsub.unsubscribe();
    }
  }, [actor]);

  const handleRegister = useCallback(() => {
    setOutput(undefined);
    actor?.send({ type: "register" });
  }, [actor]);

  const handleUnregister = useCallback(() => {
    setOutput(undefined);
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
      {done && <hr />}
      {done && <pre>{JSON.stringify(output, null, 2)}</pre>}
    </>
  );
}

function App() {
  const [actor, setActor] = useState<Actor<
    typeof stationAttendeeMachine
  > | null>(null);
  const handleCreateActor = useCallback(() => {
    const actor = createActor(stationAttendeeMachine, { input, inspect });
    setActor(actor);
    actor.start();
  }, []);
  return (
    <ActorContext.Provider value={actor}>
      <button onClick={handleCreateActor}>create actor</button>
      <Component />
    </ActorContext.Provider>
  );
}

export default App;
