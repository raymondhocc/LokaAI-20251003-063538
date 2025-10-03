import { useState } from "react";
import { LokaSidebar } from "../components/LokaSidebar";
import { LokaLayout } from "../components/LokaLayout";
import { TranslatorView } from "./TranslatorView";
import { BrandTermsView } from "./BrandTermsView";
import { HistoryView } from "./HistoryView";
import { SettingsView } from "./SettingsView";
import { type NavLink } from "../lib/constants";
import { PlusCircle } from "lucide-react";
import { TermFormDialog } from "./BrandTermsView";
export function HomePage() {
  const [activeView, setActiveView] = useState<NavLink["id"]>("translator");
  const [isAddTermDialogOpen, setIsAddTermDialogOpen] = useState(false);
  const renderView = () => {
    switch (activeView) {
      case "translator":
        return <TranslatorView />;
      case "brand-terms":
        return <BrandTermsView openAddDialog={() => setIsAddTermDialogOpen(true)} />;
      case "history":
        return <HistoryView />;
      case "settings":
        return <SettingsView />;
      default:
        return <TranslatorView />;
    }
  };
  const getPrimaryAction = () => {
    if (activeView === "brand-terms") {
      return {
        label: "Add Term",
        onClick: () => setIsAddTermDialogOpen(true),
        icon: <PlusCircle className="mr-2 h-4 w-4" />
      };
    }
    return undefined;
  };
  return (
    <div className="min-h-screen w-full bg-gradient-main font-sans">
      <LokaSidebar activeView={activeView} setActiveView={setActiveView} />
      <LokaLayout activeView={activeView} primaryAction={getPrimaryAction()}>
        {renderView()}
      </LokaLayout>
      <TermFormDialog
        isOpen={isAddTermDialogOpen}
        setIsOpen={setIsAddTermDialogOpen} />
      <footer className="fixed bottom-4 right-8 text-sm text-muted-foreground">
        Built with ❤️ at Cloudflare
      </footer>
    </div>);
}