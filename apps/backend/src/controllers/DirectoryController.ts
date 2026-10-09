import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import type { DirectoryRepository } from "@domains/uas/ecosystem/backend/directory/DirectoryRepository.js";
import type { DirectoryNodeStatus } from "@domains/uas/ecosystem/backend/directory/DirectoryTypes.js";
import { GeocodingService } from "../../geocoding/GeocodingService.js";

// Datos simulados (Mock) mientras se configura la Base de Datos
const MOCK_ACTORS = [
  {
    id: '1',
    name: 'Dealer Central',
    email: 'contacto@dealercentral.com',
    role: 'dealer',
    location: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
    status: 'activo',
  },
  {
    id: '2',
    name: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    role: 'participante',
    location: { lat: -31.4201, lng: -64.1888 }, // Córdoba
    status: 'activo',
  },
  {
    id: '3',
    name: 'Admin General',
    email: 'admin@empresa.com',
    role: 'admin',
    location: { lat: -31.4501, lng: -64.6888 }, // Córdoba
    status: 'activo',
  },
];

export const getActors = async (req: Request, res: Response) => {
  try {
    // Retorna datos mock en lugar de consultar la BD
    return res.status(200).json(MOCK_ACTORS);
  } catch (error) {
    console.error('Error al obtener actores:', error);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
};

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