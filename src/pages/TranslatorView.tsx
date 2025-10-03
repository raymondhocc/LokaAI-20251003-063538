import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Copy,
  Loader2,
  ThumbsUp,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_LANGUAGES } from "@/lib/constants";
import { useLokaStore } from "@/lib/store";
import { chatService } from "@/lib/chat";
import { Toaster, toast } from "@/components/ui/sonner";
import { useShallow } from "zustand/react/shallow";
type TranslationStatus = "idle" | "loading" | "completed" | "error";
type TranslationResult = {
  langId: string;
  text: string;
  status: TranslationStatus;
};
export function TranslatorView() {
  const [sourceText, setSourceText] = useState("");
  const { defaultLanguages, addHistoryItem } = useLokaStore(
    useShallow((state) => ({
      defaultLanguages: state.settings.defaultLanguages,
      addHistoryItem: state.addHistoryItem,
    }))
  );
  const [targetLanguages, setTargetLanguages] = useState<string[]>(defaultLanguages);
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const sourceTextRef = useRef(sourceText);
  const selectedLanguages = useMemo(
    () =>
      AVAILABLE_LANGUAGES.filter((lang) => targetLanguages.includes(lang.id)),
    [targetLanguages]
  );
  const handleTranslate = async () => {
    if (!sourceText.trim() || targetLanguages.length === 0) {
      toast.error("Please enter source text and select at least one language.");
      return;
    }
    setIsTranslating(true);
    sourceTextRef.current = sourceText; // Capture source text at time of translation
    setTranslations(
      targetLanguages.map((langId) => ({
        langId,
        text: "",
        status: "loading",
      }))
    );
    const prompt = `Translate the following e-commerce product description. Source Text: "${sourceText}". Return the translations as a single JSON object where keys are the language IDs (${targetLanguages.join(', ')}) and values are the translated strings. Do not include any other text or explanation outside of the JSON object.`;
    const response = await chatService.sendMessage(prompt);
    if (response.success && response.data?.messages) {
        const lastMessage = response.data.messages[response.data.messages.length - 1];
        const aiResponse = lastMessage.content;
        try {
            const jsonString = aiResponse.replace(/```json\n?|```/g, "").trim();
            const parsedTranslations = JSON.parse(jsonString);
            const updatedTranslations = targetLanguages.map(langId => {
                const translatedText = parsedTranslations[langId];
                const langName = AVAILABLE_LANGUAGES.find(l => l.id === langId)?.name || langId;
                return {
                    langId,
                    text: translatedText || `Translation for ${langName} not found.`,
                    status: translatedText ? 'completed' : 'error' as TranslationStatus,
                };
            });
            setTranslations(updatedTranslations);
        } catch (error) {
            console.error("Failed to parse AI response:", error, "Response:", aiResponse);
            setTranslations(
                targetLanguages.map(langId => ({
                    langId,
                    text: "Error: Could not parse translation response.",
                    status: "error",
                }))
            );
            toast.error("Translation failed due to invalid response format.");
        }
    } else {
        setTranslations(
            targetLanguages.map(langId => ({
                langId,
                text: "Error: Could not fetch translation.",
                status: "error",
            }))
        );
        toast.error("Translation failed. Please try again.");
    }
    setIsTranslating(false);
  };
  const handleApprove = (langId: string, status: "Approved" | "Edited") => {
    const wordCount = sourceTextRef.current.split(/\s+/).filter(Boolean).length;
    addHistoryItem({
      sourceText: sourceTextRef.current,
      languages: [langId],
      status,
      wordCount,
    });
  };
  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Source Text (English)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your product description here..."
              className="min-h-[300px] resize-none"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Languages ({targetLanguages.length}) <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <DropdownMenuCheckboxItem
                      key={lang.id}
                      checked={targetLanguages.includes(lang.id)}
                      onCheckedChange={() => {
                        setTargetLanguages((prev) =>
                          prev.includes(lang.id)
                            ? prev.filter((id) => id !== lang.id)
                            : [...prev, lang.id]
                        );
                      }}
                    >
                      {lang.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button onClick={handleTranslate} disabled={isTranslating}>
              {isTranslating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Translate
            </Button>
          </CardFooter>
        </Card>
        <div className="space-y-8">
          {translations.length === 0 && (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center">
              <div className="space-y-2">
                <Wand2 className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  Your translations will appear here
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter source text, select languages, and click Translate.
                </p>
              </div>
            </div>
          )}
          {translations.map((result) => (
            <TranslationCard key={result.langId} result={result} onApprove={handleApprove} />
          ))}
        </div>
      </div>
      <Toaster richColors />
    </>
  );
}
function TranslationCard({ result, onApprove }: { result: TranslationResult; onApprove: (langId: string, status: "Approved" | "Edited") => void; }) {
  const language = AVAILABLE_LANGUAGES.find((l) => l.id === result.langId);
  const [isApproved, setIsApproved] = useState(false);
  const [editedText, setEditedText] = useState(result.text);
  const [isEdited, setIsEdited] = useState(false);
  useEffect(() => {
    setEditedText(result.text);
    setIsEdited(false);
  }, [result.text]);
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
    setIsEdited(e.target.value !== result.text);
  };
  const handleApproveClick = () => {
    setIsApproved(true);
    const finalStatus = isEdited ? "Edited" : "Approved";
    onApprove(result.langId, finalStatus);
    toast.success(`${language?.name} translation ${finalStatus.toLowerCase()} and saved to history!`);
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    toast.info("Copied to clipboard!");
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{language?.name || "Translation"}</CardTitle>
          {isApproved && <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"><Check className="mr-1 h-3 w-3" /> Approved</Badge>}
        </CardHeader>
        <CardContent>
          {result.status === "loading" ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <Textarea
              value={editedText}
              onChange={handleTextChange}
              className="min-h-[100px] resize-none"
              readOnly={isApproved}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={handleCopy} disabled={result.status !== 'completed'}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleApproveClick} disabled={isApproved || result.status !== 'completed'}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            {isEdited ? "Approve Edit" : "Approve"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}