import { Router, Request, Response } from 'express';

export const operatorsRouter = Router();

export interface Actor {
  id: string;
  name: string;
  type: 'company' | 'person' | 'institution';
  layers: string[];
  capabilities: string;
  contact: boolean;
  geo: boolean;
  presence: boolean;
  status: 'PUBLIC' | 'WAIT' | 'HOLD' | 'DUPLICADO';
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  latitude?: number | null;
  longitude?: number | null;
  website?: string;
  websiteStatus?: boolean;
  redes?: boolean;
}

let ACTORS_DATA: Actor[] = [
  {
    id: 'agro-dronestl-srl',
    name: 'AGRO DRONESTL SRL',
    type: 'company',
    layers: ['drones'],
    capabilities: '-0-',
    contact: true,
    geo: true,
    presence: true,
    status: 'PUBLIC',
    address: 'Ruta Nacional 5 y Acceso García Salinas',
    city: 'Trenque Lauquen',
    province: 'Buenos Aires',
    phone: '+54 239 2675544',
    whatsapp: null as any,
    email: 'admin.agrodrones@nova.net.ar',
    latitude: null,
    longitude: null,
    website: 'https://agro-drones.com/',
    websiteStatus: true,
    redes: false,
  },
  {
    id: 'bidcom-agro',
    name: 'Bidcom Agro',
    type: 'company',
    layers: ['drones'],
    capabilities: '-0-',
    contact: true,
    geo: true,
    presence: true,
    status: 'WAIT',
    address: 'Av. Cabildo 2000',
    city: 'CABA',
    province: 'Buenos Aires',
    phone: '+54 11 5258 0700',
    email: 'contacto@bidcom.com.ar',
  },
  {
    id: 'agro-la-nair',
    name: 'Agro La Nair',
    type: 'company',
    layers: ['drones-dealers'],
    capabilities: '-0-',
    contact: true,
    geo: true,
    presence: false,
    status: 'HOLD',
    address: 'Ruta 8 Km 120',
    city: 'Pergamino',
    province: 'Buenos Aires',
  }
];

// Obtener actores (con filtro publicOnly para el Frontend público)
operatorsRouter.get('/api/operators', (req: Request, res: Response) => {
  const { publicOnly } = req.query;
  if (publicOnly === 'true') {
    return res.json(ACTORS_DATA.filter((a) => a.status === 'PUBLIC'));
  }
  res.json(ACTORS_DATA);
});

// Actualizar campos o estado del Actor en contexto
operatorsRouter.put('/api/operators/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = ACTORS_DATA.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Actor no encontrado' });
  }

  ACTORS_DATA[index] = { ...ACTORS_DATA[index], ...req.body };
  res.json(ACTORS_DATA[index]);
});