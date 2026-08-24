import React, { useState } from 'react';
import { Sparkles, Users, Ticket, HeartHandshake, Coffee, Package, CheckSquare, Car, Activity, Plus } from 'lucide-react';

export const BOARD_SUGGESTIONS = [
  {
    id: 'demographics',
    title: 'Age Demographics',
    category: 'Demographics',
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    description: 'Track audience age distribution',
    branches: ['18–25', '26–40', '41–60', '60+']
  },
  {
    id: 'event-headcount',
    title: 'Event Headcount & Check-in',
    category: 'Events',
    icon: Ticket,
    color: 'from-violet-500 to-purple-600',
    description: 'Live attendance and visitor types',
    branches: ['General Admission', 'VIP Guests', 'Staff / Speakers', 'Walk-ins']
  },
  {
    id: 'customer-nps',
    title: 'Customer Satisfaction',
    category: 'Surveys',
    icon: HeartHandshake,
    color: 'from-emerald-500 to-teal-600',
    description: 'Instant customer feedback ratings',
    branches: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied']
  },
  {
    id: 'beverage-preference',
    title: 'Coffee & Drinks Order',
    category: 'Daily',
    icon: Coffee,
    color: 'from-amber-500 to-orange-600',
    description: 'Quick refreshment tallies for meetings',
    branches: ['Espresso / Latte', 'Iced Tea', 'Matcha', 'Still Water']
  },
  {
    id: 'inventory-audit',
    title: 'Stock & Inventory Audit',
    category: 'Logistics',
    icon: Package,
    color: 'from-rose-500 to-pink-600',
    description: 'Warehouse or retail condition tracking',
    branches: ['In Stock', 'Low Stock', 'Restock Ordered', 'Damaged / Waste']
  },
  {
    id: 'quick-poll',
    title: 'Team Decision / Poll',
    category: 'Voting',
    icon: CheckSquare,
    color: 'from-sky-500 to-cyan-600',
    description: 'Live in-person voting tally',
    branches: ['Option A', 'Option B', 'Option C', 'Abstain']
  },
  {
    id: 'traffic-count',
    title: 'Traffic & Commute Flow',
    category: 'Audit',
    icon: Car,
    color: 'from-indigo-500 to-blue-600',
    description: 'Vehicle and pedestrian flow audit',
    branches: ['Passenger Cars', 'Bicycles / Scooters', 'Pedestrians', 'Buses / Delivery']
  },
  {
    id: 'habit-tracker',
    title: 'Daily Wellness Check',
    category: 'Habits',
    icon: Activity,
    color: 'from-teal-500 to-emerald-600',
    description: 'Track team or personal daily habits',
    branches: ['Workout Done', '2L Water', 'Healthy Meal', '30m Reading']
  }
];

export default function SuggestionPresets({ onSelectPreset, isCreating = false }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Surveys', 'Events', 'Demographics', 'Daily', 'Logistics'];

  const filteredSuggestions = selectedCategory === 'All'
    ? BOARD_SUGGESTIONS
    : BOARD_SUGGESTIONS.filter((s) => s.category === selectedCategory);

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Suggested Templates</h3>
            <p className="text-xs text-slate-500">Tap any template to create a ready-to-tally board</p>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredSuggestions.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              type="button"
              disabled={isCreating}
              onClick={() => onSelectPreset(template)}
              className="text-left p-3.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/50 active:bg-indigo-100/60 border border-slate-200/70 hover:border-indigo-200 transition-all group flex flex-col justify-between gap-2 btn-spring"
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-2 rounded-xl bg-gradient-to-tr ${template.color} text-white shadow-xs shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {template.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="w-6 h-6 rounded-full bg-white group-hover:bg-indigo-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all shadow-xs shrink-0 mt-0.5">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {/* Branch Chips Preview */}
              <div className="flex flex-wrap items-center gap-1 mt-1">
                {template.branches.map((branch, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/80"
                  >
                    {branch}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
