"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { User, Phone } from "lucide-react";
import { useDebounce } from "use-debounce";

// SRP: Cmd+K global patient search command palette

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const router = useRouter();
  const { data: results = [], isLoading } = useGlobalSearch(debouncedQuery);

  // Register Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  function handleSelect(patientId: string) {
    router.push(`/patients/${patientId}`);
    onOpenChange(false);
    setQuery("");
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput
          placeholder="Search by name or phone…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && <CommandEmpty>Searching…</CommandEmpty>}
          {!isLoading && debouncedQuery && results.length === 0 && (
            <CommandEmpty>
              No patients found for &quot;{debouncedQuery}&quot;
            </CommandEmpty>
          )}
          {!debouncedQuery && (
            <CommandEmpty>Start typing to search patients…</CommandEmpty>
          )}
          {results.length > 0 && (
            <CommandGroup heading="Patients">
              {results.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={`${patient.name} ${patient.phone}`}
                  onSelect={() => handleSelect(patient.id)}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{patient.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {patient.age}y • {patient.gender}
                    </Badge>
                    {patient.visit_count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {patient.visit_count} visit
                        {patient.visit_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
