'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ItemType = 'TEMPLATE' | 'SNIPPET' | 'CONSULTING' | 'COURSE';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  priceCents: number;
  tags: string[];
  previewUrl?: string;
  seller: {
    id: string;
    handle: string;
    name: string;
    image?: string;
  };
}

const itemTypeColors: Record<ItemType, string> = {
  TEMPLATE: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  SNIPPET: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  CONSULTING: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  COURSE: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
};

export default function Marketplace() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/items`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load marketplace items:', err);
        setLoading(false);
      });
  }, []);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted" />
              <CardHeader>
                <div className="h-6 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover templates, code snippets, courses, and consulting services from top developers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            {item.previewUrl && (
              <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                <img
                  src={item.previewUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <Badge className={`absolute top-2 right-2 ${itemTypeColors[item.type]}`}>
                  {item.type}
                </Badge>
              </div>
            )}
            {!item.previewUrl && (
              <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="text-6xl">
                  {item.type === 'TEMPLATE' && '📦'}
                  {item.type === 'SNIPPET' && '💾'}
                  {item.type === 'CONSULTING' && '👨‍💻'}
                  {item.type === 'COURSE' && '🎓'}
                </div>
                <Badge className={`absolute top-2 right-2 ${itemTypeColors[item.type]}`}>
                  {item.type}
                </Badge>
              </div>
            )}
            
            <CardHeader className="flex-1">
              <CardTitle className="line-clamp-2">{item.title}</CardTitle>
              <CardDescription className="line-clamp-3">{item.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.slice(0, 4).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {item.seller.image && (
                  <img
                    src={item.seller.image}
                    alt={item.seller.name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span>by {item.seller.name || `@${item.seller.handle}`}</span>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-4 border-t">
              <div className="text-2xl font-bold">{formatPrice(item.priceCents)}</div>
              <Button>View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-4">
            No marketplace items found
          </p>
        </div>
      )}
    </div>
  );
}
