import { useState, useEffect } from "react";
import { useLokaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit, Loader2, Languages } from "lucide-react";
import { BrandTerm } from "worker/types";
import { Toaster } from "@/components/ui/sonner";
import { TermTranslationsDialog } from "@/components/TermTranslationsDialog";
type DialogState = {
  isOpen: boolean;
  term: BrandTerm | null;
};
export function BrandTermsView({ openAddDialog }: { openAddDialog: () => void }) {
  const { terms, loading, error, fetchTerms, deleteTerm } = useLokaStore(
    useShallow((state) => ({
      terms: state.brandTerms,
      loading: state.brandTermsLoading,
      error: state.brandTermsError,
      fetchTerms: state.fetchBrandTerms,
      deleteTerm: state.deleteBrandTerm,
    }))
  );
  const [editDialog, setEditDialog] = useState<DialogState>({ isOpen: false, term: null });
  const [deleteDialog, setDeleteDialog] = useState<DialogState>({ isOpen: false, term: null });
  const [translateDialog, setTranslateDialog] = useState<DialogState>({ isOpen: false, term: null });
  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);
  const openEditDialog = (term: BrandTerm) => setEditDialog({ isOpen: true, term });
  const openDeleteDialog = (term: BrandTerm) => setDeleteDialog({ isOpen: true, term });
  const openTranslateDialog = (term: BrandTerm) => setTranslateDialog({ isOpen: true, term });
  return (
    <>
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableCaption>
              {loading && "Loading brand terms..."}
              {error && `Error: ${error}`}
              {!loading && !error && terms.length === 0 && "No brand terms found. Add one to get started!"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Term</TableHead>
                <TableHead>Variations</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : (
                terms.map((term) => (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium">{term.term}</TableCell>
                    <TableCell>
                      {term.variations ? (
                        term.variations.split(',').map(v => <Badge key={v} variant="secondary" className="mr-1">{v.trim()}</Badge>)
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{term.notes}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openTranslateDialog(term)}>
                        <Languages className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(term)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(term)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {editDialog.term && (
        <TermFormDialog
          isOpen={editDialog.isOpen}
          setIsOpen={(isOpen) => setEditDialog({ isOpen, term: isOpen ? editDialog.term : null })}
          term={editDialog.term}
        />
      )}
      {translateDialog.term && (
        <TermTranslationsDialog
          isOpen={translateDialog.isOpen}
          setIsOpen={(isOpen) => setTranslateDialog({ isOpen, term: isOpen ? translateDialog.term : null })}
          term={translateDialog.term}
        />
      )}
      {deleteDialog.term && (
        <AlertDialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog({ isOpen, term: isOpen ? deleteDialog.term : null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the brand term "{deleteDialog.term.term}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteTerm(deleteDialog.term!.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Toaster richColors />
    </>
  );
}
type TermFormDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  term?: BrandTerm | null;
};
export function TermFormDialog({ isOpen, setIsOpen, term }: TermFormDialogProps) {
  const { addTerm, updateTerm } = useLokaStore(
    useShallow((state) => ({
      addTerm: state.addBrandTerm,
      updateTerm: state.updateBrandTerm,
    }))
  );
  const [formData, setFormData] = useState({
    term: term?.term || "",
    variations: term?.variations || "",
    notes: term?.notes || "",
  });
  useEffect(() => {
    if (term) {
      setFormData({
        term: term.term,
        variations: term.variations,
        notes: term.notes,
      });
    } else {
      setFormData({ term: "", variations: "", notes: "" });
    }
  }, [term]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (term) {
      await updateTerm({ ...term, ...formData });
    } else {
      await addTerm(formData);
    }
    setIsOpen(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{term ? "Edit" : "Add New"} Brand Term</DialogTitle>
            <DialogDescription>
              {term ? "Update the details for this brand term." : "Define a new term to ensure brand consistency in translations."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="term" className="text-right">Term</Label>
              <Input id="term" value={formData.term} onChange={handleChange} placeholder="e.g., Cloudflare" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="variations" className="text-right">Variations</Label>
              <Input id="variations" value={formData.variations} onChange={handleChange} placeholder="e.g., CF (comma-separated)" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Input id="notes" value={formData.notes} onChange={handleChange} placeholder="e.g., Always use full name" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Term</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}