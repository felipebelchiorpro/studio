
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Keep Button if needed for the icon wrapper
import { Search } from "lucide-react";
import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SearchBar({ onSearch, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    onSearch(query);
  };

  const handleSearchClick = () => {
    onSearch(query);
  };

  return (
    <div className="relative flex w-full items-center">
      <Input
        type="text"
        placeholder="Buscar suplementos..."
        value={query}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="h-12 text-base rounded-md bg-white text-gray-800 pl-4 pr-12 w-full border-transparent focus:ring-1 focus:ring-primary focus:border-transparent shadow-sm"
        aria-label="Buscar suplementos"
      />
      <button
        type="button"
        onClick={handleSearchClick}
        aria-label="Buscar"
        className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-primary hover:text-primary/80 transition-colors"
      // Removed explicit bg-transparent to allow focus ring to be more visible if input border is transparent
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}
