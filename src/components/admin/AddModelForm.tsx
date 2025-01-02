import { useState } from 'react';
import { Model } from '../types/admin';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AddModelFormProps {
  onAddModel: (model: Model) => void;
}

export function AddModelForm({ onAddModel }: AddModelFormProps) {
  const [newModel, setNewModel] = useState<Model>({
    id: '',
    name: '',
    description: '',
    isDefault: false,
    isFree: true
  });

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-4">Nieuw Model Toevoegen</h3>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="modelId">Model ID</Label>
          <Input
            id="modelId"
            value={newModel.id}
            onChange={(e) => setNewModel(prev => ({ ...prev, id: e.target.value }))}
            placeholder="bijv. google/gemini-2.0-flash-thinking-exp:free"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="modelName">Naam</Label>
          <Input
            id="modelName"
            value={newModel.name}
            onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
            placeholder="bijv. Gemini 2.0 Flash"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="modelDescription">Beschrijving</Label>
          <Input
            id="modelDescription"
            value={newModel.description}
            onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
            placeholder="bijv. Snelle, gratis versie"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isFree"
            checked={newModel.isFree}
            onCheckedChange={(checked) => 
              setNewModel(prev => ({ ...prev, isFree: checked as boolean }))
            }
          />
          <label
            htmlFor="isFree"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Gratis model
          </label>
        </div>
        <Button onClick={() => {
          onAddModel(newModel);
          setNewModel({
            id: '',
            name: '',
            description: '',
            isDefault: false,
            isFree: true
          });
        }}>
          Model Toevoegen
        </Button>
      </div>
    </div>
  );
}