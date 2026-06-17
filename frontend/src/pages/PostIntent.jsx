import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../features/auth/hooks';
import { useCreateIntent } from '../features/intents/hooks';

const DESTINATIONS = [
  { value: 'RAILWAY_STATION', label: 'Railway Station' },
  { value: 'BUS_STAND', label: 'Bus Stand' },
  { value: 'CITY_CENTER', label: 'City Center' },
  { value: 'AIRPORT', label: 'Airport' },
];

function toLocalDatetimeValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function PostIntent() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useRequireAuth();
  const { mutateAsync, isPending } = useCreateIntent();

  useEffect(() => {
    document.title = 'Post an intent · Splitt';
  }, []);

  if (authLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  const [direction, setDirection] = useState('FROM_CAMPUS');
  const [otherPoint, setOtherPoint] = useState('');
  const [earliestTime, setEarliestTime] = useState('');
  const [latestTime, setLatestTime] = useState('');
  const [maxFare, setMaxFare] = useState('');
  const [error, setError] = useState('');

  if (authLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  const minDatetime = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5 - (d.getMinutes() % 5));
    d.setSeconds(0, 0);
    return toLocalDatetimeValue(d);
  })();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!otherPoint) return setError('Please select a destination.');
    if (!earliestTime) return setError('Please set an earliest time.');
    if (!latestTime) return setError('Please set a latest time.');
    if (new Date(latestTime) <= new Date(earliestTime)) {
      return setError('Latest time must be after earliest time.');
    }

    const payload = {
      direction,
      otherPoint,
      earliestTime: new Date(earliestTime).toISOString(),
      latestTime: new Date(latestTime).toISOString(),
      maxFare: maxFare ? Number(maxFare) : undefined,
    };

    try {
      await mutateAsync(payload);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Post an Intent</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            {[
              { value: 'FROM_CAMPUS', label: 'Going Out' },
              { value: 'TO_CAMPUS', label: 'Coming Back' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setDirection(value)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  direction === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="otherPoint" className="block text-sm font-medium text-gray-700 mb-1">
            Destination
          </label>
          <select
            id="otherPoint"
            value={otherPoint}
            onChange={(e) => setOtherPoint(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select destination</option>
            {DESTINATIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="earliestTime" className="block text-sm font-medium text-gray-700 mb-1">
            Earliest Departure
          </label>
          <input
            id="earliestTime"
            type="datetime-local"
            value={earliestTime}
            min={minDatetime}
            onChange={(e) => setEarliestTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="latestTime" className="block text-sm font-medium text-gray-700 mb-1">
            Latest Departure
          </label>
          <input
            id="latestTime"
            type="datetime-local"
            value={latestTime}
            min={earliestTime || minDatetime}
            onChange={(e) => setLatestTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="maxFare" className="block text-sm font-medium text-gray-700 mb-1">
            Max Fare (₹) <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="maxFare"
            type="number"
            min={1}
            value={maxFare}
            onChange={(e) => setMaxFare(e.target.value)}
            placeholder="Leave blank to match any fare"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50"
          >
            {isPending ? 'Posting...' : 'Post Intent'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 underline px-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
