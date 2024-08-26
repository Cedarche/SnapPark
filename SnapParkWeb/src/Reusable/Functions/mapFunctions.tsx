import { LatLng, FormattedResult } from "../Types/types";

  export function findParkingNearby(
    address: LatLng,
    radius: number = 500,
    callback: (results: FormattedResult[]) => void,
    maxRadius: number = 2000
  ): void {
    const map = new google.maps.Map(document.createElement("div"));
    const location = new google.maps.LatLng(address.latitude, address.longitude);
    const service = new google.maps.places.PlacesService(map);
  
    const request: google.maps.places.PlaceSearchRequest = {
      location: location,
      radius: radius,
      type: "parking"
    };
  
    service.nearbySearch(
      request,
      (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus,
        pagination: google.maps.places.PlaceSearchPagination | null
      ) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const filteredResults = results.filter(result =>
            result.business_status === "OPERATIONAL" &&
            !(result.types?.includes("shopping_mall") ||
              result.name?.includes("Staff") ||
              result.name?.includes("Motorcycle") ||
              result.name?.includes("Coaches") ||
              result.name?.includes("Bus"))
          );
  
          if (filteredResults.length >= 3) {
            filteredResults.sort((a, b) => {
              const locationA = a.geometry?.location;
              const locationB = b.geometry?.location;
              if (!locationA || !locationB) return 0; // Skip if any location is undefined
              return calculateDistance(location, locationA) - calculateDistance(location, locationB);
            });
            const closestResults = filteredResults.slice(0, 10);
  
            const formattedResults: FormattedResult[] = closestResults.map(place => {
              const latLng = place.geometry?.location;
              const lat = latLng?.lat();
              const lng = latLng?.lng();
              
              return {
                name: place.name || '', // Default to an empty string if undefined
                address: place.vicinity || '', // Default to an empty string if undefined
                geometry: {
                  lat: lat ?? 0,
                  lng: lng ?? 0,
                },
                distance: latLng ? calculateDistance(location, latLng) : 0,
                place_id: place.place_id || "", // Default to an empty string if undefined
                metadata: {
                  business_status: place.business_status,
                  types: place.types,
                  rating: place.rating,
                  user_ratings_total: place.user_ratings_total,
                  photos: place.photos, // Using 'any' for photos
                  icon: place.icon
                }
              };
            });
  
            callback(formattedResults);
          } else if (radius < maxRadius) {
            console.log(`Increasing search radius to ${radius + 500} meters.`);
            findParkingNearby(address, radius + 500, callback, maxRadius);
          } else {
            console.log("Max search radius reached without sufficient results.");
            callback([]); // Return an empty array if max radius reached without results
          }
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS && radius < maxRadius) {
          console.log(`Increasing search radius to ${radius + 500} meters.`);
          findParkingNearby(address, radius + 500, callback, maxRadius);
        } else {
          console.error("Failed to find parking locations:", status);
          callback([]); // Return an empty array if search failed
        }
      }
    );
  }
  
  function calculateDistance(center: google.maps.LatLng, placeLocation: google.maps.LatLng): number {
    const R = 6371; // Earth’s radius in kilometers
    const dLat = (placeLocation.lat() - center.lat()) * Math.PI / 180;
    const dLon = (placeLocation.lng() - center.lng()) * Math.PI / 180;
    const a =
      0.5 -
      Math.cos(dLat) / 2 +
      Math.cos(center.lat() * Math.PI / 180) * Math.cos(placeLocation.lat() * Math.PI / 180) *
      (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
  }
  