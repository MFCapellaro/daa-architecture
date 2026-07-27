import {
  describe,
  expect,
  it
} from "vitest";

import {
  createTrajectoryRegistry
} from "../../registry/TrajectoryRegistry.js";


describe(
  "TrajectoryRegistry",
  () => {

    it(
      "preserves registered identity trajectories",
      () => {

        const registry =
          createTrajectoryRegistry();


        registry.register({
          id: "identity-001",
          origin: "test",
          roles: [
            "pilot"
          ],
          interests: [
            "learning"
          ],
          startedAt: new Date()
        });


        registry.record(
          "identity-001",
          {
            timestamp: new Date(),
            type: "learning",
            context: "training",
            description: "completed module",
            outcome: "completed"
          }
        );


        const trajectory =
          registry.get(
            "identity-001"
          );


        expect(
          trajectory
        )
        .toBeDefined();


        expect(
          trajectory?.identityId
        )
        .toBe(
          "identity-001"
        );


        expect(
          trajectory?.events.length
        )
        .toBe(
          1
        );

      }
    );


    it(
      "lists registered identities",
      () => {

        const registry =
          createTrajectoryRegistry();


        registry.register({
          id: "identity-002",
          roles: [],
          interests: [],
          startedAt: new Date()
        });


        expect(
          registry.list()
        )
        .toContain(
          "identity-002"
        );

      }
    );

  }
);