import { useState, useEffect } from "react";
import { Plus, Package, Edit, Trash2, Search, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/utils/translations";
import { apiCall, API_BASE_URL } from "@/utils/api";



interface Product {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  total_value: number;
  is_low_stock: boolean;
  user_id: string;
}

interface InventoryManagementProps {
  language: string;
}

export function InventoryManagement({ language }: InventoryManagementProps) {
  const { t } = useTranslation(language);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

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

  // Fetch inventory data from backend
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/summary/inventory');

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
                     // Ensure each item has the required properties
           const validItems = (data.items || []).map((item: any) => {
             
             
                           const mappedItem = {
                id: item.id || Date.now().toString(),
                product_name: item.product_name || item.name || item.item_name || 'Unknown Product',
                quantity: item.quantity || 0,
                unit: item.unit || 'pieces',
                cost_per_unit: parseFloat(item.cost_per_unit) || parseFloat(item.unit_price) || parseFloat(item.price) || parseFloat(item.cost) || 0,
                total_value: parseFloat(item.total_value) || (parseFloat(item.quantity || 0) * (parseFloat(item.cost_per_unit) || parseFloat(item.unit_price) || parseFloat(item.price) || parseFloat(item.cost) || 0)),
                is_low_stock: item.is_low_stock || false,
                user_id: item.user_id || 'default'
              };
             
             
             return mappedItem;
           });
          setProducts(validItems);
          setTotalValue(data.total_value || 0);
          console.log('✅ Inventory data loaded:', validItems.length, 'items');
        } else {
          console.error('❌ API returned error:', data.error);
        }
      } else {
        console.error('❌ Failed to fetch inventory:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load inventory data on component mount
  useEffect(() => {
    fetchInventoryData();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.price) return;

         try {
       // Send to backend
       const endpoint = editingProduct ? `/api/inventory/${editingProduct.id}` : '/api/inventory';
       const method = editingProduct ? 'PUT' : 'POST';
       
       const response = await apiCall(endpoint, {
         method: method,
         body: JSON.stringify({
           product_name: formData.name,
           quantity: parseInt(formData.quantity),
           cost_per_unit: parseFloat(formData.price),
           unit: formData.category || "pieces"
         })
       });

             if (response.ok) {
         const result = await response.json();
         if (result.success) {
           console.log(`✅ Item ${editingProduct ? 'updated' : 'added'} successfully`);
           
           // Refresh backend data to get the latest state
           fetchInventoryData();
         } else {
           console.error('❌ API returned error:', result.error);
           alert(language === "hi" ? 
             `आइटम ${editingProduct ? 'अपडेट' : 'जोड़ने'} में त्रुटि` : 
             `Error ${editingProduct ? 'updating' : 'adding'} item`
           );
         }
       } else {
         console.error('❌ Failed to submit item:', response.status);
         alert(language === "hi" ? 
           `आइटम ${editingProduct ? 'अपडेट' : 'जोड़ने'} में त्रुटि` : 
           `Error ${editingProduct ? 'updating' : 'adding'} item`
         );
       }
    } catch (error) {
      console.error('Error submitting inventory item:', error);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.product_name,
      category: product.unit,
      quantity: product.quantity.toString(),
      price: product.cost_per_unit.toString(),
      lowStockThreshold: "5" // Default threshold
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    // Show confirmation dialog
    if (!confirm(language === "hi" ? "क्या आप वाकई इस आइटम को हटाना चाहते हैं?" : "Are you sure you want to delete this item?")) {
      return;
    }

    try {
      // Delete from backend
      const response = await apiCall(`/api/inventory/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Remove from local state
          setProducts(prev => prev.filter(p => p.id !== id));
          console.log('✅ Item deleted successfully');
        } else {
          console.error('❌ Failed to delete item:', result.error);
          alert(language === "hi" ? "आइटम हटाने में त्रुटि" : "Error deleting item");
        }
      } else {
        console.error('❌ Failed to delete item:', response.status);
        alert(language === "hi" ? "आइटम हटाने में त्रुटि" : "Error deleting item");
      }
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      alert(language === "hi" ? "आइटम हटाने में त्रुटि" : "Error deleting item");
    }
  };

  const filteredProducts = products.filter(product => {
    const name = product.product_name?.trim();
    const isValidName = name && name.length > 0;
    const matchesSearch = !searchTerm || name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    
    
    return isValidName && matchesSearch;
  });

  const lowStockProducts = products.filter(p => 
    p.is_low_stock && 
    p.product_name && 
    p.product_name.trim() !== 'Unknown Product'
  );
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

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
                   <span className="font-medium">{product.product_name || 'Unknown Product'}</span>
                   <Badge variant="destructive">
                     {product.quantity} {product.unit || 'pieces'} {language === "hi" ? "बचे हैं" : "left"}
                   </Badge>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      )}

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
          onClick={() => setShowForm(true)}
          className="bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          {language === "hi" ? "जोड़ें" : "Add"}
        </Button>
        <Button
          onClick={fetchInventoryData}
          variant="outline"
          className="shadow-button"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh') || (language === "hi" ? "रीफ्रेश" : "Refresh")}
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
                     <h3 className="font-semibold">{product.product_name || 'Unknown Product'}</h3>
                     <p className="text-sm text-muted-foreground">{product.unit || 'pieces'}</p>
                   </div>
                                     <div className="flex gap-1">
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleEdit(product)}
                       title={language === "hi" ? "संपादित करें" : "Edit"}
                     >
                       <Edit className="h-4 w-4" />
                     </Button>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleDelete(product.id)}
                       title={language === "hi" ? "हटाएं" : "Delete"}
                       className="text-destructive hover:text-destructive"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{language === "hi" ? "मात्रा:" : "Quantity:"}</span>
                    <Badge variant={product.is_low_stock ? "destructive" : "default"}>
                      {product.quantity} {product.unit}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">{language === "hi" ? "प्रति यूनिट:" : "Per Unit:"}</span>
                    <span className="font-semibold">₹{product.cost_per_unit.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">{language === "hi" ? "कुल मूल्य:" : "Total Value:"}</span>
                    <span className="font-bold text-primary">₹{product.total_value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {language === "hi" ? "इन्वेंटरी लोड हो रही है..." : "Loading inventory..."}
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && filteredProducts.length === 0 && products.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              {language === "hi" ? "कोई इन्वेंटरी आइटम नहीं मिला" : "No inventory items found"}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "hi" ?
                "चैट में 'मैंने 5 फोन खरीदे Rs.50000 में' लिखकर आइटम जोड़ें" :
                "Add items by typing 'I bought 5 phones for Rs.50000' in chat"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && filteredProducts.length === 0 && products.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === "hi" ? "खोज के लिए कोई उत्पाद नहीं मिला" : "No products match your search"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}