import { ArrowRight, ChevronDown, ChevronUp, Clock, Info, MapPin } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainClassInfo, TrainSearchResult } from '../types';

interface TrainCardProps {
  train: TrainSearchResult;
  journeyDate: string;
  passengersCount: number;
}

export const TrainCard: React.FC<TrainCardProps> = ({ train, journeyDate, passengersCount }) => {
  const navigate = useNavigate();
  const [selectedClassCode, setSelectedClassCode] = useState<string>(
    train.classes.length > 0 ? train.classes[0].code : ''
  );
  const [activeTab, setActiveTab] = useState<'none' | 'timetable' | 'coaches' | 'amenities'>('none');

  const selectedClass = train.classes.find((c) => c.code === selectedClassCode) || train.classes[0];

  const handleBookNow = (cls: TrainClassInfo) => {
    const params = new URLSearchParams({
      trainId: train.trainId,
      trainNumber: train.trainNumber,
      trainName: train.name,
      trainType: train.trainType,
      classCode: cls.code,
      className: cls.label,
      fromCode: train.originStation.code,
      fromName: train.originStation.name,
      toCode: train.destinationStation.code,
      toName: train.destinationStation.name,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      date: journeyDate,
      passengers: String(passengersCount),
      fare: String(cls.fare),
    });

    navigate(`/booking/${train.trainId}?${params.toString()}`);
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'RAC':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'WL':
        return 'text-orange-800 bg-orange-50 border-orange-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Top Strip: Train Meta & Type */}
      <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            {train.trainNumber}
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {train.name}
          </h3>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {train.trainType}
          </span>

          {train.districtConnect && train.districtConnect.length > 0 && (
            <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>Districts: {train.districtConnect.slice(0, 3).join(' ⇄ ')}{train.districtConnect.length > 3 ? ` +${train.districtConnect.length - 3} more` : ''}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Runs On:</span>
          <div className="flex gap-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <span
                key={idx}
                className="w-5 h-5 rounded-full bg-blue-100/70 text-blue-800 text-[10px] font-semibold flex items-center justify-center"
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Journey Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Departure */}
          <div className="md:col-span-3">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {train.departureTime}
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {train.originStation.code}
            </div>
            <div className="text-xs text-slate-500 truncate" title={train.originStation.name}>
              {train.originStation.name}
            </div>
          </div>

          {/* Duration & Stops Indicator */}
          <div className="md:col-span-4 text-center">
            <div className="text-xs font-semibold text-slate-600 mb-1 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{train.durationFormatted}</span>
              {train.dayOffset > 0 && (
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                  +{train.dayOffset} Day
                </span>
              )}
            </div>

            <div className="relative flex items-center justify-center my-1.5">
              <div className="w-full border-t-2 border-dashed border-slate-300"></div>
              <div className="absolute w-2 h-2 rounded-full bg-blue-600 left-0"></div>
              <div className="absolute w-2 h-2 rounded-full bg-blue-600 right-0"></div>
            </div>

            <div className="text-[11px] text-slate-400 mt-1">
              {train.intermediateStopsCount === 0
                ? 'Non-stop Direct Express'
                : `${train.intermediateStopsCount} Intermediate Stop${train.intermediateStopsCount > 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Arrival */}
          <div className="md:col-span-3 md:text-right">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {train.arrivalTime}
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {train.destinationStation.code}
            </div>
            <div className="text-xs text-slate-500 truncate" title={train.destinationStation.name}>
              {train.destinationStation.name}
            </div>
          </div>

          {/* Details & Drawer Controls */}
          <div className="md:col-span-2 flex flex-col items-end justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'timetable' ? 'none' : 'timetable')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>{activeTab === 'timetable' ? 'Hide Timetable' : 'Timetable & Stops'}</span>
              {activeTab === 'timetable' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'coaches' ? 'none' : 'coaches')}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <span>Coach Rake Layout</span>
            </button>
          </div>
        </div>

        {/* Travel Classes Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            Select Class & Availability
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {train.classes.map((cls) => {
              const isSelected = cls.code === selectedClassCode;
              const avail = cls.availability;

              return (
                <div
                  key={cls.code}
                  onClick={() => setSelectedClassCode(cls.code)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-600/10 bg-blue-50/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{cls.code}</span>
                    <span className="text-xs font-semibold text-slate-900 tabular-nums">
                      ₹{cls.fare.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mb-2">
                    {cls.label}
                  </div>

                  <div
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border flex items-center justify-between ${getAvailabilityColor(
                      avail.status
                    )}`}
                  >
                    <span>{avail.status}</span>
                    {avail.count !== null && (
                      <span className="font-mono tabular-nums">{avail.count}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Amenities Pill Line */}
          {train.amenities && train.amenities.length > 0 && (
            <div className="mt-3.5 flex items-center gap-2 flex-wrap text-[11px] text-slate-600">
              <span className="font-semibold text-slate-400">Amenities:</span>
              {train.amenities.map((am, i) => (
                <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  {am}
                </span>
              ))}
              {train.pantry && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                  Pantry Car
                </span>
              )}
            </div>
          )}

          {/* Selected Class Action Bar */}
          {selectedClass && (
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">{selectedClass.label} ({selectedClass.code})</span>
                  <span className="mx-2">·</span>
                  <span className="text-slate-600">Total for {passengersCount} traveler{passengersCount > 1 ? 's' : ''}:</span>
                  <span className="font-bold text-slate-900 text-sm ml-1 font-mono">
                    ₹{(selectedClass.fare * passengersCount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-amber-700 font-medium bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  DEMO Data · Authorized railway mock
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBookNow(selectedClass)}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Book Now ({selectedClass.code})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Timetable Drawer */}
        {activeTab === 'timetable' && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs animate-in fade-in duration-150">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Complete Timetable & Intermediate Halts ({train.name} - #{train.trainNumber})</span>
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                All scheduled passenger halts
              </span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="pb-2">Station & District</th>
                    <th className="pb-2">Platform</th>
                    <th className="pb-2">Arrives</th>
                    <th className="pb-2">Departs</th>
                    <th className="pb-2">Halt</th>
                    <th className="pb-2">Day</th>
                    <th className="pb-2">Distance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-mono text-slate-700">
                  {train.stops && train.stops.length > 0 ? (
                    train.stops.map((stop, sIdx) => {
                      const isFirst = sIdx === 0;
                      const isLast = sIdx === train.stops!.length - 1;
                      const isSourceOrDest = stop.stationCode === train.originStation.code || stop.stationCode === train.destinationStation.code;

                      return (
                        <tr key={stop.id || sIdx} className={isSourceOrDest ? 'bg-blue-50/40 font-semibold' : ''}>
                          <td className="py-2.5 font-sans font-medium text-slate-900">
                            <div className="flex items-center gap-2">
                              <span>{stop.stationName} ({stop.stationCode})</span>
                              {stop.district && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-sans">
                                  {stop.district}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-600 font-sans">
                            {stop.platform ? `PF #${stop.platform}` : 'PF 1'}
                          </td>
                          <td className="py-2.5">
                            {isFirst ? 'Source' : stop.arrivalTime}
                          </td>
                          <td className="py-2.5">
                            {isLast ? 'Destination' : stop.departureTime}
                          </td>
                          <td className="py-2.5 font-sans text-slate-600">
                            {isFirst || isLast ? '-' : `${stop.haltMinutes || 2}m`}
                          </td>
                          <td className="py-2.5 font-sans">Day {stop.dayOffset + 1}</td>
                          <td className="py-2.5 font-sans">{stop.distanceKm || 0} km</td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr>
                        <td className="py-2 font-sans font-medium text-slate-900">{train.originStation.name} ({train.originStation.code})</td>
                        <td className="py-2 font-sans">PF 1</td>
                        <td className="py-2">Source</td>
                        <td className="py-2">{train.departureTime}</td>
                        <td className="py-2 font-sans">-</td>
                        <td className="py-2 font-sans">Day 1</td>
                        <td className="py-2 font-sans">0 km</td>
                      </tr>
                      {train.intermediateStopsCount > 0 && (
                        <tr className="text-slate-400 font-sans italic">
                          <td colSpan={7} className="py-1 text-center bg-white/50">
                            ··· {train.intermediateStopsCount} intermediate stations ···
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2 font-sans font-medium text-slate-900">{train.destinationStation.name} ({train.destinationStation.code})</td>
                        <td className="py-2 font-sans">PF 1</td>
                        <td className="py-2">{train.arrivalTime}</td>
                        <td className="py-2">Destination</td>
                        <td className="py-2 font-sans">-</td>
                        <td className="py-2 font-sans">Day {train.dayOffset + 1}</td>
                        <td className="py-2 font-sans">End of run</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coach Composition Drawer */}
        {activeTab === 'coaches' && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs animate-in fade-in duration-150">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Coach Rake Composition & Marshaling</span>
              <span className="text-[11px] font-normal text-slate-500">Direction of travel: Left → Right</span>
            </h4>
            <div className="flex items-center gap-1.5 overflow-x-auto py-3">
              {(train.coachComposition && train.coachComposition.length > 0
                ? train.coachComposition
                : ['LOCO', 'SLR', 'GS', 'S1', 'S2', 'S3', 'B1', 'B2', 'A1', 'H1', 'PC', 'GS', 'EOG']
              ).map((coach, cIdx) => {
                const isLoco = coach.includes('LOCO') || coach.includes('DTC');
                const isPantry = coach.includes('PC');
                const isAC = coach.startsWith('B') || coach.startsWith('A') || coach.startsWith('H') || coach.startsWith('C') || coach.startsWith('EC');

                return (
                  <div
                    key={cIdx}
                    className={`shrink-0 px-2.5 py-2 rounded-lg border text-center font-mono text-[11px] shadow-2xs ${
                      isLoco
                        ? 'bg-red-600 text-white font-bold border-red-700'
                        : isPantry
                        ? 'bg-amber-100 text-amber-900 font-bold border-amber-300'
                        : isAC
                        ? 'bg-blue-600 text-white font-bold border-blue-700'
                        : 'bg-white text-slate-800 font-semibold border-slate-300'
                    }`}
                  >
                    <div>{coach}</div>
                    <div className="text-[9px] font-sans opacity-75 mt-0.5">#{cIdx + 1}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-600 inline-block"></span> Engine/Loco</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span> AC Coaches</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-200 inline-block"></span> Pantry/Kitchen</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white border border-slate-300 inline-block"></span> Sleeper/General</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
