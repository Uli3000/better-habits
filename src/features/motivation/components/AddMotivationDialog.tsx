import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Quote, ImagePlus } from 'lucide-react';

interface AddMotivationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuote: (content: string, author?: string) => void;
  onAddImage: (url: string) => void;
}

export function AddMotivationDialog({ isOpen, onClose, onAddQuote, onAddImage }: AddMotivationDialogProps) {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleAddQuote = () => {
    if (!quote.trim()) return;
    onAddQuote(quote.trim(), author.trim() || undefined);
    setQuote('');
    setAuthor('');
    onClose();
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    onAddImage(imageUrl.trim());
    setImageUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">Nueva inspiración</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="quote" className="mt-2">
          <TabsList className="w-full bg-secondary">
            <TabsTrigger value="quote" className="flex-1 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Quote size={16} />
              Frase
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ImagePlus size={16} />
              Imagen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quote" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Tu frase motivacional</label>
              <Textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Escribe una frase que te inspire..."
                className="bg-secondary border-border text-foreground min-h-[100px] resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Autor (opcional)</label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ej: Marco Aurelio"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <Button onClick={handleAddQuote} disabled={!quote.trim()} className="w-full gradient-primary text-primary-foreground font-semibold">
              Guardar frase
            </Button>
          </TabsContent>

          <TabsContent value="image" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">URL de la imagen</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            {imageUrl.trim() && (
              <div className="rounded-xl overflow-hidden border border-border">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <Button onClick={handleAddImage} disabled={!imageUrl.trim()} className="w-full gradient-primary text-primary-foreground font-semibold">
              Guardar imagen
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
