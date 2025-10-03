import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useLokaStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
export function HistoryView() {
  const { history, loading, error, fetchHistory } = useLokaStore(
    useShallow((state) => ({
      history: state.history,
      loading: state.historyLoading,
      error: state.historyError,
      fetchHistory: state.fetchHistory,
    }))
  );
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  const totalWords = history.reduce((acc, item) => acc + item.wordCount, 0);
  const editRate = history.length > 0 ? ((history.filter(h => h.status === 'Edited').length / history.length) * 100).toFixed(1) : "0.0";

  const analyticsData = history.reduce((acc, item) => {
    const date = new Date(item.date);
    if (isNaN(date.getTime())) return acc; // Skip invalid dates

    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const key = `${year}-${date.getMonth()}`;

    if (!acc[key]) {
      acc[key] = { name: month, volume: 0, edits: 0, sortKey: date.getTime() };
    }

    acc[key].volume += 1;
    if (item.status === 'Edited') {
      acc[key].edits += 1;
    }

    return acc;
  }, {} as Record<string, { name: string; volume: number; edits: number; sortKey: number }>);

  const chartData = Object.values(analyticsData).sort((a, b) => a.sortKey - b.sortKey);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Translations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{history.length}</p>
            <p className="text-sm text-muted-foreground">Jobs completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Words Translated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalWords}</p>
            <p className="text-sm text-muted-foreground">Across all jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Edit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{editRate}%</p>
            <p className="text-sm text-muted-foreground">
              Percentage of jobs edited
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Translation Volume</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend />
              <Bar dataKey="volume" fill="hsl(var(--primary))" name="Translation Volume" />
              <Bar dataKey="edits" fill="hsl(var(--primary) / 0.5)" name="Edits" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Translation History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {loading && "Loading history..."}
              {error && `Error: ${error}`}
              {!loading && !error && history.length === 0 && "No translation history found."}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Source Text</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
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
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {item.sourceText}
                    </TableCell>
                    <TableCell>
                      {item.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="mr-1">
                          {lang.toUpperCase()}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          item.status === "Approved" &&
                            "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
                          item.status === "Edited" &&
                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
                          item.status === "Pending" &&
                            "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"
                        )}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}