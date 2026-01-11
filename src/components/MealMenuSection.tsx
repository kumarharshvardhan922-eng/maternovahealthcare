import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MealMenuItem } from '@/types/healthcare';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Utensils, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  Heart,
  Users,
  Baby,
  Flame,
  Beef,
  Cookie
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const MealMenuSection = () => {
  const { mealMenu, setMealMenu, currentUser } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('pregnant');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealMenuItem | null>(null);
  
  const [formData, setFormData] = useState({
    category: 'pregnant' as 'pregnant' | 'elderly' | 'infant',
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    name: '',
    description: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ingredients: '',
  });

  const isAsha = currentUser?.role === 'asha';

  const filteredMeals = mealMenu.filter(meal => meal.category === activeCategory);
  
  const groupedMeals = {
    breakfast: filteredMeals.filter(m => m.mealType === 'breakfast'),
    lunch: filteredMeals.filter(m => m.mealType === 'lunch'),
    snack: filteredMeals.filter(m => m.mealType === 'snack'),
    dinner: filteredMeals.filter(m => m.mealType === 'dinner'),
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'pregnant': return 'Pregnant Women';
      case 'elderly': return 'Elderly';
      case 'infant': return 'Infants (6+ months)';
      default: return cat;
    }
  };

  const getMealTypeEmoji = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'snack': return '🍎';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingMeal) {
      setMealMenu(prev =>
        prev.map(m => m.id === editingMeal.id ? {
          ...m,
          ...formData,
          ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        } : m)
      );
      toast.success('Meal updated');
    } else {
      const newMeal: MealMenuItem = {
        id: Date.now().toString(),
        category: formData.category,
        mealType: formData.mealType,
        name: formData.name,
        description: formData.description,
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      };
      setMealMenu(prev => [...prev, newMeal]);
      toast.success('Meal added');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: 'pregnant',
      mealType: 'breakfast',
      name: '',
      description: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ingredients: '',
    });
    setEditingMeal(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (meal: MealMenuItem) => {
    setEditingMeal(meal);
    setFormData({
      category: meal.category,
      mealType: meal.mealType,
      name: meal.name,
      description: meal.description,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      ingredients: meal.ingredients.join(', '),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setMealMenu(prev => prev.filter(m => m.id !== id));
    toast.success('Meal deleted');
  };

  const exportData = () => {
    const csvContent = [
      ['Category', 'Meal Type', 'Name', 'Description', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Ingredients'],
      ...mealMenu.map(m => [
        m.category,
        m.mealType,
        m.name,
        m.description,
        m.calories,
        m.protein,
        m.carbs,
        m.fat,
        m.ingredients.join('; '),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-menu-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Meal menu exported');
  };

  const MealCard = ({ meal }: { meal: MealMenuItem }) => (
    <Card className="p-4 hover:shadow-soft transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-foreground">{meal.name}</h4>
        {isAsha && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(meal)}>
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(meal.id)}>
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
      
      {/* Nutrition Info */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <Flame className="w-4 h-4 mx-auto text-terracotta mb-1" />
          <p className="text-xs text-muted-foreground">Calories</p>
          <p className="font-semibold text-sm">{meal.calories}</p>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <Beef className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground">Protein</p>
          <p className="font-semibold text-sm">{meal.protein}g</p>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <Cookie className="w-4 h-4 mx-auto text-warning mb-1" />
          <p className="text-xs text-muted-foreground">Carbs</p>
          <p className="font-semibold text-sm">{meal.carbs}g</p>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <span className="text-sm">🥑</span>
          <p className="text-xs text-muted-foreground">Fat</p>
          <p className="font-semibold text-sm">{meal.fat}g</p>
        </div>
      </div>
      
      {/* Ingredients */}
      <div className="flex flex-wrap gap-1">
        {meal.ingredients.map((ing, idx) => (
          <span key={idx} className="px-2 py-0.5 bg-sage-light text-foreground rounded-full text-xs">
            {ing}
          </span>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Meal Menu</h1>
          <p className="text-muted-foreground">Nutritious meal plans for all beneficiaries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {isAsha && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Meal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMeal ? 'Edit' : 'Add'} Meal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <Select
                        value={formData.category}
                        onValueChange={(v: 'pregnant' | 'elderly' | 'infant') => 
                          setFormData(prev => ({ ...prev, category: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pregnant">Pregnant Women</SelectItem>
                          <SelectItem value="elderly">Elderly</SelectItem>
                          <SelectItem value="infant">Infants</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Meal Type *</label>
                      <Select
                        value={formData.mealType}
                        onValueChange={(v: 'breakfast' | 'lunch' | 'dinner' | 'snack') => 
                          setFormData(prev => ({ ...prev, mealType: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meal Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Sprouted Moong Chilla"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the meal"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Calories</label>
                      <Input
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Protein (g)</label>
                      <Input
                        type="number"
                        value={formData.protein}
                        onChange={(e) => setFormData(prev => ({ ...prev, protein: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Carbs (g)</label>
                      <Input
                        type="number"
                        value={formData.carbs}
                        onChange={(e) => setFormData(prev => ({ ...prev, carbs: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Fat (g)</label>
                      <Input
                        type="number"
                        value={formData.fat}
                        onChange={(e) => setFormData(prev => ({ ...prev, fat: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ingredients (comma separated)</label>
                    <Textarea
                      value={formData.ingredients}
                      onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                      placeholder="Rice, Dal, Ghee, Vegetables"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleSubmit} className="gradient-primary">
                      {editingMeal ? 'Update' : 'Add'} Meal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="pregnant" className="flex items-center gap-2 py-3">
            <Heart className="w-4 h-4 text-terracotta" />
            <span className="hidden sm:inline">Pregnant</span>
          </TabsTrigger>
          <TabsTrigger value="elderly" className="flex items-center gap-2 py-3">
            <Users className="w-4 h-4 text-sky" />
            <span className="hidden sm:inline">Elderly</span>
          </TabsTrigger>
          <TabsTrigger value="infant" className="flex items-center gap-2 py-3">
            <Baby className="w-4 h-4 text-lavender" />
            <span className="hidden sm:inline">Infants</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="text-center mb-6 p-4 bg-muted/50 rounded-xl">
            <h2 className="text-xl font-heading font-semibold">
              {getCategoryLabel(activeCategory)} Meal Plan
            </h2>
            <p className="text-muted-foreground text-sm">
              Balanced nutrition designed for optimal health
            </p>
          </div>

          {/* Meal Groups */}
          <div className="space-y-6">
            {Object.entries(groupedMeals).map(([mealType, meals]) => (
              meals.length > 0 && (
                <div key={mealType}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 capitalize">
                    {getMealTypeEmoji(mealType)} {mealType}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meals.map(meal => (
                      <MealCard key={meal.id} meal={meal} />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {filteredMeals.length === 0 && (
            <Card className="p-8 text-center">
              <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Meals Found</h3>
              <p className="text-muted-foreground">
                {isAsha ? 'Add meals for this category.' : 'No meal plans available for this category.'}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealMenuSection;
