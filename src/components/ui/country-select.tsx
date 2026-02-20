"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
// Note needed since we aren't using command/popover yet, but Select instead
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { countries } from "@/lib/countries"

interface CountrySelectProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function CountrySelect({ value, onChange, disabled }: CountrySelectProps) {
    // Find selected country object to get the flag if needed, 
    // though SelectValue usually handles display if we pass children to SelectItem

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-[#C6A85E] focus:border-[#C6A85E]">
                <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent className="bg-[#0B0F14] border-white/10 text-white max-h-[300px]">
                {countries.map((country) => (
                    <SelectItem
                        key={country.code}
                        value={country.name}
                        className="focus:bg-white/10 focus:text-white cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <img
                                src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png 2x`}
                                width="20"
                                alt={country.name}
                                className="rounded-sm"
                            />
                            <span>{country.name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
