import { useEffect, useRef } from 'react';

export default function SeismicMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Placeholder for map initialization
    const mapElement = mapRef.current;
    mapElement.innerHTML = `
      <div class="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
        <div class="absolute inset-0 flex items-center justify-center">
          <p class="text-gray-500">Interactive seismic map will be initialized here</p>
        </div>
        <div class="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <span class="h-3 w-3 rounded-full bg-green-500"></span>
              <span class="text-sm">Low Risk</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="h-3 w-3 rounded-full bg-yellow-500"></span>
              <span class="text-sm">Medium Risk</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="h-3 w-3 rounded-full bg-red-500"></span>
              <span class="text-sm">High Risk</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }, []);

  return <div ref={mapRef} className="w-full h-[400px]"></div>;
}