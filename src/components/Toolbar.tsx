import { Close, CloudDownload, Print } from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, Checkbox, IconButton, Popover, Slider, Stack, TextField, Toolbar, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { Column, Options } from "./MUITable";
import { UseReactToPrintFn } from "react-to-print";

interface Filter {
  key: string;
  type: "number" | "string" | "boolean";
  value?: string | boolean | number[];
}

interface FilterConfig {
  key: string;
  type: "number" | "string" | "boolean";
  min?: number;
  max?: number;
}

export interface CustomSelectedToolbarProps<T> {
  selected?: readonly T[];
  data?: T[];
}

interface EnhancedTableToolbarProps<T> {
  title: string;
  numSelected: number;
  selected: readonly T[];
  onFilterChange: (filterFunc: (row: T) => boolean) => void;
  onSearch: (query: string) => void;
  printFn: UseReactToPrintFn;
  columns: Column[];
  CustomToolbar?: React.FC;
  CustomSelectedToolbar?: React.FC<CustomSelectedToolbarProps<T>>;
  data?: T[];
  options?: Options;
}

export function EnhancedTableToolbar<T>(props: EnhancedTableToolbarProps<T>) {
  const { title, numSelected, selected, onFilterChange, onSearch, printFn, columns, CustomToolbar, CustomSelectedToolbar, data, options } = props;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterConfig, setFilterConfig] = useState<FilterConfig[]>([]);
  // rest value to force re-render of filters
  const [resetCounter, setResetCounter] = useState(0);
  const [openSearch, setOpenSearch] = useState(false);

  function downloadCSV(data: Record<string, any>[], filename: string = "data.csv"): void {
    // Base case
    if (data.length === 0) {
      console.warn("No data to export.");
      return;
    }

    // Create CSV content
    const headers = Object.keys(data[0] as Record<string, any>);
    const csvRows = data.map(obj =>
      headers.map(field => JSON.stringify(obj[field] ?? "")).join(",")
    );
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // Create Blob and download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  useEffect(() => {
    if (data && data.length > 0) {
      const inferredConfig = columns.map((column) => {
        const key = column.name;
        const values = data.map((row) => (row as Record<string, any>)[key]);
        const isNumber = values.every((val) => typeof val === "number");
        const inferredType = isNumber ? "number" : typeof values[0] === "boolean" ? "boolean" : "string";
        return {
          key,
          type: inferredType as "number" | "string" | "boolean",
          min: isNumber ? Math.min(...values) : undefined,
          max: isNumber ? Math.max(...values) : undefined,
        };
      });
      setFilterConfig(inferredConfig);
    }
  }, [data, columns]);

  useEffect(() => {
    const newFilterFunc = (row: T) => {
      if (filters.length === 0) return true;
      return filters.every((filter) => {
        const rowValue = (row as Record<string, any>)[filter.key];
        if (filter.type === "number") {
          const [min, max] = filter.value as number[];
          return rowValue >= min && rowValue <= max;
        }
        if (filter.type === "string") {
          return rowValue.toString().toLowerCase().includes((filter.value as string).toLowerCase());
        }
        if (filter.type === "boolean") {
          return rowValue === filter.value;
        }
        return true;
      });
    };
    onFilterChange(newFilterFunc);
  }, [filters, onFilterChange]);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = () => {
    setOpenSearch((prev) => !prev);
  };

  const open = Boolean(anchorEl);

  const getFilter = (key: string): Filter | undefined =>
    filters.find((filter) => filter.key === key);

  const updateFilter = (updatedFilter: Filter) => {
    setFilters((prevFilters) => {
      const existingIndex = prevFilters.findIndex((filter) => filter.key === updatedFilter.key);
      if (existingIndex !== -1) {
        // Update existing filter
        const newFilters = [...prevFilters];
        newFilters[existingIndex] = updatedFilter;
        return newFilters;
      }
      // Add new filter
      return [...prevFilters, updatedFilter];
    });
  };

  const removeFilter = (key: string) => {
    setFilters((prevFilters) => prevFilters.filter((filter) => filter.key !== key));
  };

  const handleFilterChange = (key: string, value: any) => {
    if (value === undefined || value === null || value === "") {
      removeFilter(key);
    } else {
      const config = filterConfig.find((config) => config.key === key);
      if (!config) return;

      updateFilter({
        key,
        type: config.type,
        value,
      });
    }
  };

  const resetFilters = () => {
    setFilters([]);
    setResetCounter((prev) => prev + 1);
  };

  return (
    <Toolbar
      sx={[
        { px: { sm: 2 }, borderBottom: 1, borderColor: "divider" },
        numSelected > 0 && { bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity) },
      ]}
    >
      {numSelected > 0 ? (
        <>
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {options?.translations?.selectedTextRenderer
              ? options.translations.selectedTextRenderer(numSelected)
              : `${numSelected} selected`}
          </Typography>
          {CustomSelectedToolbar && (
            <CustomSelectedToolbar data={data} selected={selected} />
          )}
        </>
      ) : (
        <Stack
          direction="row"
          justifyContent="space-between"
          width="100%"
          alignItems="center"
        >
          {openSearch ? (
            <Stack direction="row" alignItems="center">
              <SearchIcon />
              <TextField
                placeholder={options?.translations?.searchPlaceholder || "Search..."}
                onChange={(e) => onSearch(e.target.value)}
                variant="standard"
                autoFocus
                fullWidth
                sx={{ marginLeft: 1 }}
              />
              <IconButton
                onClick={handleSearchChange}
                sx={{ '&:hover': { color: 'error.main' } }}
              >
                <Close />
              </IconButton>
            </Stack>
          ) : (

            <Typography
              sx={{ flex: "1 1 100%", alignContent: "center", paddingLeft: 1 }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              {title}
            </Typography>
          )}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={options?.translations?.searchTooltip || "Search"}>
              <IconButton onClick={handleSearchChange}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={options?.translations?.downloadTooltip || "Download CSV"}>
              <IconButton onClick={() => downloadCSV(data as Record<string, any>[], "data.csv")}>
                <CloudDownload />
              </IconButton>
            </Tooltip>
            <Tooltip title={options?.translations?.printTooltip || "Print"}>
              <IconButton onClick={() => printFn()}>
                <Print />
              </IconButton>
            </Tooltip>
            <Tooltip title={options?.translations?.filterTooltip || "Filter list"}>
              <IconButton onClick={handleOpen}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            {CustomToolbar && <CustomToolbar />}
          </Stack>
        </Stack>
      )}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: { sx: { width: "20%", padding: 2, boxShadow: 2 } }
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            {options?.translations?.filtersTitle || "Filters"}
          </Typography>
          <Button variant="contained" size="small" sx={{ height: "fit-content" }} onClick={resetFilters}>
            {options?.translations?.resetButtonText || "Reset"}
          </Button>
        </Stack>
        <Stack key={resetCounter}>
          {filterConfig.map(({ key, type, min, max }) => {
            const currentFilter = getFilter(key);
            return (
              <Box key={key}>
                <Typography variant="subtitle1">
                  {columns.find((cell) => cell.name === key)?.label}
                </Typography>
                {type === "number" && min !== undefined && max !== undefined && (
                  <Slider
                    value={[
                      (currentFilter?.value as number[] | undefined)?.[0] ?? min,
                      (currentFilter?.value as number[] | undefined)?.[1] ?? max,
                    ]}
                    onChange={(_, newValue) => {
                      const [newMin, newMax] = newValue as number[];
                      handleFilterChange(key, [newMin, newMax]);
                    }}
                    valueLabelDisplay="auto"
                    min={min || 0}
                    max={max || 100}
                    step={1}
                  />
                )}
                {type === "string" && (
                  <TextField
                    placeholder={options?.translations?.searchPlaceholder || "Search..."}
                    size="small"
                    value={(currentFilter?.value as string) || ""}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    sx={{
                      marginBottom: 1,
                      paddingY: 0.5,
                      width: "100%",
                    }}
                  />
                )}
                {type === "boolean" && (
                  <Box display="flex" alignItems="center">
                    <Checkbox
                      checked={currentFilter?.value === true}
                      onChange={(e) =>
                        handleFilterChange(key, e.target.checked)
                      }
                    />
                    {currentFilter && (
                      <Close
                        color="error"
                        sx={{ cursor: "pointer", fontSize: 15 }}
                        onClick={() => handleFilterChange(key, undefined)}
                      />
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </Popover>
    </Toolbar>
  );
}
