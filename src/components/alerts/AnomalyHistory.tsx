import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, CheckCircle2, Clock, XCircle } from "lucide-react";

interface AnomalyRecord {
  id: string;
  timestamp: string;
  stock: string;
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  action: "resolved" | "pending" | "dismissed";
  actionDetails?: string;
}

interface AnomalyHistoryProps {
  records: AnomalyRecord[];
}

const actionConfig = {
  resolved: {
    icon: CheckCircle2,
    label: "Résolu",
    color: "text-green-500",
  },
  pending: {
    icon: Clock,
    label: "En attente",
    color: "text-yellow-500",
  },
  dismissed: {
    icon: XCircle,
    label: "Ignoré",
    color: "text-gray-500",
  },
};

const severityColors = {
  low: "bg-yellow-500/10 text-yellow-500",
  medium: "bg-orange-500/10 text-orange-500",
  high: "bg-red-500/10 text-red-500",
};

export function AnomalyHistory({ records }: AnomalyHistoryProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Historique des Alertes</h3>
        <Badge variant="secondary" className="ml-auto">
          {records.length} enregistrements
        </Badge>
      </div>

      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Sévérité</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Aucun historique disponible</p>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => {
                const ActionIcon = actionConfig[record.action].icon;
                return (
                  <TableRow key={record.id} className="hover:bg-accent/5">
                    <TableCell className="text-sm">
                      {new Date(record.timestamp).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {record.stock}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {record.description}
                    </TableCell>
                    <TableCell>
                      <Badge className={severityColors[record.severity]}>
                        {record.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ActionIcon
                          className={`w-4 h-4 ${actionConfig[record.action].color}`}
                        />
                        <span className="text-sm">
                          {actionConfig[record.action].label}
                        </span>
                      </div>
                      {record.actionDetails && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {record.actionDetails}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
