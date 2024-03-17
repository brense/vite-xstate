import { useMachine } from "@xstate/react";
import { createBrowserInspector } from "@statelyai/inspect";
import { useEffect, useRef } from "react";
import { stationAttendeeMachine } from "./machines/stationAttendeeMachine";

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { inspect } = createBrowserInspector({
    iframe: iframeRef.current,
  });

  const [state, send] = useMachine(stationAttendeeMachine, {
    input: {
      attendee: { userId: "me" },
      executor: { userId: "me", executorType: "SELF" },
      stationId: "123",
    },
    inspect,
  });

  useEffect(() => {
    console.log(state);
    if (state.value === "ready") {
      send({ type: "register" });
    }
  }, [state, send]);

  return <>{JSON.stringify(state.value)}</>;
}

export default App;
