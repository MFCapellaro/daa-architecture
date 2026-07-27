import {
  describe,
  expect,
  it
} from "vitest";

import {
  createTrajectoryRegistry
} from "../registry/TrajectoryRegistry.js";


describe(
  "Trajectory Preservation",
  () => {

    it(
      "preserves identity trajectory over time",
      () => {

        const registry =
          createTrajectoryRegistry();


        registry.register({
          id: "pilot-001",
          roles: [
            "pilot"
          ],
          interests: [
            "training"
          ],
          startedAt: new Date()
        });


        registry.record(
          "pilot-001",
          {
            timestamp: new Date(),
            type: "training",
            outcome: "completed"
          }
        );


        const trajectory =
          registry.get(
            "pilot-001"
          );


        expect(
          trajectory?.events.length
        )
        .toBe(1);

      }
    );

  }
);