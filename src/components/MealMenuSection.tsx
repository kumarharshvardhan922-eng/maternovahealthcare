import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PrescribedMeal } from '@/types/healthcare';
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
  Cookie,
  Stethoscope,
  Hash,
  Search,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const MealMenuSection = () => {
  const { prescribedMeals, setPrescribedMeals, users, currentUser } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('pregnant');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<PrescribedMeal | null>(null);
  
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientType: 'pregnant' as 'pregnant' | 'elderly' | 'infant',
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    name: '',
    description: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ingredients: '',
    prescribedBy: '',
    specialInstructions: '',
  });

  const isAsha = currentUser?.role === 'asha';

  // Get patients for the selected category
  const categoryPatients = users.filter(u => {
    if (activeCategory === 'pregnant') return u.role === 'pregnant';
    if (activeCategory === 'elderly') return u.role === 'elderly';
    if (activeCategory === 'infant') return u.role === 'infant_family';
    return false;
  });

  // Filter meals by category and patient
  const filteredMeals = prescribedMeals.filter(meal => {
    const matchesCategory = meal.patientType === activeCategory;
    const matchesPatient = selectedPatientId === 'all' || meal.patientId === selectedPatientId;
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meal.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meal.patientId.includes(searchTerm);
    return matchesCategory && matchesPatient && matchesSearch;
  });
  
  // Group meals by patient
  const mealsByPatient = filteredMeals.reduce((acc, meal) => {
    if (!acc[meal.patientId]) {
      acc[meal.patientId] = {
        patientId: meal.patientId,
        patientName: meal.patientName,
        meals: []
      };
    }
    acc[meal.patientId].meals.push(meal);
    return acc;
  }, {} as Record<string, { patientId: string; patientName: string; meals: PrescribedMeal[] }>);

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

  const getPatientIdBadgeColor = (patientId: string) => {
    const prefix = patientId.charAt(0);
    switch (prefix) {
      case '1': return 'bg-terracotta/20 text-terracotta';
      case '2': return 'bg-sky/20 text-sky';
      case '3': return 'bg-lavender/20 text-lavender';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = users.find(u => u.patientId === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId: patient.patientId,
        patientName: patient.name,
        patientType: activeCategory as 'pregnant' | 'elderly' | 'infant',
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.patientId || !formData.name || !formData.description || !formData.prescribedBy) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingMeal) {
      setPrescribedMeals(prev =>
        prev.map(m => m.id === editingMeal.id ? {
          ...m,
          ...formData,
          ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
          prescribedDate: new Date(),
        } : m)
      );
      toast.success('Prescribed meal updated');
    } else {
      const newMeal: PrescribedMeal = {
        id: Date.now().toString(),
        patientId: formData.patientId,
        patientName: formData.patientName,
        patientType: formData.patientType,
        mealType: formData.mealType,
        name: formData.name,
        description: formData.description,
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        prescribedBy: formData.prescribedBy,
        prescribedDate: new Date(),
        specialInstructions: formData.specialInstructions,
      };
      setPrescribedMeals(prev => [...prev, newMeal]);
      toast.success('Meal prescribed successfully');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      patientName: '',
      patientType: activeCategory as 'pregnant' | 'elderly' | 'infant',
      mealType: 'breakfast',
      name: '',
      description: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ingredients: '',
      prescribedBy: '',
      specialInstructions: '',
    });
    setEditingMeal(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (meal: PrescribedMeal) => {
    setEditingMeal(meal);
    setFormData({
      patientId: meal.patientId,
      patientName: meal.patientName,
      patientType: meal.patientType,
      mealType: meal.mealType,
      name: meal.name,
      description: meal.description,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      ingredients: meal.ingredients.join(', '),
      prescribedBy: meal.prescribedBy,
      specialInstructions: meal.specialInstructions || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPrescribedMeals(prev => prev.filter(m => m.id !== id));
    toast.success('Prescribed meal deleted');
  };

  const exportData = () => {
    const csvContent = [
      ['Patient ID', 'Patient Name', 'Category', 'Meal Type', 'Meal Name', 'Description', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Ingredients', 'Prescribed By', 'Date', 'Special Instructions'],
      ...prescribedMeals.map(m => [
        m.patientId,
        m.patientName,
        m.patientType,
        m.mealType,
        m.name,
        m.description,
        m.calories,
        m.protein,
        m.carbs,
        m.fat,
        m.ingredients.join('; '),
        m.prescribedBy,
        format(m.prescribedDate, 'yyyy-MM-dd'),
        m.specialInstructions || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescribed-meals-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Prescribed meals exported');
  };

  const MealCard = ({ meal }: { meal: PrescribedMeal }) => (
    <Card className="p-4 hover:shadow-soft transition-all duration-300 group border-l-4 border-l-primary">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getMealTypeEmoji(meal.mealType)}</span>
          <div>
            <h4 className="font-semibold text-foreground">{meal.name}</h4>
            <span className="text-xs text-muted-foreground capitalize">{meal.mealType}</span>
          </div>
        </div>
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
      
      {/* Doctor Info */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <Stethoscope className="w-4 h-4 text-primary" />
        <span className="text-foreground">Prescribed by: <strong>{meal.prescribedBy}</strong></span>
        <span className="text-muted-foreground">• {format(meal.prescribedDate, 'dd MMM yyyy')}</span>
      </div>

      {/* Special Instructions */}
      {meal.specialInstructions && (
        <div className="flex items-start gap-2 mb-3 p-2 bg-warning/10 border border-warning/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground">{meal.specialInstructions}</p>
        </div>
      )}
      
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Doctor Prescribed Meals</h1>
          <p className="text-muted-foreground">Personalized meal plans prescribed for each patient</p>
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
                  Prescribe Meal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMeal ? 'Edit' : 'Prescribe'} Meal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Patient Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Patient *</label>
                    <Select
                      value={formData.patientId}
                      onValueChange={handlePatientSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryPatients.map(patient => (
                          <SelectItem key={patient.patientId} value={patient.patientId}>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-mono ${getPatientIdBadgeColor(patient.patientId)}`}>
                                {patient.patientId}
                              </span>
                              {patient.name}
                            </div>
                          </SelectItem>
                        ))}
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
                        <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                        <SelectItem value="lunch">☀️ Lunch</SelectItem>
                        <SelectItem value="snack">🍎 Snack</SelectItem>
                        <SelectItem value="dinner">🌙 Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Meal Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Iron-Rich Palak Khichdi"
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Prescribed By (Doctor Name) *</label>
                    <Input
                      value={formData.prescribedBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, prescribedBy: e.target.value }))}
                      placeholder="e.g., Dr. Anita Singh"
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
                      placeholder="Rice, Dal, Spinach, Ghee"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Special Instructions</label>
                    <Textarea
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      placeholder="e.g., Avoid spicy food, take with warm water"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleSubmit} className="gradient-primary">
                      {editingMeal ? 'Update' : 'Prescribe'} Meal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(v) => { setActiveCategory(v); setSelectedPatientId('all'); }}>
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="pregnant" className="flex items-center gap-2 py-3">
            <Heart className="w-4 h-4 text-terracotta" />
            <span className="hidden sm:inline">Pregnant (1XXXXX)</span>
          </TabsTrigger>
          <TabsTrigger value="elderly" className="flex items-center gap-2 py-3">
            <Users className="w-4 h-4 text-sky" />
            <span className="hidden sm:inline">Elderly (2XXXXX)</span>
          </TabsTrigger>
          <TabsTrigger value="infant" className="flex items-center gap-2 py-3">
            <Baby className="w-4 h-4 text-lavender" />
            <span className="hidden sm:inline">Infants (3XXXXX)</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, patient ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="All Patients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                {categoryPatients.map(patient => (
                  <SelectItem key={patient.patientId} value={patient.patientId}>
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">{patient.patientId}</span>
                      <span>- {patient.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-center mb-6 p-4 bg-muted/50 rounded-xl">
            <h2 className="text-xl font-heading font-semibold">
              {getCategoryLabel(activeCategory)} - Prescribed Meal Plans
            </h2>
            <p className="text-muted-foreground text-sm">
              Personalized nutrition prescribed by doctors for each patient
            </p>
          </div>

          {/* Meals by Patient */}
          <div className="space-y-8">
            {Object.values(mealsByPatient).length === 0 ? (
              <Card className="p-8 text-center">
                <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Prescribed Meals Found</h3>
                <p className="text-muted-foreground">
                  {isAsha ? 'Prescribe a meal plan for patients.' : 'No meal plans prescribed yet.'}
                </p>
              </Card>
            ) : (
              Object.values(mealsByPatient).map(({ patientId, patientName, meals }) => (
                <div key={patientId} className="space-y-4">
                  {/* Patient Header */}
                  <div className="flex items-center gap-3 p-4 bg-card rounded-xl border shadow-sm">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPatientIdBadgeColor(patientId)}`}>
                      <Hash className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{patientName}</h3>
                      <p className="text-sm font-mono text-muted-foreground">Patient ID: {patientId}</p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      {meals.length} meal{meals.length !== 1 ? 's' : ''} prescribed
                    </div>
                  </div>

                  {/* Patient's Meals Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l-2 border-primary/20">
                    {meals.map(meal => (
                      <MealCard key={meal.id} meal={meal} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealMenuSection;
