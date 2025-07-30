import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
}

interface Category {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  type: "income" | "expense" | "both";
}

// Mock categories - in real app, these would be fetched from API
const categories: Category[] = [
  { id: "1", name: "Sales", nameHi: "बिक्री", icon: "🛍️", type: "income" },
  { id: "2", name: "Service", nameHi: "सेवा", icon: "🔧", type: "income" },
  { id: "3", name: "Materials", nameHi: "सामग्री", icon: "📦", type: "expense" },
  { id: "4", name: "Transport", nameHi: "परिवहन", icon: "🚛", type: "expense" },
  { id: "5", name: "Rent", nameHi: "किराया", icon: "🏠", type: "expense" },
  { id: "6", name: "Utilities", nameHi: "उपयोगिताएं", icon: "💡", type: "expense" },
];

interface IncomeExpenseTrackerProps {
  language: string;
}

export function IncomeExpenseTracker({ language }: IncomeExpenseTrackerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income",
      amount: 2500,
      category: "Sales",
      description: "Saree sales today",
      date: new Date()
    },
    {
      id: "2",
      type: "expense",
      amount: 800,
      category: "Materials",
      description: "Fabric purchase",
      date: new Date(Date.now() - 86400000)
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    category: "",
    description: ""
  });

  const [filter, setFilter] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: new Date()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setFormData({ type: "income", amount: "", category: "", description: "" });
    setShowForm(false);
  };

  const filteredCategories = categories.filter(cat => 
    cat.type === formData.type || cat.type === "both"
  );

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const getCategoryName = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return language === "hi" ? category?.nameHi || categoryName : categoryName;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "hi" ? "कुल आय" : "Total Income"}
                </p>
                <p className="text-2xl font-bold text-secondary">₹{totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "hi" ? "कुल खर्च" : "Total Expense"}
                </p>
                <p className="text-2xl font-bold text-destructive">₹{totalExpense.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "hi" ? "शुद्ध लाभ" : "Net Profit"}
                </p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-secondary" : "text-destructive"}`}>
                  ₹{Math.abs(netProfit).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Button */}
      <Button
        onClick={() => setShowForm(!showForm)}
        className="w-full h-12"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        {language === "hi" ? "नया लेन-देन जोड़ें" : "Add New Transaction"}
      </Button>

      {/* Transaction Form */}
      {showForm && (
        <Card className="shadow-warm animate-fade-in">
          <CardHeader>
            <CardTitle>
              {language === "hi" ? "नया लेन-देन" : "New Transaction"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs value={formData.type} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, type: value as "income" | "expense", category: "" }))
              }>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="income">
                    {language === "hi" ? "आय" : "Income"}
                  </TabsTrigger>
                  <TabsTrigger value="expense">
                    {language === "hi" ? "खर्च" : "Expense"}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label>{language === "hi" ? "राशि (₹)" : "Amount (₹)"}</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder={language === "hi" ? "राशि दर्ज करें" : "Enter amount"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "hi" ? "श्रेणी" : "Category"}</Label>
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "hi" ? "श्रेणी चुनें" : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{language === "hi" ? category.nameHi : category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === "hi" ? "विवरण" : "Description"}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={language === "hi" ? "विवरण (वैकल्पिक)" : "Description (optional)"}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {language === "hi" ? "जोड़ें" : "Add"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {language === "hi" ? "रद्द करें" : "Cancel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{language === "hi" ? "हाल के लेन-देन" : "Recent Transactions"}</CardTitle>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            {language === "hi" ? "फ़िल्टर" : "Filter"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === "income" ? "bg-secondary text-secondary-foreground" : "bg-destructive text-destructive-foreground"
                  }`}>
                    {transaction.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{getCategoryName(transaction.category)}</p>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === "income" ? "text-secondary" : "text-destructive"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}