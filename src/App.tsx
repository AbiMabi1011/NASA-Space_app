import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TopUtilityBar from './components/TopUtilityBar.js';
import Navbar from './components/Navbar.js';
import HeroSection from './components/HeroSection.js';
import QuickRibbon from './components/QuickRibbon.js';
import OverviewSection from './components/OverviewSection.js';
import MonitoringDashboard from './components/MonitoringDashboard.js';
import PlannerSection from './components/PlannerSection.js';
import ClimateSection from './components/ClimateSection.js';
import ServicesSection from './components/ServicesSection.js';
import NewsletterRibbon from './components/NewsletterRibbon.js';
import Footer from './components/Footer.js';
import TourModal from './components/TourModal.js';

import { getCatalogForClimate } from './core/cropCatalog.js';
import { buildSeasonStats } from './core/seasons.js';
import { rankRotations } from './core/rankingEngine.js';
import { SAMPLE, makeDemoHistory } from './api/sampleData.js';
import { fetchNasaPowerClimate } from './api/nasaPowerClient.js';
import { downloadFieldCardFile } from './ui/fieldCardExporter.js';
import { START_YEAR, END_YEAR, state as globalAppState } from './state/appState.js';
import {
  SoilType,
  WaterAccess,
  Priority,
  Season,
  DataMode,
  MonthlyClimate,
  ClimateRecord,
  CropRotation,
  SeasonStats
} from './types/index.js';

const SOIL_OPTIONS: Record<string, string> = {
  sandy: 'Sandy loam (Dry zone typical)',
  clay: 'Clay loam (Moisture retaining)',
  silt: 'Silty loam (Nutrient rich)'
};

const WATER_OPTIONS: Record<string, string> = {
  rainfed: 'Mostly rainfed (High drought exposure)',
  limited: 'Limited irrigation (Agro-well / tank)',
  reliable: 'Reliable irrigation (Canal / deep well)'
};

