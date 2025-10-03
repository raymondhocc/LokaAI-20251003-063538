import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandTerm } from "worker/types";
import { AVAILABLE_LANGUAGES } from "@/lib/constants";
import { useLokaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
type TermTranslationsDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  term: BrandTerm;
};
export function TermTranslationsDialog({ isOpen, setIsOpen, term }: TermTranslationsDialogProps) {
  const { updateBrandTermTranslations } = useLokaStore(
    useShallow((state) => ({
      updateBrandTermTranslations: state.updateBrandTermTranslations,
    }))
  );
  const [translations, setTranslations] = useState<Record<string, string>>(
    term.translations || {}
  );
  useEffect(() => {
    setTranslations(term.translations || {});
  }, [term]);
  const handleTranslationChange = (langId: string, value: string) => {
    setTranslations((prev) => ({ ...prev, [langId]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBrandTermTranslations(term.id, translations);
    setIsOpen(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Manage Translations for "{term.term}"</DialogTitle>
            <DialogDescription>
              Provide the required translations for this brand term to ensure
              consistency.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="my-4 h-[400px] pr-6">
            <div className="space-y-4">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <div key={lang.id} className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor={`trans-${lang.id}`} className="text-right">
                    {lang.name}
                  </Label>
                  <Input
                    id={`trans-${lang.id}`}
                    value={translations[lang.id] || ""}
                    onChange={(e) =>
                      handleTranslationChange(lang.id, e.target.value)
                    }
                    placeholder={`Translation for ${lang.name}`}
                    className="col-span-2"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Translations</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}