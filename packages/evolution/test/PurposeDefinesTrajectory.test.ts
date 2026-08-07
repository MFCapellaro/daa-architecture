import { describe, expect, it } from "vitest";

import type { Purpose } from "../../grammar/src/purpose/Purpose.js";


describe("Purpose Defines Trajectory", () => {

  it("connects purpose with coherent direction", () => {

    const purpose: Purpose = {
      kind: "Purpose"
    };


    const trajectory = {
      purpose,
      direction: "coherent-direction"
    };


    expect(trajectory.purpose.kind)
      .toBe("Purpose");


    expect(trajectory.direction)
      .toBe("coherent-direction");

  });


  it("establishes course from meaningful purpose", () => {

    const systemOrientation = {
      meaning: true,
      purpose: true,
      trajectory: true,
      course: true
    };


    expect(
      systemOrientation.meaning &&
      systemOrientation.purpose &&
      systemOrientation.trajectory
    )
      .toBe(true);


    expect(systemOrientation.course)
      .toBe(true);

  });


  it("guides evolution through coherent trajectory", () => {

    const evolution = {
      trajectory: "coherent",
      preservesIdentity: true,
      advancesPossibility: true
    };


    expect(evolution.trajectory)
      .toBe("coherent");


    expect(evolution.preservesIdentity)
      .toBe(true);


    expect(evolution.advancesPossibility)
      .toBe(true);

  });

});