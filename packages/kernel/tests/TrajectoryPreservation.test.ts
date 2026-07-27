/**
 * DAA Kernel
 * ------------------------------
 * Trajectory Preservation Test
 *
 * Validates that identity trajectories
 * preserve relational history over time.
 */

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
      "preserves identity trajectory through temporal events",
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

            context: "certification",

            description:
              "Completed initial training",

            outcome:
              "completed"

          }
        );


        registry.record(
          "pilot-001",
          {

            timestamp: new Date(),

            type: "collaboration",

            context: "ecosystem",

            description:
              "Shared operational experience",

            outcome:
              "contribution"

          }
        );


        const trajectory =
          registry.get(
            "pilot-001"
          );


        expect(
          trajectory
        )
        .toBeDefined();


        expect(
          trajectory?.identityId
        )
        .toBe(
          "pilot-001"
        );


        expect(
          trajectory?.events.length
        )
        .toBe(
          2
        );


        expect(
          trajectory?.events[0].type
        )
        .toBe(
          "training"
        );


        expect(
          trajectory?.events[1].type
        )
        .toBe(
          "collaboration"
        );


      }
    );


  }
);