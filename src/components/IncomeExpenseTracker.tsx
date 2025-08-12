import { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Calendar, Filter, RefreshCw, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/utils/translations";
import { apiCall, API_BASE_URL } from "@/utils/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

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
  const { t } = useTranslation(language);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [backendData, setBackendData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    recentTransactions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    category: "",
    description: ""
  });

  const [filter, setFilter] = useState("all");

  // Helper function to extract actual UUID from prefixed transaction ID
  const extractUUID = (transactionId: string): string => {
    // Remove prefix like "income_" or "expense_" to get the actual UUID
    return transactionId.replace(/^(income_|expense_)/, '');
  };

  // Fetch data from backend
  const fetchBackendData = async () => {
    try {
      setIsLoading(true);

      // Fetch income and expense summaries
      const [incomeResponse, expenseResponse] = await Promise.all([
        apiCall('/api/summary/income'),
        apiCall('/api/summary/expense')
      ]);

      if (incomeResponse.ok && expenseResponse.ok) {
        const incomeData = await incomeResponse.json();
        const expenseData = await expenseResponse.json();

        if (incomeData.success && expenseData.success) {
          setBackendData({
            totalIncome: incomeData.total_income || 0,
            totalExpenses: expenseData.total_expenses || 0,
            recentTransactions: [
              ...incomeData.recent_transactions.map((t: any) => ({
                id: `income_${t.id}`,
                type: 'income',
                amount: t.amount,
                category: t.category,
                description: t.description,
                date: new Date(t.date)
              })),
              ...expenseData.recent_transactions.map((t: any) => ({
                id: `expense_${t.id}`,
                type: 'expense',
                amount: t.amount,
                category: t.category,
                description: t.description,
                date: new Date(t.date)
              }))
            ].sort((a, b) => b.date.getTime() - a.date.getTime())
          });
        }
      }
    } catch (error) {
      console.error("Error fetching backend data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // Refresh data when component becomes visible (user returns to this tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBackendData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    try {
      // Determine endpoint and method based on whether we're editing or adding
      const isEditing = editingTransaction !== null;
      const baseEndpoint = formData.type === "income" ? "/api/income" : "/api/expenses";
      const endpoint = isEditing ? `${baseEndpoint}/${extractUUID(editingTransaction!.id)}` : baseEndpoint;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await apiCall(endpoint, {
        method: method,
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          description: formData.description,
          category: formData.category,
          language: language
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`✅ Transaction ${isEditing ? 'updated' : 'added'} successfully`);
          
          // Reset form and refresh data
          setFormData({ type: "income", amount: "", category: "", description: "" });
          setEditingTransaction(null);
          setShowForm(false);
          
          // Refresh backend data
          fetchBackendData();
        } else {
          console.error('❌ API returned error:', result.error);
          alert(language === "hi" ? 
            `लेन-देन ${isEditing ? 'अपडेट' : 'जोड़ने'} में त्रुटि` : 
            `Error ${isEditing ? 'updating' : 'adding'} transaction`
          );
        }
      } else {
        console.error('❌ Failed to submit transaction:', response.status);
        alert(language === "hi" ? 
          `लेन-देन ${isEditing ? 'अपडेट' : 'जोड़ने'} में त्रुटि` : 
          `Error ${isEditing ? 'updating' : 'adding'} transaction`
        );
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert(language === "hi" ? "लेन-देन सबमिट करने में त्रुटि" : "Error submitting transaction");
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description
    });
    setShowForm(true);
  };

  const handleDelete = async (transaction: Transaction) => {
    if (!confirm(language === "hi" ? "क्या आप वाकई इस लेन-देन को हटाना चाहते हैं?" : "Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const baseEndpoint = transaction.type === "income" ? "/api/income" : "/api/expenses";
      const endpoint = `${baseEndpoint}/${extractUUID(transaction.id)}`;
      
      const response = await apiCall(endpoint, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ Transaction deleted successfully');
          // Refresh backend data
          fetchBackendData();
        } else {
          console.error('❌ Failed to delete transaction:', result.error);
          alert(language === "hi" ? "लेन-देन हटाने में त्रुटि" : "Error deleting transaction");
        }
      } else {
        console.error('❌ Failed to delete transaction:', response.status);
        alert(language === "hi" ? "लेन-देन हटाने में त्रुटि" : "Error deleting transaction");
      }
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      alert(language === "hi" ? "लेन-देन हटाने में त्रुटि" : "Error deleting transaction");
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.type === formData.type || cat.type === "both"
  );

  // Combine local and backend data
  const localIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const localExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = backendData.totalIncome + localIncome;
  const totalExpense = backendData.totalExpenses + localExpense;
  const netProfit = totalIncome - totalExpense;

  // Combine transactions for display
  const allTransactions = [...backendData.recentTransactions, ...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime());

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
                  {t('income.total')}
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
                  {t('income.totalExpense')}
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
              <div className="w-full">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {t('income.netProfit')}/
                    <span className="text-muted-foreground">{t('income.loss')}</span>
                  </p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${netProfit >= 0 ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"}`}>
                    {netProfit >= 0 ? t('income.profit').toUpperCase() : t('income.loss').toUpperCase()}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-secondary" : "text-destructive"}`}>
                  ₹{Math.abs(netProfit).toLocaleString()}
                </p>
                
                {/* Profit/Loss Graph */}
                <div className="mt-3 h-32">
                  <ChartContainer
                    config={{
                      income: { color: "#16a34a" },
                      expense: { color: "#dc2626" }
                    }}
                  >
                    <BarChart
                      data={[
                        { name: t('income.income'), value: totalIncome, category: "income" },
                        { name: t('income.expense'), value: totalExpense, category: "expense" }
                      ]}
                      margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                    >
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                      <YAxis hide />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        fillOpacity={0.9}
                        name={t('income.summary')}
                        isAnimationActive={true}
                        animationDuration={500}
                        barSize={30}
                      >
                        {/* Custom fill colors for income (green) and expense (red) */}
                        {[
                          { name: t('income.income'), value: totalIncome, category: "income" },
                          { name: t('income.expense'), value: totalExpense, category: "expense" }
                        ].map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.category === "income" ? "#16a34a" : "#dc2626"} 
                          />
                        ))}
                      </Bar>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold">{data.name}</span>
                                  <span className="text-xs">₹{data.value.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Button */}
      <Button
        onClick={() => {
          setShowForm(!showForm);
          if (!showForm) {
            setEditingTransaction(null);
            setFormData({ type: "income", amount: "", category: "", description: "" });
          }
        }}
        className="w-full h-12 bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-glow"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        {t('income.addTransaction')}
      </Button>

      {/* Transaction Form */}
      {showForm && (
        <Card className="shadow-warm animate-fade-in">
          <CardHeader>
            <CardTitle>
              {editingTransaction 
                ? (language === "hi" ? "लेन-देन संपादित करें" : "Edit Transaction")
                : (language === "hi" ? "नया लेन-देन" : "New Transaction")
              }
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
                  {editingTransaction ? (language === "hi" ? "अपडेट करें" : "Update") : (language === "hi" ? "जोड़ें" : "Add")}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingTransaction(null);
                  setFormData({ type: "income", amount: "", category: "", description: "" });
                }}>
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBackendData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {language === "hi" ? "रीफ्रेश" : "Refresh"}
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {language === "hi" ? "फ़िल्टर" : "Filter"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">
                {language === "hi" ? "लोड हो रहा है..." : "Loading..."}
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {allTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {language === "hi" ? "कोई लेन-देन नहीं मिला" : "No transactions found"}
                </p>
              ) : (
                allTransactions.map((transaction) => (
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
                <div className="flex items-center gap-2">
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
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                      title={language === "hi" ? "संपादित करें" : "Edit"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction)}
                      title={language === "hi" ? "हटाएं" : "Delete"}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}