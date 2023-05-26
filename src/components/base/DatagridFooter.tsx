import { Button, Divider, Stack } from "@mui/material";
import { GridSlotsComponentsProps } from "@mui/x-data-grid";

declare module "@mui/x-data-grid" {
  interface FooterPropsOverrides {
    selectionCount: number;
    selectionItemsSum: number;
    selectionPriceSum: number;
    optionsShown?: boolean;
    buttonCallbacks?: {
      deleteSelected: () => void;
      clearAll: () => void;
    };
  }
}

interface IDatagridFooterProps {}

function formatDollars(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "HKD" });
}

export default function DatagridFooter(
  props: NonNullable<GridSlotsComponentsProps["footer"]> & IDatagridFooterProps
) {
  return (
    <Stack
      sx={{ marginLeft: 2 }}
      direction="row"
      spacing={2}
      alignItems="center"
      divider={<Divider orientation="vertical" flexItem />}
    >
      <div>{props.selectionCount} selected</div>
      <div>
        {props.selectionItemsSum} items,{" "}
        {formatDollars(props.selectionPriceSum ?? 0)}
      </div>
      {props.optionsShown && (
        <Button
          sx={{ color: "red" }}
          onClick={props.buttonCallbacks?.deleteSelected}
        >
          Delete selected
        </Button>
      )}
      {props.optionsShown && (
        <Button sx={{ color: "red" }} onClick={props.buttonCallbacks?.clearAll}>
          Clear all
        </Button>
      )}
    </Stack>
  );
}
