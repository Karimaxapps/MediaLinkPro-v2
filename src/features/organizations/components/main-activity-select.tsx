"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { type OrgType, MAIN_ACTIVITIES_BY_TYPE } from "../schema";

const OTHER = "__other__";

interface Props {
  orgType: OrgType | undefined;
  value: string;
  onChange: (value: string) => void;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  inputClassName?: string;
}

export function MainActivitySelect({
  orgType,
  value,
  onChange,
  triggerClassName,
  contentClassName,
  itemClassName,
  inputClassName,
}: Props) {
  const options = orgType ? (MAIN_ACTIVITIES_BY_TYPE[orgType] ?? []) : [];

  const valueInOptions = options.includes(value);
  const [isOther, setIsOther] = useState(() => !!value && !valueInOptions);

  // When org type changes, if the saved value no longer appears in the new list,
  // switch to "Other" mode so the custom text is preserved rather than silently dropped.
  useEffect(() => {
    const opts = orgType ? (MAIN_ACTIVITIES_BY_TYPE[orgType] ?? []) : [];
    if (value && !opts.includes(value)) {
      setIsOther(true);
    }
  }, [orgType]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectValue = isOther ? OTHER : value;

  const handleSelectChange = (v: string) => {
    if (v === OTHER) {
      setIsOther(true);
      // Don't overwrite the current custom value — user will type it in
      onChange("");
    } else {
      setIsOther(false);
      onChange(v);
    }
  };

  if (!orgType || options.length === 0) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Video Production, Broadcast Technology…"
        className={inputClassName}
      />
    );
  }

  return (
    <div className="space-y-2">
      <Select value={selectValue} onValueChange={handleSelectChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder="Select main activity…" />
        </SelectTrigger>
        <SelectContent className={`max-h-64 ${contentClassName ?? ""}`}>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className={itemClassName}>
              {opt}
            </SelectItem>
          ))}
          <SelectItem value={OTHER} className={itemClassName}>
            Other…
          </SelectItem>
        </SelectContent>
      </Select>

      {isOther && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your main activity…"
          className={inputClassName}
          autoFocus
        />
      )}
    </div>
  );
}
