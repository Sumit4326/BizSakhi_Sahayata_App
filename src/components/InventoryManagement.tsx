import { useState } from "react";
import { Plus, Package, Edit, Trash2, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { VoiceInput } from "@/components/VoiceInput";
import { useTranslation } from "@/utils/translations";

interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  lastUpdated: Date;
}

interface InventoryManagementProps {
  language: string;
}

export function InventoryManagement({ language }: InventoryManagementProps) {
  const { t } = useTranslation(language);
  const [products, setProducts] = useState<Product[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    lowStockThreshold: ""
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: "",
      price: "",
      lowStockThreshold: ""
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.price) return;

    const productData = {
      name: formData.name,
      category: formData.category || "General",
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
      lastUpdated: new Date()
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...productData }
          : p
      ));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...productData
      };
      setProducts(prev => [newProduct, ...prev]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity.toString(),
      price: product.price.toString(),
      lowStockThreshold: product.lowStockThreshold.toString()
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.quantity <= p.lowStockThreshold);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

  const handleVoiceResult = (text: string, parsedData?: any) => {
    // Parse voice commands like "Add 5 sarees to inventory" or "Stock 10 vegetables"
    const addKeywords = ['add', 'stock', 'inventory', 'जोड़ें', 'स्टॉक'];
    const lowercaseText = text.toLowerCase();
    
    if (addKeywords.some(keyword => lowercaseText.includes(keyword))) {
      const quantityMatch = text.match(/(\d+)/);
      const quantity = quantityMatch ? quantityMatch[1] : '';
      
      // Extract item name (remove numbers and keywords)
      const itemName = text
        .replace(/\d+/g, '')
        .replace(/(add|stock|inventory|to|जोड़ें|स्टॉक|में)/gi, '')
        .trim();
      
      setFormData({
        name: itemName,
        category: "",
        quantity: quantity,
        price: "",
        lowStockThreshold: "5"
      });
      setShowForm(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "hi" ? "कुल आइटम" : "Total Items"}
                </p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "hi" ? "कुल मूल्य" : "Total Value"}
                </p>
                <p className="text-2xl font-bold text-secondary">₹{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "hi" ? "कम स्टॉक" : "Low Stock"}
                </p>
                <p className="text-2xl font-bold text-destructive">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-destructive shadow-warm">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {language === "hi" ? "कम स्टॉक चेतावनी!" : "Low Stock Alert!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-destructive/10 rounded">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="destructive">
                    {product.quantity} {language === "hi" ? "बचे हैं" : "left"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Input */}
      <VoiceInput
        language={language}
        onResult={handleVoiceResult}
        placeholder={language === "hi" ? 
          "जैसे: 5 साड़ी स्टॉक में जोड़ें" : 
          "e.g: Add 5 sarees to stock"
        }
      />

      {/* Search and Add Button */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('common.search') + "..."}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('common.add')}
        </Button>
      </div>

      {/* Product Form */}
      {showForm && (
        <Card className="shadow-warm animate-fade-in">
          <CardHeader>
            <CardTitle>
              {editingProduct 
                ? (language === "hi" ? "उत्पाद संपादित करें" : "Edit Product")
                : (language === "hi" ? "नया उत्पाद जोड़ें" : "Add New Product")
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "hi" ? "उत्पाद का नाम" : "Product Name"}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={language === "hi" ? "उत्पाद का नाम" : "Product name"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === "hi" ? "श्रेणी" : "Category"}</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder={language === "hi" ? "श्रेणी" : "Category"}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === "hi" ? "मात्रा" : "Quantity"}</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder={language === "hi" ? "मात्रा" : "Quantity"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === "hi" ? "मूल्य (₹)" : "Price (₹)"}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder={language === "hi" ? "मूल्य" : "Price"}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>{language === "hi" ? "कम स्टॉक सीमा" : "Low Stock Threshold"}</Label>
                  <Input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                    placeholder={language === "hi" ? "न्यूनतम स्टॉक" : "Minimum stock level"}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProduct 
                    ? (language === "hi" ? "अपडेट करें" : "Update")
                    : (language === "hi" ? "जोड़ें" : "Add")
                  }
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="shadow-card">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{language === "hi" ? "मात्रा:" : "Quantity:"}</span>
                    <Badge variant={product.quantity <= product.lowStockThreshold ? "destructive" : "default"}>
                      {product.quantity}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">{language === "hi" ? "मूल्य:" : "Price:"}</span>
                    <span className="font-semibold">₹{product.price}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">{language === "hi" ? "कुल मूल्य:" : "Total Value:"}</span>
                    <span className="font-bold text-primary">₹{(product.quantity * product.price).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === "hi" ? "कोई उत्पाद नहीं मिला" : "No products found"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}