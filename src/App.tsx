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
  attendee: { userId: "me" },
  executor: { userId: "me", executorType: "SELF" as const },
  stationId: "123",
};

const { inspect } = createBrowserInspector();

const ActorContext = createContext<Actor<typeof stationAttendeeMachine> | null>(
  null
);

function Component() {
  const actor = useContext(ActorContext);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    if (actor) {
      const unsub = actor.subscribe((snapshot) => {
        if (snapshot.value === "ready") {
          setReady(true);
        }
        if (snapshot.status === "done") {
          setReady(false);
        }
      });
      return () => unsub.unsubscribe();
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
      <button disabled={!isReady} onClick={handleRegister}>
        register
      </button>
      <button disabled={!isReady} onClick={handleUnregister}>
        unregister
      </button>
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
