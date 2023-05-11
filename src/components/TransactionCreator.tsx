import * as React from "react";
import "./STransactionCreator.css";
import { Button, TextField } from "@mui/material";
import Stack from "@mui/material/Stack";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { GridApiCommunity } from "@mui/x-data-grid/internals";

export interface ITransactionCreatorProps {}

export default function TransactionCreator({
  itemsDict,
}: {
  itemsDict: Item[];
}) {
  const [items, setItems] = useState<TransactionItem[]>([]);
  let idCounter = 0;

  const productIdInputRef = useRef<HTMLInputElement>();
  const [productIdInput, setProductIdInput] = useState<string>("");

  const dataGridRef = useGridApiRef();

  const [quantity, setQuantity] = useState<number>();

  function addItem(productId: string, quantity: number) {
    console.log("iDict", itemsDict);
    const item = itemsDict.find((item) => item.id === productId);
    console.log("item", item);
    if (!item) return;
    idCounter += 1;
    const transItem = {
      id: idCounter,
      item,
      quantity,
      price: item.price * quantity,
    };
    setItems([...items, transItem]);
    console.log(items);
    dataGridRef.current.updateRows([transItem]);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!productIdInputRef.current) return;

    addItem(productIdInput, quantity ?? 1);
    productIdInputRef.current.value = "";
    setProductIdInput("");
  }

  function onQuantityChange(e: ChangeEvent<HTMLInputElement>) {
    setQuantity(Number(e.target.value)  );
  }

  return (
    <div>
      <Stack direction="column" spacing={2}>
        <Stack direction="row" spacing={2}>
          <form className="transaction-input-form" onSubmit={handleSubmit}>
            <TextField
              inputRef={productIdInputRef}
              id="outlined-basic"
              label="Scan Product ID"
              variant="outlined"
              onInput={(e: ChangeEvent<HTMLInputElement>) =>
                setProductIdInput(e.target.value)
              }
            />
            <Button variant="contained">暖包$3</Button>
            <Button variant="contained">暖包$5</Button>
            <Button variant="contained">間尺$5</Button>
            <Button variant="contained">File $2</Button>
            <Button variant="contained">單行$3</Button>{" "}
            <FormControl>
              <RadioGroup
                row
                name="position"
                defaultValue="top"
                onChange={onQuantityChange}
              >
                <FormControlLabel
                  value="1"
                  control={<Radio />}
                  label="x1"
                  labelPlacement="top"
                />
                <FormControlLabel
                  value="2"
                  control={<Radio />}
                  label="x2"
                  labelPlacement="top"
                />
                <FormControlLabel
                  value="3"
                  control={<Radio />}
                  label="x3"
                  labelPlacement="top"
                />
                <FormControlLabel
                  value="4"
                  control={<Radio />}
                  label="x4"
                  labelPlacement="top"
                />
                <FormControlLabel
                  value="5"
                  control={<Radio />}
                  label="x5"
                  labelPlacement="top"
                />
              </RadioGroup>
            </FormControl>
          </form>
        </Stack>
        <div style={{ height: "100%", width: "100%" }}>
          <DataGrid
            apiRef={dataGridRef}
            rows={items}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
              columns: {
                columnVisibilityModel: {
                  id: false,
                },
              },
            }}
            pageSizeOptions={[5, 10, 15, 20]}
            checkboxSelection
          />
        </div>
      </Stack>
    </div>
  );
}

const columns: GridColDef[] = [
  // { field: "id", }
  {
    field: "id",
  },
  {
    field: "item",
    headerName: "Item",
    width: 350,
    valueGetter: ({ row }) => row.item.title,
  },
  {
    field: "quantity",
    headerName: "Qty.",
    type: "number",
    width: 90,
  },
  { field: "price", headerName: "Price", type: "number", width: 90 },
];
