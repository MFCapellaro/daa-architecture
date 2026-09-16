import type { DirectoryRepository } from "./DirectoryRepository.js";
import type {
  DirectoryItemDetailDTO,
  DirectoryQueryDTO,
  DirectoryReviewSummaryDTO,
  DirectoryNodeStatus,
} from "./DirectoryTypes.js";

export class YamlDirectoryRepository implements DirectoryRepository {
  private items: DirectoryItemDetailDTO[] = [];

  constructor(initialData: DirectoryItemDetailDTO[] = []) {
    this.items = initialData;
  }

  async findPaginated(query: DirectoryQueryDTO) {
    let filtered = [...this.items];

    if (query.status) {
      filtered = filtered.filter((i) => i.status === query.status);
    }
    if (query.category) {
      filtered = filtered.filter(
        (i) => i.layers.includes(query.category!) || i.type === query.category
      );
    }
    if (query.search) {
      const term = query.search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.id.toLowerCase().includes(term)
      );
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 15;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;

    return {
      items: filtered.slice(start, start + limit),
      total,
      page,
      totalPages,
    };
  }

  async findById(id: string): Promise<DirectoryItemDetailDTO | null> {
    return this.items.find((i) => i.id === id) ?? null;
  }

  async getReviewSummary(): Promise<DirectoryReviewSummaryDTO> {
    const waitingCount = this.items.filter((i) => i.status === "WAIT").length;
    const holdCount = this.items.filter((i) => i.status === "HOLD").length;

    return {
      totalRequiringAttention: waitingCount + holdCount,
      waitingCount,
      holdCount,
      duplicatesCount: 0,
    };
  }

  async updateStatus(id: string, status: DirectoryNodeStatus): Promise<boolean> {
    const item = this.items.find((i) => i.id === id);
    if (!item) return false;

    item.status = status;
    item.isWait = status === "WAIT";
    item.isHold = status === "HOLD";
    item.isPublic = status === "PUBLIC";
    return true;
  }

  async updateSemanticNotes(id: string, notes: string): Promise<boolean> {
    const item = this.items.find((i) => i.id === id);
    if (!item) return false;

    item.semanticNotes = notes;
    return true;
  }
}