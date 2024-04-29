import { AnyInvokeConfig, UnknownAction } from "xstate";

export default function parallelServices(
  ...services: Array<
    Omit<AnyInvokeConfig, "onDone" | "onError" | "src"> & {
      src: string;
      actions: readonly UnknownAction[];
    }
  >
) {
  return {
    type: "parallel",
    states: services.reduce((acc, { src, actions }) => {
      return {
        ...acc,
        [src]: {
          initial: "run",
          states: {
            run: {
              invoke: {
                src,
                onDone: {
                  actions,
                  target: "done",
                },
              },
            },
            done: {
              type: "final",
            },
          },
        },
      };
    }, {}),
  };
}
