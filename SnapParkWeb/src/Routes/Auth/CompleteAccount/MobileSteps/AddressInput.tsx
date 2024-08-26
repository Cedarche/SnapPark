import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import Autocomplete from "react-google-autocomplete";

import { EditProfilState, userState } from "@/Reusable/RecoilState";

const AutoCompleteKey = import.meta.env.VITE_AUTOCOMPLETE_KEY;

interface AddressInputProps {
  countryRestriction?: string[];
}

const AddressInput: React.FC<AddressInputProps> = ({ countryRestriction }) => {
  const [savedProfile, setSavedProfile] = useRecoilState(EditProfilState);
  const [userDetails, setUserDetails] = useRecoilState(userState);
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [locality, setLocality] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postcode, setPostcode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showFields, setShowFields] = useState(false);

  useEffect(() => {
    if (savedProfile.address) {
      if (savedProfile.address.street.length > 1) {
        setShowFields(true);
        const address = savedProfile.address;
        setAddress1(address.street);
        setAddress2(address.address2);
        setLocality(address.locality);
        setState(address.state);
        setPostcode(address.postalCode);
      }
    }
  }, [savedProfile]);

  useEffect(() => {
    const address = {
      street: address1,
      address2,
      locality,
      state,
      country,
      postalCode: postcode,
      latitude,
      longitude,
    };

    setSavedProfile((prevProfile) => ({
      ...prevProfile,
      address: address,
    }));
  }, [address1, locality, state, country, postcode, latitude, longitude]);

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    if (!place) return;
    console.log(place);

    let address1Value = "";
    let postcodeValue = "";
    let localityValue = "";
    let stateValue = "";
    let countryValue = "";

    place.address_components?.forEach((component) => {
      const componentType = component.types[0];
      switch (componentType) {
        case "street_number":
          address1Value = `${component.long_name} ${address1Value}`;
          break;
        case "route":
          address1Value += component.short_name;
          break;
        case "postal_code":
          postcodeValue = `${component.long_name}${postcodeValue}`;
          break;
        case "postal_code_suffix":
          postcodeValue = `${postcodeValue}-${component.long_name}`;
          break;
        case "locality":
          localityValue = component.long_name;
          break;
        case "administrative_area_level_1":
          stateValue = component.short_name;
          break;
        case "country":
          countryValue = component.long_name;
          break;
      }
    });

    setAddress1(address1Value);

    setLocality(localityValue);
    setState(stateValue);
    setCountry(countryValue);
    setPostcode(postcodeValue);

    if (place.geometry?.location) {
      setLatitude(place.geometry.location.lat());
      setLongitude(place.geometry.location.lng());
    }
    setShowFields(true);
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-medium leading-6 text-gray-600">
        Office Address:
        <Autocomplete
          apiKey={AutoCompleteKey}
          language={"en"}
          options={{
            componentRestrictions: { country: countryRestriction || [] },
            types: [],
            fields: ["address_components", "geometry.location"],
          }}
          // onChange={(e) => setAddress1(e.target.value)}
          onPlaceSelected={handlePlaceSelected}
          defaultValue={address1}
          // onPlaceSelected={(place) => {
          //   console.log(place);
          // }}
          className="block w-full min-w-full text-[14px] font-normal rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        />
      </label>
      {!showFields && (
        <div
          onClick={() => setShowFields(true)}
          className="w-full flex justify-end text-xs font-medium leading-6 text-blue-600 hover:text-blue-400 cursor-pointer"
        >
          Or manually input address
        </div>
      )}

      {showFields && (
        <>
          <label className="block text-xs font-medium leading-6 text-gray-600 mt-1">
            Address Line 2:
            <input
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Address line 2"
              className="block w-full min-w-full text-[14px] font-normal rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </label>
          <label className="block text-xs font-medium leading-6 text-gray-600 mt-1">
            Suburb:
            <input
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="block w-full min-w-full text-[14px] font-normal rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            />
          </label>
          <div className="w-full inline-flex gap-x-2 items-center justify-start">
            <label className="block text-xs font-medium leading-6 text-gray-600 mt-1">
              State:
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="block w-full min-w-full text-[14px] font-normal rounded-md border-0 max-w-[100px] py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              />
            </label>
            <label className="block text-xs font-medium leading-6 text-gray-600 mt-1">
              Postal Code:
              <input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="block w-full min-w-full max-w-[100px] text-[14px] font-normal rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default AddressInput;
