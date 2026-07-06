import React from "react";

interface FilterBarProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ options, selected, onSelect }) => {
  return (
    <div className="filter-tabs">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`filter-tab${selected === option ? " active" : ""}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
