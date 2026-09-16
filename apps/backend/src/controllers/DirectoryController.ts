import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import type { DirectoryRepository } from "@domains/uas/ecosystem/backend/directory/DirectoryRepository.js";
import type { DirectoryNodeStatus } from "@domains/uas/ecosystem/backend/directory/DirectoryTypes.js";
import { GeocodingService } from "../../geocoding/GeocodingService.js";
export class DirectoryController {
  public router: Router;

  constructor(
    private directoryRepo: DirectoryRepository,
    private geocodingService: GeocodingService
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    // 🌍 Catálogo público
    this.router.get("/public", this.getPublicItems.bind(this));

    // 🔒 Panel de moderación (Backoffice)
    this.router.get("/admin", requireAuth, this.getAdminItems.bind(this));
    this.router.get("/admin/review-summary", requireAuth, this.getReviewSummary.bind(this));
    this.router.get("/admin/:id", requireAuth, this.getItemDetail.bind(this));
    this.router.patch("/admin/:id/status", requireAuth, this.updateItemStatus.bind(this));
    this.router.patch("/admin/:id/semantic", requireAuth, this.updateSemanticNotes.bind(this));
    this.router.post("/admin/:id/geocode", requireAuth, this.triggerGeocode.bind(this));
  }

  private async getPublicItems(req: Request, res: Response) {
    const query = {
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      layer: typeof req.query.layer === "string" ? req.query.layer : undefined,
      status: "PUBLIC" as DirectoryNodeStatus,
      page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 15,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
    };

    const result = await this.directoryRepo.findPaginated(query);
    return res.json(result);
  }

  private async getAdminItems(req: Request, res: Response) {
    const query = {
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      layer: typeof req.query.layer === "string" ? req.query.layer : undefined,
      status: req.query.status as DirectoryNodeStatus,
      page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 15,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
    };

    const result = await this.directoryRepo.findPaginated(query);
    return res.json(result);
  }

  private async getReviewSummary(_req: Request, res: Response) {
    const summary = await this.directoryRepo.getReviewSummary();
    return res.json(summary);
  }

  private async getItemDetail(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    const item = await this.directoryRepo.findById(id);

    if (!item) {
      return res.status(404).json({ error: "Nodo de directorio no encontrado" });
    }
    return res.json(item);
  }

  private async updateItemStatus(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    const { status } = req.body as { status: DirectoryNodeStatus };

    if (!["WAIT", "HOLD", "PUBLIC"].includes(status)) {
      return res.status(400).json({ error: "Estado de nodo inválido" });
    }

    const updated = await this.directoryRepo.updateStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: "No se pudo actualizar el estado del nodo" });
    }
    return res.json({ success: true, id, status });
  }

  private async updateSemanticNotes(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    const { notes } = req.body as { notes: string };

    const updated = await this.directoryRepo.updateSemanticNotes(id, notes ?? "");
    if (!updated) {
      return res.status(404).json({ error: "No se pudo actualizar la capa semántica" });
    }
    return res.json({ success: true, id });
  }

  private async triggerGeocode(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    const item = await this.directoryRepo.findById(id);

    if (!item) {
      return res.status(404).json({ error: "Nodo no encontrado" });
    }

    const { address, city, province } = item.geolocation;
    const geoResult = await this.geocodingService.resolveCoordinates(address, city, province);

    if (geoResult) {
      item.geolocation.latitude = geoResult.latitude;
      item.geolocation.longitude = geoResult.longitude;
      item.geolocation.status = "RESOLVED";
      return res.json({ success: true, geolocation: item.geolocation });
    }

    item.geolocation.status = "FAILED";
    return res.status(422).json({
      error: "No se pudieron obtener coordenadas de Google",
      geolocation: item.geolocation,
    });
  }
}