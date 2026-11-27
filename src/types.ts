export type ListingKind = 'housing' | 'market';
export type ListingStatus = 'Disponível' | 'Reservado' | 'Concluído';
export type RentalPeriod = 'day' | 'week' | 'month';
export interface Listing {
  id: string; kind: ListingKind; title: string; price: number; bills: number;
  university: string; neighborhood: string; city: string; distance: number;
  category: string; tags: string[]; images: string[]; description: string;
  owner: string; course: string; initials: string; rating: string;
  badge: string; status: ListingStatus; mine: boolean; condition?: string;
  transaction?: 'sale' | 'rent'; rentalPeriod?: RentalPeriod;
}
export interface Message { id: string; text: string; sender: 'me' | 'them'; time: string }
export interface Conversation { listingId: string; messages: Message[] }
export interface DemoUser { name: string; email: string; verified: boolean }
