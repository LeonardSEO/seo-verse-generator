import { Model } from '../types/admin';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ModelListProps {
  models: Model[];
  defaultFreeModel: string;
  defaultPremiumModel: string;
  onSetDefaultFreeModel: (modelId: string) => void;
  onSetDefaultPremiumModel: (modelId: string) => void;
  onRemoveModel: (modelId: string) => void;
}

export function ModelList({
  models,
  defaultFreeModel,
  defaultPremiumModel,
  onSetDefaultFreeModel,
  onSetDefaultPremiumModel,
  onRemoveModel
}: ModelListProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-4">Beschikbare Modellen</h3>
      <div className="space-y-4">
        {models.map((model) => (
          <div key={model.id} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RadioGroup
                      value={defaultFreeModel}
                      onValueChange={onSetDefaultFreeModel}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={model.id} id={`free-${model.id}`} />
                        <label htmlFor={`free-${model.id}`} className="text-sm text-gray-600">
                          Gratis Default
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroup
                      value={defaultPremiumModel}
                      onValueChange={onSetDefaultPremiumModel}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={model.id} id={`premium-${model.id}`} />
                        <label htmlFor={`premium-${model.id}`} className="text-sm text-gray-600">
                          Premium Default
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div>
                  <p className="font-medium">{model.name}</p>
                  <p className="text-sm text-gray-600">{model.id}</p>
                  <p className="text-sm text-gray-500">{model.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {model.isFree && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Gratis</span>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemoveModel(model.id)}
              >
                Verwijder
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}