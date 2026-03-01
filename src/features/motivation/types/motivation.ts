export interface MotivationItem {
  id: string;
  type: 'quote' | 'image';
  content: string; 
  author?: string; 
  createdAt: string;
}
