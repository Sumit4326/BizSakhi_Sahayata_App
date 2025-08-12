import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Store, DollarSign, Package } from "lucide-react";

interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit?: string;
}

interface ReceiptData {
  merchant: {
    name: string;
    address?: string;
    phone?: string;
  };
  items: ReceiptItem[];
  totals: {
    subtotal?: number;
    tax?: number;
    total: number;
  };
  total_amount: number;
  item_count: number;
  confidence?: number;
  service_used?: string;
}

interface ReceiptDisplayTableProps {
  receiptData: ReceiptData;
  language: "en" | "hi";
}

export function ReceiptDisplayTable({ receiptData, language }: ReceiptDisplayTableProps) {
  const { merchant, items, totals, total_amount, item_count, confidence, service_used } = receiptData;

  return (
    <div className="space-y-4">
      {/* Receipt Header */}
      <Card className="shadow-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Receipt className="h-5 w-5" />
            {language === "hi" ? "रसीद विवरण" : "Receipt Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Merchant Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {language === "hi" ? "दुकान:" : "Store:"}
                </span>
              </div>
              <p className="text-lg font-semibold">{merchant.name || "Unknown Store"}</p>
              {merchant.address && (
                <p className="text-sm text-muted-foreground">{merchant.address}</p>
              )}
              {merchant.phone && (
                <p className="text-sm text-muted-foreground">{merchant.phone}</p>
              )}
            </div>

            {/* Summary Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {language === "hi" ? "सारांश:" : "Summary:"}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">
                    {language === "hi" ? "कुल आइटम:" : "Total Items:"}
                  </span>{" "}
                  <span className="font-medium">{item_count}</span>
                </p>
                <p className="text-lg font-semibold text-primary">
                  <span className="text-muted-foreground text-sm">
                    {language === "hi" ? "कुल राशि:" : "Total Amount:"}
                  </span>{" "}
                  ${total_amount.toFixed(2)}
                </p>
                {confidence && (
                  <Badge variant="outline" className="text-xs">
                    {language === "hi" ? "विश्वास:" : "Confidence:"} {(confidence * 100).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {language === "hi" ? "आइटम विवरण" : "Items Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items && items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">
                      {language === "hi" ? "आइटम नाम" : "Item Name"}
                    </th>
                    <th className="text-center p-3 font-medium">
                      {language === "hi" ? "मात्रा" : "Quantity"}
                    </th>
                    <th className="text-right p-3 font-medium">
                      {language === "hi" ? "यूनिट मूल्य" : "Unit Price"}
                    </th>
                    <th className="text-right p-3 font-medium">
                      {language === "hi" ? "कुल मूल्य" : "Total Price"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.unit && item.unit !== "pieces" && (
                            <p className="text-xs text-muted-foreground">
                              {language === "hi" ? "यूनिट:" : "Unit:"} {item.unit}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary">{item.quantity}</Badge>
                      </td>
                      <td className="p-3 text-right font-mono">
                        ${item.unit_price.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-medium">
                        ${item.total_price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{language === "hi" ? "कोई आइटम नहीं मिला" : "No items found"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals Summary */}
      {(totals.subtotal || totals.tax || totals.total) && (
        <Card className="shadow-card border-primary/20">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium mb-3">
                {language === "hi" ? "राशि सारांश" : "Amount Summary"}
              </h4>
              
              {totals.subtotal && totals.subtotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === "hi" ? "उप-योग:" : "Subtotal:"}
                  </span>
                  <span className="font-mono">${totals.subtotal.toFixed(2)}</span>
                </div>
              )}
              
              {totals.tax && totals.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === "hi" ? "कर:" : "Tax:"}
                  </span>
                  <span className="font-mono">${totals.tax.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-2 font-medium text-lg">
                <span>{language === "hi" ? "कुल योग:" : "Total:"}</span>
                <span className="font-mono text-primary">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Info */}
      {service_used && (
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            {language === "hi" ? "द्वारा संसाधित:" : "Processed by:"} {service_used}
          </Badge>
        </div>
      )}
    </div>
  );
}
