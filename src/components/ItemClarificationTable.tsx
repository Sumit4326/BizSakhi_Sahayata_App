import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, X, Package, Receipt } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiCall, API_BASE_URL } from "@/utils/api";

interface ClarificationItem {
  name: string;
  quantity: number;
  amount: number;
  cost_per_unit: number;
  unit: string;
  suggested_category: string;
  description?: string;
}

interface ItemClarificationTableProps {
  items: ClarificationItem[];
  onConfirm: (confirmedItems: any[]) => void;
  onCancel: () => void;
  language: string;
}



export function ItemClarificationTable({ 
  items, 
  onConfirm, 
  onCancel, 
  language 
}: ItemClarificationTableProps) {
  const [editableItems, setEditableItems] = useState(
    items.map((item, index) => ({
      id: index,
      name: item.name,
      quantity: item.quantity,
      amount: item.amount,
      cost_per_unit: item.cost_per_unit,
      unit: item.unit,
      category: item.suggested_category,
      isEditing: true // Make all items editable by default
    }))
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleCategory = (id: number) => {
    setEditableItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newCategory = item.category === 'inventory' ? 'expense' : 'inventory';
          return { ...item, category: newCategory };
        }
        return item;
      })
    );
  };

  const handleFieldChange = (id: number, field: string, value: any) => {
    setEditableItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };

          // Recalculate cost_per_unit if quantity or amount changes
          if (field === 'quantity' || field === 'amount') {
            const qty = field === 'quantity' ? parseFloat(value) || 1 : (item.quantity || 1);
            const amt = field === 'amount' ? parseFloat(value) || 0 : (item.amount || 0);
            updated.cost_per_unit = qty > 0 ? amt / qty : 0;
          }

          // Recalculate amount if cost_per_unit changes
          if (field === 'cost_per_unit') {
            const costPerUnit = parseFloat(value) || 0;
            updated.amount = costPerUnit * (item.quantity || 1);
          }

          return updated;
        }
        return item;
      })
    );
  };

  const handleConfirm = async () => {
    setIsProcessing(true);

    try {
      const response = await apiCall('/api/chat/confirm-items', {
        method: 'POST',
        body: JSON.stringify({
          items: editableItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            amount: item.amount,
            cost_per_unit: item.cost_per_unit,
            unit: item.unit,
            category: item.category
          }))
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: language === "hi" ? "सफलतापूर्वक सहेजा गया" : "Successfully Saved",
          description: result.message || `${result.processed_count} items processed`,
        });
        
        onConfirm(result.business_results || []);
      } else {
        throw new Error('Failed to process items');
      }
    } catch (error) {
      console.error('Error confirming items:', error);
      toast({
        title: language === "hi" ? "त्रुटि" : "Error",
        description: language === "hi" ? "आइटम सहेजने में त्रुटि हुई" : "Error saving items",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };



  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {language === "hi" 
              ? "कृपया आइटम की जांच करें और पुष्टि करें" 
              : "Please Review and Confirm Items"}
          </span>
          <Badge variant="outline">
            {editableItems.length} {language === "hi" ? "आइटम" : "items"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {editableItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                {/* Item Name */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    {language === "hi" ? "आइटम का नाम" : "Item Name"}
                  </Label>
                  <Input
                    value={item.name}
                    onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                    className="mt-1"
                    placeholder="Enter item name"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    {language === "hi" ? "मात्रा" : "Quantity"}
                  </Label>
                  <Input
                    type="number"
                    value={item.quantity || 0}
                    onChange={(e) => handleFieldChange(item.id, 'quantity', e.target.value)}
                    className="mt-1"
                    min="1"
                    step="1"
                  />
                </div>

                {/* Total Amount */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    {language === "hi" ? "कुल राशि" : "Total Amount"}
                  </Label>
                  <Input
                    type="number"
                    value={item.amount || 0}
                    onChange={(e) => handleFieldChange(item.id, 'amount', e.target.value)}
                    className="mt-1"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Cost per unit (editable) */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    {language === "hi" ? "प्रति यूनिट" : "Per Unit"}
                  </Label>
                  <Input
                    type="number"
                    value={item.cost_per_unit || 0}
                    onChange={(e) => handleFieldChange(item.id, 'cost_per_unit', e.target.value)}
                    className="mt-1"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Category Toggle */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    {language === "hi" ? "श्रेणी" : "Category"}
                  </Label>
                  <div className="flex items-center space-x-3 p-2 border rounded-md bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Receipt className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">
                        {language === "hi" ? "खर्च" : "Expense"}
                      </span>
                    </div>
                    <Switch
                      checked={item.category === 'inventory'}
                      onCheckedChange={() => toggleCategory(item.id)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {language === "hi" ? "स्टॉक" : "Inventory"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary row */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {item.quantity} × ₹{(item.cost_per_unit || 0).toLocaleString()} = ₹{(item.amount || 0).toLocaleString()}
                  </span>
                  <Badge
                    variant={item.category === 'inventory' ? 'default' : 'secondary'}
                    className={item.category === 'inventory' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}
                  >
                    {item.category === 'inventory'
                      ? (language === "hi" ? "स्टॉक में जाएगा" : "Goes to Inventory")
                      : (language === "hi" ? "खर्च में जाएगा" : "Goes to Expenses")
                    }
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            <X className="h-4 w-4 mr-2" />
            {language === "hi" ? "रद्द करें" : "Cancel"}
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing}>
            <Check className="h-4 w-4 mr-2" />
            {isProcessing 
              ? (language === "hi" ? "सहेज रहे हैं..." : "Saving...") 
              : (language === "hi" ? "पुष्टि करें" : "Confirm & Save")
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
