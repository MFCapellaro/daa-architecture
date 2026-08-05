import { describe, expect, it } from "vitest";
import type { Trajectory } from "../src/Trajectory.js";

describe("Trajectory", () => {
  it("creates a coherent evolutionary path for a participant", () => {
    const trajectory: Trajectory = {
      id: "trajectory-001",
      participantId: "participant-001",
      purpose: "Enable coherent agricultural UAS collaboration",
      horizon: "Sustainable aerial agriculture ecosystem",
      orientation: "Build cooperative operational capabilities",
      course: "Develop ecosystem relationships",
      status: "emerging",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(trajectory.participantId)
      .toBe("participant-001");

    expect(trajectory.status)
      .toBe("emerging");
  });

  it("preserves coherent direction through purpose, orientation and course", () => {
    const trajectory: Trajectory = {
      id: "trajectory-002",
      participantId: "participant-002",
      purpose: "Enable regenerative agricultural collaboration",
      horizon: "Sustainable aerial ecosystem",
      orientation: "Create cooperative operational capabilities",
      course: "Develop meaningful ecosystem relationships",
      status: "aligned",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(trajectory.purpose)
      .toBeTruthy();

    expect(trajectory.orientation)
      .toBeTruthy();

    expect(trajectory.course)
      .toBeTruthy();

    expect(trajectory.status)
      .toBe("aligned");
  });

  it("reveals potential through coherent trajectory direction", () => {
    const trajectory: Trajectory = {
      id: "trajectory-003",
      participantId: "participant-003",
      purpose: "Connect distributed agricultural capabilities",
      horizon: "Collaborative UAS ecosystem",
      orientation: "Generate shared operational value",
      course: "Build ecosystem interactions",
      status: "expanding",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const revealsPotential =
      Boolean(trajectory.purpose) &&
      Boolean(trajectory.orientation) &&
      Boolean(trajectory.course);

    expect(revealsPotential)
      .toBe(true);

    expect(trajectory.status)
      .toBe("expanding");
  });
});