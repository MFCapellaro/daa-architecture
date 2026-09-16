import type {
  DirectoryItemSummaryDTO,
  DirectoryItemDetailDTO,
  DirectoryQueryDTO,
  DirectoryReviewSummaryDTO,
  DirectoryNodeStatus,
} from "./DirectoryTypes.js";

export interface DirectoryRepository {
  findPaginated(query: DirectoryQueryDTO): Promise<{
    items: DirectoryItemSummaryDTO[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  findById(id: string): Promise<DirectoryItemDetailDTO | null>;
  getReviewSummary(): Promise<DirectoryReviewSummaryDTO>;
  updateStatus(id: string, status: DirectoryNodeStatus): Promise<boolean>;
  updateSemanticNotes(id: string, notes: string): Promise<boolean>;
}