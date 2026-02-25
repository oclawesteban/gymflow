"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export type SearchableSelectOption = {
  value: string
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Selecciona una opción...",
  searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados.",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)

  const selected = options.find((opt) => opt.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between min-h-[48px] text-base font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate text-left">
            {selected ? (
              <span>
                {selected.label}
                {selected.sublabel && (
                  <span className="text-gray-400 text-sm ml-1">— {selected.sublabel}</span>
                )}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" style={{ minWidth: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
            <CommandInput
              placeholder={searchPlaceholder}
              className="h-11 flex-1 border-0 outline-none focus:ring-0 text-base"
            />
          </div>
          <CommandList className="max-h-64">
            <CommandEmpty className="py-6 text-center text-sm text-gray-500">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.sublabel ?? ""}`}
                  onSelect={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                  className="py-3 px-3 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100 text-blue-600" : "opacity-0"
                    )}
                  />
                  <span className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    {option.sublabel && (
                      <span className="text-xs text-gray-400">{option.sublabel}</span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
