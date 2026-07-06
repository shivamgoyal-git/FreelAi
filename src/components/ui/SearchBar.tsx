import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchChange?: (val: string) => void;
  maxWidth?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  maxWidth = "360px",
  placeholder = "Search...",
  className = "",
  value,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onSearchChange) onSearchChange(e.target.value);
  };

  return (
    <div className="search-input-wrapper" style={{ flex: 1, maxWidth }}>
      <span className="search-input-icon">
        <Search size={14} />
      </span>
      <input
        type="text"
        className={`search-input ${className}`.trim()}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};

export default SearchBar;
