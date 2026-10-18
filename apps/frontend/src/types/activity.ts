export type ActivityKind = 'training' | 'course' | 'expo' | 'field-application' | 'event' | 'other';
export type ActivityLocationKind = 'in-person' | 'virtual';

export interface ActivityInput {
  title: string;
  kind: ActivityKind;
  description: string;
  startsAt: string;
  endsAt: string;
  locationKind: ActivityLocationKind;
  location: string;
  onlineUrl: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  registrationUrl: string;
  linkedEntities: string[];
  flyer: string;
  featured: boolean;
}

export interface Activity extends ActivityInput {
  id: string;
  visible: boolean;
  reviewed: boolean;
  source: {
    id: string;
    name: string;
    email: string;
    role: 'participante' | 'dealer' | 'admin';
  };
  createdAt: string;
  updatedAt: string;
}

export const EMPTY_ACTIVITY: ActivityInput = {
  title: '',
  kind: 'event',
  description: '',
  startsAt: '',
  endsAt: '',
  locationKind: 'in-person',
  location: '',
  onlineUrl: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  registrationUrl: '',
  linkedEntities: [],
  flyer: '',
  featured: false,
};
