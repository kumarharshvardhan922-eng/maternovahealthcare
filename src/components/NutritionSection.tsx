import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Apple, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  Heart,
  Users,
  Baby,
  Pill,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const NutritionSection = () => {
  const { nutritionRecommendations, addNutritionRecommendation, updateNutritionRecommendation, deleteNutritionRecommendation, currentUser } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('pregnant');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof nutritionRecommendations[0] | null>(null);
  
  const [formData, setFormData] = useState({
    category: 'pregnant' as 'pregnant' | 'elderly' | 'infant',
    nutrient_name: '',
    daily_requirement: '',
    unit: 'mg',
    sources: '',
    importance: '',
  });

  const isAsha = currentUser?.role === 'asha';

  const filteredItems = nutritionRecommendations.filter(item => item.category === activeCategory);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'pregnant': return 'Pregnant Women';
      case 'elderly': return 'Elderly';
      case 'infant': return 'Infants (6+ months)';
      default: return cat;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'pregnant': return 'terracotta';
      case 'elderly': return 'sky';
      case 'infant': return 'lavender';
      default: return 'primary';
    }
  };

  const handleSubmit = async () => {
    if (!formData.nutrient_name || !formData.daily_requirement) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingItem) {
      await updateNutritionRecommendation(editingItem.id, {
        ...formData,
        sources: formData.sources.split(',').map(s => s.trim()).filter(Boolean),
        importance: formData.importance || null,
      });
    } else {
      await addNutritionRecommendation({
        category: formData.category,
        nutrient_name: formData.nutrient_name,
        daily_requirement: formData.daily_requirement,
        unit: formData.unit,
        sources: formData.sources.split(',').map(s => s.trim()).filter(Boolean),
        importance: formData.importance || null,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: 'pregnant',
      nutrient_name: '',
      daily_requirement: '',
      unit: 'mg',
      sources: '',
      importance: '',
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: typeof nutritionRecommendations[0]) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      nutrient_name: item.nutrient_name,
      daily_requirement: item.daily_requirement,
      unit: item.unit,
      sources: item.sources?.join(', ') || '',
      importance: item.importance || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteNutritionRecommendation(id);
  };

  const exportData = () => {
    const csvContent = [
      ['Category', 'Nutrient', 'Daily Requirement', 'Unit', 'Food Sources', 'Importance'],
      ...nutritionRecommendations.map(n => [
        n.category,
        n.nutrient_name,
        n.daily_requirement,
        n.unit,
        n.sources?.join('; ') || '',
        n.importance || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-recommendations-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Nutrition Guide</h1>
          <p className="text-muted-foreground">Daily nutrition requirements and food sources</p>
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
                  Add Nutrient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit' : 'Add'} Nutrition Recommendation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
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
                    <label className="block text-sm font-medium mb-2">Nutrient Name *</label>
                    <Input
                      value={formData.nutrient_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, nutrient_name: e.target.value }))}
                      placeholder="e.g., Iron, Calcium, Vitamin D"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Daily Requirement *</label>
                      <Input
                        value={formData.daily_requirement}
                        onChange={(e) => setFormData(prev => ({ ...prev, daily_requirement: e.target.value }))}
                        placeholder="e.g., 27, 1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unit *</label>
                      <Select
                        value={formData.unit}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg">mg</SelectItem>
                          <SelectItem value="mcg">mcg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="IU">IU</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Food Sources (comma separated)</label>
                    <Textarea
                      value={formData.sources}
                      onChange={(e) => setFormData(prev => ({ ...prev, sources: e.target.value }))}
                      placeholder="Spinach, Dates, Jaggery, Beetroot"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Importance / Health Benefits</label>
                    <Textarea
                      value={formData.importance}
                      onChange={(e) => setFormData(prev => ({ ...prev, importance: e.target.value }))}
                      placeholder="Why is this nutrient important?"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleSubmit} className="gradient-primary">
                      {editingItem ? 'Update' : 'Add'} Nutrient
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
              {getCategoryLabel(activeCategory)} - Daily Nutrition
            </h2>
            <p className="text-muted-foreground text-sm">
              Recommended daily intake for optimal health
            </p>
          </div>

          {/* Nutrition Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="p-5 hover:shadow-soft transition-all duration-300 group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-${getCategoryColor(activeCategory)}/20 flex items-center justify-center`}>
                      <Pill className={`w-5 h-5 text-${getCategoryColor(activeCategory)}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.nutrient_name}</h4>
                      <p className="text-2xl font-bold text-primary">
                        {item.daily_requirement} <span className="text-sm font-normal text-muted-foreground">{item.unit}/day</span>
                      </p>
                    </div>
                  </div>
                  {isAsha && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Importance */}
                {item.importance && (
                  <div className="flex items-start gap-2 mb-3 p-2 bg-primary/5 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground">{item.importance}</p>
                  </div>
                )}

                {/* Food Sources */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">🍽️ Food Sources:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.sources?.map((source, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-sage-light text-foreground rounded-full text-xs">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <Card className="p-8 text-center">
              <Apple className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Recommendations Found</h3>
              <p className="text-muted-foreground">
                {isAsha ? 'Add nutrition recommendations for this category.' : 'No nutrition data available for this category.'}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NutritionSection;
