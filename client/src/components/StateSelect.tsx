import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const StateSelect: React.FC<StateSelectProps> = ({
  value,
  onChange,
  placeholder = "Select State",
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-[#1a1a1a] border-[#555] text-white h-10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-[#111] text-white border-[#444]">
        {INDIAN_STATES.map((state) => (
          <SelectItem
            key={state}
            value={state}
            className="cursor-pointer text-sm"
          >
            {state}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

