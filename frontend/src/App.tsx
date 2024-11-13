import { createSignal, onCleanup, onMount } from 'solid-js'

const corners = {
  TL: { lat: 30.356956, lon: 76.358519 },
  BL: { lat: 30.349577, lon: 76.359433 },
  BR: { lat: 30.351304, lon: 76.374070 },
  TR: { lat: 30.358625, lon: 76.373273 },
};

  // Function to calculate relative position of the user's location within the defined bounds
function calculatePosition (lat: number | null, lon: number | null): {top: string, left: string} {
  if (lat === null || lon === null) return { top: "50%", left: "50%" }

  // Calculate the differences between the latitudes and longitudes of the corners
  const latDiff = corners.TL.lat - corners.BL.lat;
  const lonDiff = corners.TL.lon - corners.TR.lon;

  // Calculate the position of the user in the image's coordinates
  const latRatio = (lat - corners.BL.lat) / latDiff;
  const lonRatio = (corners.TR.lon - lon) / lonDiff;

  const top = `${latRatio * 100}%`;
  const left = `${lonRatio * 100}%`;

  return { top, left };
};

export default function App() {
  const [position, setPosition] = createSignal<{ lat: number | null; lon: number | null }>({
    lat: null,
    lon: null,
  })

  let watchNumber: number

  // Start geolocation tracking on mount
  onMount(() => {
    watchNumber = navigator.geolocation.watchPosition((pos) => {
      setPosition({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      })

      setPositionStyle(calculatePosition(pos.coords.latitude, pos.coords.longitude))

      console.log(pos)
    }, console.error, {
      enableHighAccuracy: true,
      maximumAge: 250,
      timeout: 5000,
    })
  })

  // Cleanup geolocation on unmount
  onCleanup(() => {
    if (navigator.geolocation) navigator.geolocation.clearWatch(watchNumber)
  })

  const [positionStyle, setPositionStyle] = createSignal(calculatePosition(position().lat, position().lon))

  return (
    <div class="relative w-full h-screen bg-gray-100">
      <h1 class="text-center text-3xl font-semibold my-4">Geolocation Tracker</h1>
      
      {/* Static image background (map or image constrained to the specified bounds) */}
      <div class="relative w-full h-full">
        <img
          src="https://via.placeholder.com/800x600" // Replace with your static background image
          alt="Map"
          class="w-full h-full object-cover"
        />
        
        {/* Pin representing user's position */}
        <div
          class="absolute w-8 h-8 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            top: positionStyle().top,
            left: positionStyle().left,
          }}
        ></div>
      </div>

      {/* Coordinates display */}
      <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 p-2 rounded">
        <p class="text-lg">Latitude: {position().lat ?? "Loading..."}</p>
        <p class="text-lg">Longitude: {position().lon ?? "Loading..."}</p>
      </div>
    </div>
  );
}

// TL: 30.356956, 76.358519
// BL: 30.349577, 76.359433
// BR: 30.351304, 76.374070
// TR: 30.358625, 76.373273


