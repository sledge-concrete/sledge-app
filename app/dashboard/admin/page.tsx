import { Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { employees } from "@/lib/mock/employees";

export default function AdminPage() {
  return (
    <div>
      <PageHeader
        title="User Roles & Access"
        description="Manage users, roles, and access. Tablet generic login configured here."
      />
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {employees.map((e) => (
              <li key={e.id} className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{e.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{e.name}</div>
                  <div className="text-sm text-muted-foreground">{e.email}</div>
                </div>
                <Badge className="sledge-role-badge font-medium uppercase tracking-[0.04em] text-xs rounded-md px-4 py-2">
                  <Users className="mr-1 h-4 w-4" />
                  {e.role}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <p className="mt-4 text-sm text-muted-foreground">
        Add/edit users, role assignment, and tablet-mode passcode settings — coming next iteration.
      </p>
    </div>
  );
}
