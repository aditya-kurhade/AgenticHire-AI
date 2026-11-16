import React, { useState, useRef, useEffect, useId, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Universal Premium Dropdown Component
 * 
 * Works in two modes:
 * 1. Declarative Options Mode:
 *    <Dropdown options={['Option 1', 'Option 2']} value={val} onChange={setVal} />
 *    or with objects: <Dropdown options={[{ value: '1', label: 'One', icon: ... }]} />
 * 
 * 2. Children <option> Mode (Drop-in replacement for native select):
 *    <Dropdown value={val} onChange={(e) => setVal(e.target.value)}>
 *       <option value="1">One</option>
 *    </Dropdown>
 */
export const Dropdown = React.forwardRef(({
  options,
  children,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  icon: TriggerIcon,
  size = "default", // "sm" | "default" | "lg"
  align = "left", // "left" | "right"
  searchable = false,
  searchPlaceholder = "Search options...",
  clearable = false,
  disabled = false,
  multiple = false,
  className,
  menuClassName,
  renderOption,
  renderTrigger,
  name,
  id: propId,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const generatedId = useId();
  const dropdownId = propId || generatedId;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, searchable]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Normalize options: supports options prop OR children <option> tags
  const normalizedOptions = useMemo(() => {
    if (Array.isArray(options)) {
      return options.map((opt) => {
        if (typeof opt === "object" && opt !== null) {
          return {
            value: opt.value ?? opt.id ?? opt.name,
            label: opt.label ?? opt.name ?? String(opt.value),
            description: opt.description,
            icon: opt.icon,
            badge: opt.badge,
            disabled: !!opt.disabled
          };
        }
        return {
          value: opt,
          label: String(opt),
          disabled: false
        };
      });
    }

    if (children) {
      const parsed = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.props) {
          parsed.push({
            value: child.props.value !== undefined ? child.props.value : child.props.children,
            label: child.props.children || String(child.props.value || ""),
            disabled: !!child.props.disabled
          });
        }
      });
      return parsed;
    }

    return [];
  }, [options, children]);

  // Filtered by search
  const filteredOptions = normalizedOptions.filter((opt) =>
    String(opt.label).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opt.description && String(opt.description).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Selected item(s) lookup
  const isSelected = (val) => {
    if (multiple) {
      return Array.isArray(value) && value.some(v => String(v) === String(val));
    }
    return String(value) === String(val);
  };

  const selectedOption = !multiple
    ? normalizedOptions.find((opt) => String(opt.value) === String(value))
    : null;

  const selectedOptions = multiple && Array.isArray(value)
    ? normalizedOptions.filter((opt) => value.some(v => String(v) === String(opt.value)))
    : [];

  const handleSelect = (option) => {
    if (option.disabled) return;

    if (multiple) {
      const current = Array.isArray(value) ? [...value] : [];
      const exists = current.some(v => String(v) === String(option.value));
      const updated = exists
        ? current.filter((v) => String(v) !== String(option.value))
        : [...current, option.value];
      
      triggerChange(updated);
    } else {
      triggerChange(option.value);
      setIsOpen(false);
    }
  };

  const triggerChange = (newVal) => {
    if (!onChange) return;
    // Deliver synthetic event object so standard (e) => setSelected(e.target.value) works seamlessly
    const syntheticEvent = {
      target: { value: newVal, name },
      currentTarget: { value: newVal, name },
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    try {
      onChange(syntheticEvent);
    } catch {
      onChange(newVal);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    triggerChange(multiple ? [] : "");
  };

  const sizeClasses = {
    sm: "h-8 text-xs px-2.5",
    default: "h-9 text-xs sm:text-sm px-3",
    lg: "h-11 text-sm px-3.5"
  };

  return (
    <div className={cn("relative w-full text-left", className)} ref={dropdownRef}>
      {label && (
        <label 
          htmlFor={dropdownId} 
          className="block text-xs font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      {renderTrigger ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)}>
          {renderTrigger({ isOpen, selectedOption, selectedOptions, value })}
        </div>
      ) : (
        <button
          ref={ref}
          id={dropdownId}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            "w-full flex items-center justify-between gap-2 rounded-xl border bg-background font-medium text-foreground transition-all duration-150 shadow-2xs",
            "border-input hover:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
            isOpen && "border-ring ring-1 ring-ring",
            disabled && "cursor-not-allowed opacity-50 bg-secondary/50",
            error && "border-destructive focus:ring-destructive",
            sizeClasses[size]
          )}
          {...props}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
            {TriggerIcon && (
              <span className="text-muted-foreground shrink-0">
                {React.isValidElement(TriggerIcon) ? TriggerIcon : <TriggerIcon className="w-4 h-4" />}
              </span>
            )}

            {multiple ? (
              selectedOptions.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap truncate">
                  <span className="text-foreground truncate font-semibold">
                    {selectedOptions.length} selected
                  </span>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline truncate">
                    ({selectedOptions.map(o => o.label).join(", ")})
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground truncate font-normal">{placeholder}</span>
              )
            ) : selectedOption ? (
              <div className="flex items-center gap-2 truncate">
                {selectedOption.icon && (
                  <span className="shrink-0 text-muted-foreground">
                    {React.isValidElement(selectedOption.icon) ? selectedOption.icon : <selectedOption.icon className="w-3.5 h-3.5" />}
                  </span>
                )}
                <span className="truncate text-foreground font-semibold">{selectedOption.label}</span>
                {selectedOption.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-secondary text-muted-foreground shrink-0 border border-border">
                    {selectedOption.badge}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground truncate font-normal">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
            {clearable && ((multiple && selectedOptions.length > 0) || (!multiple && selectedOption)) && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="p-0.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isOpen && "rotate-180 text-foreground"
              )}
            />
          </div>
        </button>
      )}

      {/* Dropdown Menu / Flyout */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            "absolute z-50 mt-1.5 min-w-[12rem] w-full rounded-xl border border-border bg-popover text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 overflow-hidden",
            align === "right" ? "right-0" : "left-0",
            menuClassName
          )}
        >
          {/* Search Bar */}
          {searchable && (
            <div className="p-2 border-b border-border/70 bg-secondary/30">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-muted-foreground">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const selected = isSelected(opt.value);

                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors duration-100",
                      opt.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                      !opt.disabled && selected && "bg-primary/10 text-primary font-semibold",
                      !opt.disabled && !selected && "text-foreground hover:bg-accent/60",
                      opt.description && "py-2.5"
                    )}
                  >
                    {renderOption ? (
                      renderOption(opt, { selected })
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                          {opt.icon && (
                            <span className={cn("shrink-0", selected ? "text-primary" : "text-muted-foreground")}>
                              {React.isValidElement(opt.icon) ? opt.icon : <opt.icon className="w-4 h-4" />}
                            </span>
                          )}
                          <div className="min-w-0 truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="truncate">{opt.label}</span>
                              {opt.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-secondary text-muted-foreground shrink-0 border border-border">
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            {opt.description && (
                              <p className="text-[10px] text-muted-foreground font-normal truncate mt-0.5">
                                {opt.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {selected && (
                          <Check className="w-4 h-4 shrink-0 text-primary animate-in zoom-in-50" />
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  );
});

Dropdown.displayName = "Dropdown";
export default Dropdown;
