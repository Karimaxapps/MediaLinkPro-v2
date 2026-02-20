'use client';

import { Control, FieldErrors, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from 'react';
import { searchCompanies } from '@/features/organizations/server/actions';
import { Loader2 } from 'lucide-react';

interface ProfessionalInfoFieldsProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    // Optional: Pass down existing values if needed for specialized logic, 
    // but watch() handles most cases.
}

export function ProfessionalInfoFields({ register, errors, watch, setValue }: ProfessionalInfoFieldsProps) {
    const [companyQuery, setCompanyQuery] = useState('');
    const [companies, setCompanies] = useState<{ id: string, name: string }[]>([]);
    const [showCompanyList, setShowCompanyList] = useState(false);
    const [isSearchingCompany, setIsSearchingCompany] = useState(false);

    // Skills handling - transforming comma string to array is often done at submit time,
    // but here we just need a text area for "comma separated skills".
    // If the parent form manages skills as an array, we might need a local state 
    // or a controlled input that joins/splits.
    // OPTION: We'll assume the form uses a simple string input for easy editing, 
    // and the parent converts it to array on submit, OR we handle it here.
    // For simplicity with shared components, let's treat it as a string in the UI.
    const [skillsInput, setSkillsInput] = useState('');

    // Sync skills input with form value if it comes in as array or string from parent
    // usage in ProfileEditSheet suggests it might be handled separately there.
    // Let's rely on the parent to pass the correct defaultValues, but we need
    // to know if we register 'skills' as a string or handle it manually.
    // Based on schemas.ts: skills is z.array(z.string()).
    // We will use a local string state and update the form value on change.

    // Actually, looking at ProfileEditSheet, it converts array to string for display.
    // We should probably just pass a "skillsString" or similar, OR just use register if we change schema to accept string.
    // But since schema says array, let's handle the UI as string and setValue(array).

    useEffect(() => {
        const skillsVal = watch('skills');
        if (Array.isArray(skillsVal)) {
            setSkillsInput(skillsVal.join(', '));
        }
    }, []); // Run once on mount if we want to init, but better to control via props or just let parent handle data transformation?
    // To make it truly reusable/simple, let's assume the parent handles the "skills" field as an array in data,
    // but we render a text input that updates it.

    const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setSkillsInput(val);
        // Update form value as array
        const skillsArray = val.split(',').map(s => s.trim()).filter(s => s.length > 0);
        setValue('skills', skillsArray, { shouldDirty: true });
    };


    // Company Search Effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (companyQuery.length >= 2) {
                setIsSearchingCompany(true);
                const results = await searchCompanies(companyQuery);
                setCompanies(results || []);
                setIsSearchingCompany(false);
                setShowCompanyList(true);
            } else {
                setCompanies([]);
                setShowCompanyList(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [companyQuery]);

    const handleSelectCompany = (name: string) => {
        setValue('company', name, { shouldDirty: true });
        setCompanyQuery(name); // Update local query to match selection
        setShowCompanyList(false);
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="job_title" className="text-gray-300">Job Title</Label>
                <Input
                    id="job_title"
                    {...register('job_title')}
                    placeholder="Senior Product Designer"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                />
                {errors.job_title && (
                    <p className="text-sm text-red-500">{errors.job_title.message as string}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="job_function" className="text-gray-300">Job Function</Label>
                <Select
                    onValueChange={(value) => setValue('job_function', value, { shouldDirty: true })}
                    defaultValue={watch('job_function') || ''}
                >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:ring-[#C6A85E] focus:border-[#C6A85E]">
                        <SelectValue placeholder="Select a job function" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F24] border-white/10 text-white">
                        <SelectItem value="C-Suite">C-Suite</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Creative">Creative</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
                {errors.job_function && (
                    <p className="text-sm text-red-500">{errors.job_function.message as string}</p>
                )}
            </div>

            <div className="grid gap-2 relative">
                <Label htmlFor="company" className="text-gray-300">Company</Label>
                <Input
                    id="company"
                    placeholder="Company Name"
                    {...register('company')}
                    onChange={(e) => {
                        setValue('company', e.target.value, { shouldDirty: true });
                        setCompanyQuery(e.target.value);
                    }}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                />
                {showCompanyList && companyQuery.length >= 2 && (
                    <div className="absolute top-[75px] w-full bg-[#1A1F24] border border-white/10 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        {isSearchingCompany ? (
                            <div className="p-3 text-sm text-gray-400 flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
                            </div>
                        ) : companies.length > 0 ? (
                            <ul>
                                {companies.map((company) => (
                                    <li
                                        key={company.id}
                                        className="px-3 py-2 hover:bg-white/5 cursor-pointer text-sm text-white"
                                        onClick={() => handleSelectCompany(company.name)}
                                    >
                                        {company.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-3 text-sm text-gray-400">
                                No companies found. <button type="button" className="text-[#C6A85E] hover:underline" onClick={() => setShowCompanyList(false)}>Use current input</button>
                            </div>
                        )}
                    </div>
                )}
                {errors.company && (
                    <p className="text-sm text-red-500">{errors.company.message as string}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="skills" className="text-gray-300">Skills</Label>
                {/* 
                    NOTE: Component is loosely coupled. We expect the parent to likely manually specificy 'skills' handling 
                    if passing a complex object, but validation-wise we register nothing here directly if we use
                    controlled state. Alternatively, we can register a hidden input.
                */}
                <Textarea
                    id="skills"
                    // We don't register this directly because schema expects array, but input is string.
                    // We handle changes manually.
                    defaultValue={Array.isArray(watch('skills')) ? watch('skills').join(', ') : ''}
                    onChange={handleSkillsChange}
                    placeholder="React, Next.js, Video Editing (comma separated)"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                />
                <p className="text-xs text-gray-500">Separate skills with commas.</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="about" className="text-gray-300">Overview / Professional Background</Label>
                <Textarea
                    id="about"
                    className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                    placeholder="Detailed professional history..."
                    {...register('about')}
                />
                {errors.about && (
                    <p className="text-sm text-red-500">{errors.about.message as string}</p>
                )}
            </div>
        </div>
    );
}
