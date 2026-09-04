/**
 * DAA Architecture
 * ------------------------------
 * Domain: UAS Ecosystem
 *
 * Progressive Entry represents the gradual
 * incorporation of information about a Participant
 * after voluntary adhesion to DAA.
 *
 * It does not represent participation status.
 * It does not represent relationships.
 * It does not represent map visibility.
 *
 * Information status is derived from the
 * progressive entry of participant information.
 */

export type ParticipantInformationStatus =
  | "initial"
  | "medium"
  | "advanced";

/**
 * Information progressively incorporated
 * about a Participant.
 */
export interface ProgressiveEntry {
  /**
   * Participant receiving the progressive entry.
   */
  participantId: string;

  /**
   * Identity information has been incorporated.
   */
  identity: boolean;

  /**
   * Profile information has been incorporated.
   */
  profile: boolean;

  /**
   * Capabilities information has been incorporated.
   */
  capabilities: boolean;

  /**
   * Interests or areas of activity have been incorporated.
   */
  interests: boolean;
}

/**
 * Derives the information status of a Participant
 * from the information progressively incorporated.
 *
 * The status is an internal signal for the
 * Participant List and is not a map representation.
 */
export function deriveParticipantInformationStatus(
  entry: ProgressiveEntry,
): ParticipantInformationStatus {
  const dimensions = [
    entry.identity,
    entry.profile,
    entry.capabilities,
    entry.interests,
  ];

  const completed = dimensions.filter(Boolean).length;

  if (completed <= 1) {
    return "initial";
  }

  if (completed <= 3) {
    return "medium";
  }

  return "advanced";
}