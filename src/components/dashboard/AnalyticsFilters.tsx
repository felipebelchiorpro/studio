"use client";

import * as React from "react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Filter } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { biDashboardSalesChannels, biDashboardStates, mockCategories } from "@/data/mockData";

export function AnalyticsFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL or defaults
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: fromParam ? new Date(fromParam) : subDays(new Date(), 29),
        to: toParam ? new Date(toParam) : new Date(),
    });

    const handleApplyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (dateRange?.from) params.set("from", dateRange.from.toISOString());
        if (dateRange?.to) params.set("to", dateRange.to.toISOString());
        // Add other filters here as they become real

        router.push(`/dashboard/bi-analytics?${params.toString()}`);
    };

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                    <Filter className="mr-2 h-5 w-5 text-primary" />
                    Filtros Globais
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    `${format(dateRange.from, "LLL dd, y", { locale: ptBR })} - ${format(
                                        dateRange.to,
                                        "LLL dd, y",
                                        { locale: ptBR }
                                    )}`
                                ) : (
                                    format(dateRange.from, "LLL dd, y", { locale: ptBR })
                                )
                            ) : (
                                <span>Escolha um período</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            locale={ptBR}
                        />
                    </PopoverContent>
                </Popover>

                {/* Placeholders for filters that don't have backend support yet */}
                <Select disabled>
                    <SelectTrigger>
                        <SelectValue placeholder="Canal de Venda (Em breve)" />
                    </SelectTrigger>
                    <SelectContent>
                        {biDashboardSalesChannels.map((channel) => (
                            <SelectItem key={channel.id} value={channel.id}>
                                {channel.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select disabled>
                    <SelectTrigger><SelectValue placeholder="Categoria (Em breve)" /></SelectTrigger>
                    <SelectContent>
                        {mockCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select disabled>
                    <SelectTrigger><SelectValue placeholder="Estado (Em breve)" /></SelectTrigger>
                    <SelectContent>
                        {biDashboardStates.map(state => <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                    onClick={handleApplyFilters}
                >
                    Aplicar Filtros
                </Button>
            </CardContent>
        </Card>
    );
}
