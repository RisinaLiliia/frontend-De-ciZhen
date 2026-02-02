// src/app/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { TopBar } from "@/components/layout/TopBar";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCities, useServices } from "@/features/catalog/queries";
import { Field } from "@/components/ui/Field";
import { IconSearch, IconPin, IconChevronDown} from "@/components/ui/icons/icons";
import { WannPicker } from "@/components/request/WannPicker";
import type { Schedule } from "@/features/request/when.schema";

export default function HomePage() {
  const { data: cities, isLoading: citiesLoading, isError: citiesIsError, refetch: refetchCities } = useCities("DE");
  const { data: services, isLoading: servicesLoading, isError: servicesIsError, refetch: refetchServices } = useServices();

  const loading = citiesLoading || servicesLoading;
  const hasError = citiesIsError || servicesIsError;

  const [serviceKey, setServiceKey] = React.useState("");
  const [cityId, setCityId] = React.useState("");

 const [schedule, setSchedule] = React.useState<Schedule>({
  mode: "once",
  date: "", 
});

  React.useEffect(() => {
    if (hasError) toast.error("Fehler beim Laden der Daten. Bitte später erneut versuchen.");
  }, [hasError]);

 const serviceOptions = React.useMemo(
  () => (services ?? []).map((s) => ({ value: s.key, label: s.name })),
  [services]
);

const cityOptions = React.useMemo(
  () => (cities ?? []).map((c) => ({ value: c.id, label: c.name })),
  [cities]
);


  const canSubmit = Boolean(serviceKey && cityId);

  const scheduleParam = encodeURIComponent(JSON.stringify(schedule));

const href =
  `/request/new?service=${encodeURIComponent(serviceKey)}` +
  `&city=${encodeURIComponent(cityId)}` +
  `&schedule=${scheduleParam}`;

  const onRetry = async () => {
    toast.message("Aktualisiere…");
    await Promise.all([refetchCities(), refetchServices()]);
  };

  return (
    <div className="min-h-dvh">
      <TopBar />

      <main className="container-mobile min-h-[calc(100dvh-56px)] py-8 flex flex-col">
        <div className="stack-lg">
          <section className="text-center stack-sm">
            <h1 className="typo-h1">Finde zuverlässige Hilfe</h1>
            <p className="typo-muted">Haushalt & Services in deiner Nähe</p>
          </section>

          <section className="card stack-md">
            {loading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <Field leftIcon={<IconSearch />} rightIcon={<IconChevronDown />}>
  <Select
    options={serviceOptions}
    value={serviceKey}
    onChange={setServiceKey}
    aria-label="Service"
    placeholder="Was suchst du?"
    disabled={hasError}
  />
</Field>

<Field leftIcon={<IconPin />} rightIcon={<IconChevronDown />}>
  <Select
    options={cityOptions}
    value={cityId}
    onChange={setCityId}
    aria-label="Ort"
    placeholder="Stadt oder PLZ"
    disabled={hasError}
  />
</Field>
               <WannPicker value={schedule} onChange={setSchedule} disabled={hasError} />


                {hasError ? (
                  <button className="btn-primary" type="button" onClick={onRetry}>
                    Erneut versuchen
                  </button>
                ) : (
                  <Link
                    href={canSubmit ? href : "#"}
                    aria-disabled={!canSubmit}
                    className="btn-primary"
                    onClick={(e) => {
                      if (!canSubmit) {
                        e.preventDefault();
                        toast.message("Bitte Service und Ort auswählen.");
                      }
                    }}
                  >
                    Anfrage erstellen
                  </Link>
                )}

                
              </>
            )}
          </section>
        </div>

        <div className="flex-1" />
      </main>
    </div>
  );
}
