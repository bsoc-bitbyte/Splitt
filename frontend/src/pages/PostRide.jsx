import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../features/auth/hooks';
import { useCreateRide } from '../features/rides/hooks';

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

export default function PostRide() {
  const navigate = useNavigate();
  const { isLoading: authLoading } = useRequireAuth();
  const { mutateAsync, isPending } = useCreateRide();

  useEffect(() => {
    document.title = 'Post a ride · Splitt';
  }, []);

  if (authLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  const [direction, setDirection] = useState('FROM_CAMPUS');
  const [otherPoint, setOtherPoint] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [seatsTotal, setSeatsTotal] = useState(3);
  const [farePerHead, setFarePerHead] = useState('');
  const [notes, setNotes] = useState('');
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
    if (!departureTime) return setError('Please set a departure time.');
    if (!farePerHead || Number(farePerHead) < 1) return setError('Fare must be at least ₹1.');

    const payload = {
      direction,
      otherPoint,
      departureTime: new Date(departureTime).toISOString(),
      seatsTotal: Number(seatsTotal),
      farePerHead: Number(farePerHead),
      notes: notes.trim() || undefined,
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
      <h1 className="text-2xl font-bold mb-6">Post a Ride</h1>
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
          <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-1">
            Departure Time
          </label>
          <input
            id="departureTime"
            type="datetime-local"
            value={departureTime}
            min={minDatetime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSeatsTotal((s) => Math.max(2, s - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 text-lg leading-none flex items-center justify-center hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{seatsTotal}</span>
            <button
              type="button"
              onClick={() => setSeatsTotal((s) => Math.min(6, s + 1))}
              className="w-8 h-8 rounded-full border border-gray-300 text-lg leading-none flex items-center justify-center hover:bg-gray-100"
            >
              +
            </button>
            <span className="text-sm text-gray-500">(2–6)</span>
          </div>
        </div>

        <div>
          <label htmlFor="farePerHead" className="block text-sm font-medium text-gray-700 mb-1">
            Fare per Head (₹)
          </label>
          <input
            id="farePerHead"
            type="number"
            min={1}
            max={500}
            value={farePerHead}
            onChange={(e) => setFarePerHead(e.target.value)}
            placeholder="e.g. 50"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes <span className="text-gray-400 font-normal">(optional, {notes.length}/200)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            maxLength={200}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Leaving from hostel gate"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50"
          >
            {isPending ? 'Posting...' : 'Post Ride'}
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
