/**
 * DAA Kernel
 * ------------------------------
 * TrajectoryRegistry
 *
 * Preserves relational trajectories
 * from which coherence, trust and
 * reputation can emerge over time.
 */

import type {
  IdentityTrajectory,
  TrajectoryEvent
} from "../trajectory/Trajectory.js";


import type {
  TrajectoryIdentity
} from "../trajectory/TrajectoryIdentity.js";


export interface TrajectoryRegistry {


  register(
    identity: TrajectoryIdentity
  ): void;


  record(
    identityId: string,
    event: TrajectoryEvent
  ): void;


  get(
    identityId: string
  ): IdentityTrajectory | undefined;


  list(): readonly string[];

}


export function createTrajectoryRegistry():
  TrajectoryRegistry {


  const trajectories =
    new Map<
      string,
      {
        identity: TrajectoryIdentity;
        events: TrajectoryEvent[];
      }
    >();


  return {


    register(
      identity: TrajectoryIdentity
    ): void {

      trajectories.set(
        identity.id,
        {
          identity,
          events: []
        }
      );

    },


    record(
      identityId: string,
      event: TrajectoryEvent
    ): void {

      const trajectory =
        trajectories.get(identityId);


      if (!trajectory) {
        return;
      }


      trajectory.events.push(
        event
      );

    },


    get(
      identityId: string
    ): IdentityTrajectory | undefined {

      const trajectory =
        trajectories.get(identityId);


      if (!trajectory) {
        return undefined;
      }


      return {

        identityId,

        events: [
          ...trajectory.events
        ]

      };

    },


    list(): readonly string[] {

      return [
        ...trajectories.keys()
      ];

    }


  };

}