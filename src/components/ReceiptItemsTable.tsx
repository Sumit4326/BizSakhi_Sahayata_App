import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: "expense" | "inventory";
}

interface ReceiptItemsTableProps {
  items: ReceiptItem[];
  merchantName?: string;
  totalAmount?: number;
  onSave: (items: ReceiptItem[]) => void;
  onCancel: () => void;
  language: "en" | "hi";
}

export function ReceiptItemsTable({
  items: initialItems,
  merchantName = "Unknown Store",
  totalAmount = 0,
  onSave,
  onCancel,
  language
}: ReceiptItemsTableProps) {
  const [items, setItems] = useState<ReceiptItem[]>(initialItems);

  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate total_price when quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const addNewItem = () => {
    const newItem: ReceiptItem = {
      name: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      category: "expense"
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Filter out empty items
    const validItems = items.filter(item => item.name.trim() !== "" && item.total_price > 0);
    
    if (validItems.length === 0) {
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "कम से कम एक वैध आइटम जोड़ें" : "Please add at least one valid item",
        variant: "destructive"
      });
      return;
    }
    
    onSave(validItems);
    toast({
      title: language === "hi" ? "सफल!" : "Success!",
      description: language === "hi" ? `${validItems.length} आइटम सेव किए गए` : `${validItems.length} items saved`
    });
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-card bg-background border-border">
      <CardHeader className="py-2 px-3 border-b">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>📋 {language === "hi" ? "आइटम्स" : "Items"}</span>
          <Badge variant="outline" className="text-xs px-2 py-1">{merchantName}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 px-3 pb-3">
        {/* Compact Items List */}
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="bg-card border rounded-lg p-2 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2">
                {/* Name - flexible */}
                <div className="flex-1 min-w-0">
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="Name"
                    className="h-7 text-xs px-2 border-primary/20 focus:border-primary w-full"
                  />
                </div>

                {/* Quantity - fixed small */}
                <div className="w-12">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                    className="h-7 text-xs px-1 border-primary/20 focus:border-primary w-full text-center"
                    placeholder="1"
                  />
                </div>

                {/* Unit Price - fixed medium */}
                <div className="w-16">
                  <div className="relative">
                    <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="h-7 pl-3 pr-1 text-xs border-primary/20 focus:border-primary w-full"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Total - fixed medium */}
                <div className="w-16">
                  <div className="text-xs font-semibold text-green-600 text-center bg-green-50 rounded px-1 py-1">
                    ₹{item.total_price.toFixed(0)}
                  </div>
                </div>

                {/* Category Toggle - fixed small */}
                <div className="w-12">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-xs">
                      {item.category === "expense" ? "💰" : "📦"}
                    </span>
                    <Switch
                      checked={item.category === "inventory"}
                      onCheckedChange={(checked) =>
                        updateItem(index, 'category', checked ? "inventory" : "expense")
                      }
                      className="scale-75"
                    />
                  </div>
                </div>

                {/* Delete - fixed tiny */}
                <div className="w-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Item Button */}
        <Button
          variant="outline"
          onClick={addNewItem}
          className="w-full h-6 text-xs px-2"
          size="sm"
        >
          ➕ {language === "hi" ? "आइटम" : "Add"}
        </Button>

        {/* Compact Summary */}
        <div className="border-t border-primary/20 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">📊 {items.length} items</span>
            <span className="font-bold text-green-600">💰 ₹{calculateTotal().toFixed(0)}</span>
            {totalAmount > 0 && <span className="text-muted-foreground">🧾 ₹{totalAmount.toFixed(0)}</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-primary hover:scale-105 transition-all duration-300 h-6 text-xs px-2"
            size="sm"
          >
            💾 {language === "hi" ? "सेव" : "Save"}
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-6 text-xs px-2"
            size="sm"
          >
            ❌ {language === "hi" ? "रद्द" : "Cancel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
