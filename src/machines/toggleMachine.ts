import { createMachine } from "xstate";

export const toggleMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2UoBswDoCWAdgIYDGyeAbmAMQAqA8gOKMAyAogNoAMAuoqAAdUsPOVQF+IAB6IAjADYArDgAcigOyyAzABZ5ATgBMXfVsPqANCACecrbJxcnXBfsX636vQF9vVtBjYOKTkVHRMrJy8kkIiYhJI0nJKqhraekYmZpY2iCoOXJo6Ogry+Yryhjq+fiAEqBBwkgFYYDHConjikjIIALTyVrb98r7+6K34xGSUbYmxnd2JvTqGQ3nyqgZciorm6opqhqO1LUEhs+1xXQmgvYYq+jiHRvIu+vLysrJcg7kIjxwWm26kMihKii06kqNW8QA */
  id: "toggle",
  initial: "inactive",
  states: {
    inactive: {
      on: { TOGGLE: "active" },
    },
    active: {
      on: { TOGGLE: "inactive" },
    },
  },
});
