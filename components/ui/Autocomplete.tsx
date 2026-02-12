import React, { useState, useRef, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from './Input';

export interface AutocompleteOption {
    id: string;
    label: string;
    subLabel?: string;
}

interface AutocompleteProps {
    options: AutocompleteOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    required?: boolean;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Selecione...',
    label,
    className = '',
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync initial query with selected option when component mounts or value changes
    useEffect(() => {
        const selectedOption = options.find((opt) => opt.id === value);
        if (selectedOption) {
            setQuery(selectedOption.label);
        } else if (value === '') {
            setQuery('');
        }
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Reset query to selected label if closing without selection
                const selectedOption = options.find((opt) => opt.id === value);
                setQuery(selectedOption ? selectedOption.label : '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value, options]);

    const filteredOptions = query === '' && !isOpen
        ? []
        : options.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase()) ||
            (option.subLabel && option.subLabel.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 100); // Limit results for performance

    const handleSelect = (option: AutocompleteOption) => {
        onChange(option.id);
        setQuery(option.label);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && <label className="block text-sm font-medium mb-1">{label}</label>}
            <div className="relative">
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        const val = e.target.value;
                        setQuery(val);
                        setIsOpen(true);
                        // If the user clears the input, clear the selection
                        if (val === '') {
                            onChange('');
                        }
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    required={required}
                    className="pr-10"
                    autoComplete="off"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <Search size={16} />
                </div>
            </div>

            {isOpen && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-slate-800 dark:ring-slate-700">
                    {filteredOptions.length === 0 ? (
                        <li className="relative cursor-default select-none py-2 px-4 text-slate-500 dark:text-slate-400">
                            {query === '' ? 'Comece a digitar para buscar...' : 'Nenhum resultado encontrado.'}
                        </li>
                    ) : (
                        filteredOptions.map((option) => (
                            <li
                                key={option.id}
                                className={`relative cursor-pointer select-none py-2 pl-3 pr-9 transition-colors duration-150 ${option.id === value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                onClick={() => handleSelect(option)}
                            >
                                <div className="flex flex-col">
                                    <span className={`block truncate ${option.id === value ? 'font-semibold' : 'font-normal'}`}>
                                        {option.label}
                                    </span>
                                    {option.subLabel && (
                                        <span className={`block truncate text-xs ${option.id === value ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {option.subLabel}
                                        </span>
                                    )}
                                </div>

                                {option.id === value && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                                        <Check size={16} />
                                    </span>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};