export default function App(): React.JSX.Element {
  const [latitude, setLatitude] = useState<number>(9.66);
  const [longitude, setLongitude] = useState<number>(80.02);
  const [soilType, setSoilType] = useState<SoilType | string>('sandy');
  const [soilPh, setSoilPh] = useState<number>(6.5);
  const [currentCrop, setCurrentCrop] = useState<string>('Rice');
  const [waterAccess, setWaterAccess] = useState<WaterAccess | string>('rainfed');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('water');
  const [selectedSeason, setSelectedSeason] = useState<Season>('yala');
  const [dataMode, setDataMode] = useState<DataMode>('sample');
  const [monthlyClimate, setMonthlyClimate] = useState<MonthlyClimate>({
    temp: [...SAMPLE.temp],
    rain: [...SAMPLE.rain]
  });
  const [seasonHistory, setSeasonHistory] = useState<ClimateRecord[]>(() => {
    const demo = makeDemoHistory(START_YEAR, END_YEAR);
    return demo.records;
  });
  const [gpmHistory, setGpmHistory] = useState<ClimateRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tourOpen, setTourOpen] = useState<boolean>(false);

  // Sync to globalAppState for backward compatibility / tests
  useEffect(() => {
    globalAppState.set({
      latitude,
      longitude,
      soilType,
      soilPh,
      currentCrop,
      waterAccess,
      selectedPriority,
      selectedSeason,
      dataMode,
      monthlyClimate,
      seasonHistory,
      gpmHistory
    });
  }, [
    latitude,
    longitude,
    soilType,
    soilPh,
    currentCrop,
    waterAccess,
    selectedPriority,
    selectedSeason,
    dataMode,
    monthlyClimate,
    seasonHistory,
    gpmHistory
  ]);

  const fetchClimateData = useCallback(async (lat: number, lon: number): Promise<void> => {
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
      alert('Enter valid latitude (−90 to 90) and longitude (−180 to 180).');
      return;
    }

    setIsLoading(true);
    try {
      const { records, normals, gpmHistory: gpmData } = await fetchNasaPowerClimate(lat, lon, START_YEAR, END_YEAR);
      setSeasonHistory(records);
      setGpmHistory(gpmData || []);
      setMonthlyClimate({
        temp: normals.map(v => v.temp),
        rain: normals.map(v => v.rainDaily)
      });
      setDataMode('nasa');
    } catch (err) {
      console.warn('NASA POWER API unavailable; falling back to labeled sample data.', err);
      const demo = makeDemoHistory(START_YEAR, END_YEAR, lat);
      setSeasonHistory(demo.records);
      setGpmHistory([]);
      setMonthlyClimate({
        temp: demo.normals.map(v => v.temp),
        rain: demo.normals.map(v => v.rainDaily)
      });
      setDataMode('sample');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchClimateData(9.66, 80.02);
  }, [fetchClimateData]);

  // Compute seasonal statistics with NASA data & dry threshold
  const stats: SeasonStats = useMemo(() => {
    return buildSeasonStats(selectedSeason, seasonHistory);
  }, [selectedSeason, seasonHistory]);

  // Dynamic ranking of top 3 rotations tailored to location, climate, soil & crop conditions
  const rankedRotations: CropRotation[] = useMemo(() => {
    const candidateCatalog = getCatalogForClimate(latitude, stats.meanTemp);
    return rankRotations(
      candidateCatalog,
      stats,
      soilType,
      selectedPriority,
      waterAccess,
      3,
      soilPh,
      currentCrop,
      latitude
    );
  }, [latitude, stats, soilType, selectedPriority, waterAccess, soilPh, currentCrop]);

  const handleDownloadFieldCard = useCallback((): void => {
    const seasonName = selectedSeason === 'yala' ? 'Yala' : 'Maha';
    const soilLabel = SOIL_OPTIONS[soilType] || 'Sandy loam';
    const waterAccessLabel = WATER_OPTIONS[waterAccess] || 'Mostly rainfed';
    const dataLabel = dataMode === 'nasa'
      ? `NASA POWER ${START_YEAR}–${END_YEAR}`
      : 'Illustrative sample data; NASA unavailable';

    downloadFieldCardFile({
      latitude,
      longitude,
      soilLabel,
      soilPh,
      currentCrop,
      waterAccessLabel,
      seasonName,
      priority: selectedPriority,
      dataLabel,
      stats,
      rankedItems: rankedRotations
    });
  }, [
    latitude,
    longitude,
    soilType,
    soilPh,
    currentCrop,
    waterAccess,
    selectedSeason,
    selectedPriority,
    dataMode,
    stats,
    rankedRotations
  ]);

  return (
    <div id="appRoot">
      <TopUtilityBar />
      <Navbar onOpenTour={() => setTourOpen(true)} />
      <HeroSection
        latitude={latitude}
        longitude={longitude}
        onSelectPreset={(lat, lon) => {
          setLatitude(lat);
          setLongitude(lon);
          fetchClimateData(lat, lon);
        }}
        meanTemp={stats.meanTemp || 28.5}
        seasonalRain={stats.meanRain || 326}
        dryCount={stats.dryCount || 0}
        dryTotal={stats.rows ? stats.rows.length : 10}
        topRotation={rankedRotations[0]}
      />
      <QuickRibbon />

      <main className="main-body-content">
        <OverviewSection
          latitude={latitude}
          longitude={longitude}
          soilType={soilType}
          soilPh={soilPh}
          monthlyClimate={monthlyClimate}
          dataMode={dataMode}
          isLoading={isLoading}
        />

        <MonitoringDashboard
          latitude={latitude}
          longitude={longitude}
          currentCrop={currentCrop}
          soilType={soilType}
          soilPh={soilPh}
          stats={stats}
          dataMode={dataMode}
        />

        <PlannerSection
          latitude={latitude}
          setLatitude={setLatitude}
          longitude={longitude}
          setLongitude={setLongitude}
          onFetchClimate={fetchClimateData}
          soilType={soilType}
          setSoilType={setSoilType}
          soilPh={soilPh}
          setSoilPh={setSoilPh}
          currentCrop={currentCrop}
          setCurrentCrop={setCurrentCrop}
          waterAccess={waterAccess}
          setWaterAccess={setWaterAccess}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
          rankedRotations={rankedRotations}
          stats={stats}
          onDownloadFieldCard={handleDownloadFieldCard}
        />

        <ClimateSection
          latitude={latitude}
          longitude={longitude}
          stats={stats}
          monthlyClimate={monthlyClimate}
          dataMode={dataMode}
          gpmHistory={gpmHistory}
          selectedSeason={selectedSeason}
          onRefreshData={() => fetchClimateData(latitude, longitude)}
        />

        <ServicesSection />
        <NewsletterRibbon />
      </main>

      <Footer />
      <TourModal isOpen={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
